import { Logger } from '@nestjs/common';
import { createClient, createCluster, RedisClientType, RedisClusterType } from 'redis';

const logger = new Logger('Redis');

/**
 * Hard timeout for the initial connect (ms).
 *
 * Without it, if the Redis instance is gone but the TCP SYN is silently
 * dropped (autoscaling, NAT blackhole, cross-region flap), `client.connect()`
 * blocks for the OS default (~75s on Linux) and stalls every upstream request.
 */
const CONNECT_TIMEOUT_MS = 3000;

/**
 * TCP keepalive interval (ms). Default OS keepalive on Linux only fires after
 * ~2h; 30s probes surface half-dead sockets much earlier.
 */
const KEEPALIVE_MS = 30_000;

/**
 * Cap the offline command queue. node-redis buffers commands while the socket
 * is down; without a cap the queue grows until OOM. Hitting the cap rejects
 * immediately so backpressure propagates to callers.
 */
const COMMANDS_QUEUE_MAX_LENGTH = 1000;

/**
 * Default per-command soft timeout (ms).
 *
 * node-redis v4 has **no native per-command timeout**. On a half-dead socket
 * (TCP still open but server unreachable) every `client.get/set/hGetAll/…`
 * stays pending forever, which in turn stalls every Nest handler that touches
 * Redis.
 *
 * `createRedisClient()` returns a Proxy that auto-wraps every command method
 * with this timeout, so callers do **not** need to wrap promises manually.
 */
export const REDIS_COMMAND_TIMEOUT_MS = 2000;

/**
 * Methods that must **not** be wrapped with the auto timeout: lifecycle,
 * pub/sub (long-lived), blocking commands (caller-supplied timeout may exceed
 * ours), and low-level executors (already wrapped at a higher level).
 *
 * node-redis exposes both upper-case (`SUBSCRIBE`) and camelCase (`subscribe`)
 * aliases, so both forms must be listed.
 */
const NO_AUTO_TIMEOUT_METHODS: ReadonlySet<string> = new Set([
  'connect',
  'disconnect',
  'quit',
  'QUIT',
  'duplicate',
  'ref',
  'unref',

  'SUBSCRIBE',
  'subscribe',
  'UNSUBSCRIBE',
  'unsubscribe',
  'PSUBSCRIBE',
  'pSubscribe',
  'PUNSUBSCRIBE',
  'pUnsubscribe',
  'SSUBSCRIBE',
  'sSubscribe',
  'SUNSUBSCRIBE',
  'sUnsubscribe',
  'getPubSubListeners',
  'extendPubSubChannelListeners',
  'extendPubSubListeners',

  'BLPOP',
  'blPop',
  'BRPOP',
  'brPop',
  'BRPOPLPUSH',
  'brPopLPush',
  'BLMOVE',
  'bLMove',
  'BZPOPMAX',
  'bZPopMax',
  'BZPOPMIN',
  'bZPopMin',
  'XREAD',
  'xRead',
  'XREADGROUP',
  'xReadGroup',
  'WAIT',
  'wait',

  'executeIsolated',
  'sendCommand',
  'commandsExecutor',
  'functionsExecuter',
  'executeFunction',
  'scriptsExecuter',
  'executeScript',
  'multiExecutor',
]);

/**
 * Race a Redis operation against a timer; rejects with a labeled error after
 * `timeoutMs`. Most callers do not need this directly — `createRedisClient()`
 * already wraps every regular command. Use it for custom timeouts (e.g. a
 * shorter ping in health checks) or for whitelisted methods (pub/sub etc.).
 */
export async function withRedisTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = REDIS_COMMAND_TIMEOUT_MS,
  label = 'redis'
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`[redis] ${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

/**
 * Wrap a client (single or cluster) in a Proxy that auto-applies
 * REDIS_COMMAND_TIMEOUT_MS to every command method returning a Promise.
 *
 * Subtle rules — do not change without reading carefully:
 *
 * - `Reflect.get(target, prop, target)` (receiver = target, **not** the
 *   Proxy). node-redis getters such as `isReady` / `isOpen` read ES private
 *   fields (`#privateField`) on the original instance; if `this` flips to
 *   the Proxy you get "Cannot read private member from an object whose class
 *   did not declare it".
 * - Method values are returned as `fn.bind(target)` for the same reason
 *   (EventEmitter internals + private state must see the real `this`).
 * - Only Promise-returning calls get the timeout wrapper; methods like
 *   `multi()` (returns MultiCommand) or `scanIterator()` (returns
 *   AsyncIterable) naturally fall through.
 */
function wrapWithAutoTimeout<T extends object>(client: T): T {
  return new Proxy(client, {
    get(target, prop) {
      const value = Reflect.get(target, prop, target);

      if (typeof value !== 'function') {
        return value;
      }

      if (typeof prop !== 'string' || NO_AUTO_TIMEOUT_METHODS.has(prop)) {
        return value.bind(target);
      }

      const fn = value as (...args: unknown[]) => unknown;
      const label = prop;
      return (...args: unknown[]) => {
        const result = fn.apply(target, args);
        if (result && typeof (result as { then?: unknown }).then === 'function') {
          return withRedisTimeout(result as Promise<unknown>, REDIS_COMMAND_TIMEOUT_MS, label);
        }
        return result;
      };
    },
  }) as T;
}

/**
 * Either a single-node or a cluster Redis client. Consumers that only need
 * to issue commands can treat both the same way.
 */
export type RedisClient = RedisClientType | RedisClusterType;

/**
 * Cluster mode also exposes a `rootNodes` array (we attach it manually since
 * node-redis 4.6 does not expose a public getter). Used by the CacheModule
 * factory to decide between `redisInsStore` and `redisClusterInsStore`.
 */
export type RedisClusterClient = RedisClusterType & {
  rootNodes: Array<{ url: string }>;
};

const socketOptions = {
  connectTimeout: CONNECT_TIMEOUT_MS,
  keepAlive: KEEPALIVE_MS,
  reconnectStrategy: (retries: number) => Math.min(retries * 100, 2000),
};

/**
 * Create and connect a Redis client.
 *
 * `url` may be a comma-separated list — multiple entries trigger cluster
 * mode, a single entry uses standalone.
 *
 * Every option below addresses a specific production failure mode; do not
 * remove without reading the comment:
 *
 * 1. Half-dead connection reused after failover/autoscaling
 *    → `socket.keepAlive` (30s probes) + `socket.reconnectStrategy`.
 * 2. Initial connect hangs forever on dropped SYN
 *    → `socket.connectTimeout` (3s hard cap).
 * 3. Commands pending forever on a wedged socket
 *    → `wrapWithAutoTimeout` (2s per command).
 * 4. Aggressive reconnect storms after a redis blip
 *    → `reconnectStrategy` backs off linearly, capped at 2s.
 * 5. Offline queue OOM when redis is down for a long time
 *    → `commandsQueueMaxLength: 1000`.
 * 6. Unhandled `'error'` event crashes the Node process
 *    → explicit `'error'` listener (Nest logger).
 */
export async function createRedisClient(url: string): Promise<RedisClient> {
  const urls = url.split(',').filter(Boolean);
  if (urls.length === 0) {
    throw new Error(`Redis url error, url=${url}`);
  }

  if (urls.length > 1) {
    const rootNodes = urls.map((node) => ({ url: node }));
    const cluster = createCluster({
      rootNodes,
      defaults: {
        socket: socketOptions,
        commandsQueueMaxLength: COMMANDS_QUEUE_MAX_LENGTH,
      },
    });

    cluster.on('error', (err) => {
      logger.error(`cluster error: ${err instanceof Error ? err.message : String(err)}`);
    });

    try {
      await cluster.connect();
    } catch (err) {
      try {
        await cluster.disconnect();
      } catch {
        // best-effort cleanup; ignore secondary errors
      }
      throw err;
    }

    // node-redis 4.6 does not expose `rootNodes` on the cluster instance, but
    // the CacheModule factory needs it to pick the cluster store. Attach it
    // before wrapping so the Proxy.get trap can read it through the target.
    (cluster as unknown as RedisClusterClient).rootNodes = rootNodes;

    return wrapWithAutoTimeout(cluster) as RedisClusterType;
  }

  const client = createClient({
    url: urls[0],
    socket: socketOptions,
    commandsQueueMaxLength: COMMANDS_QUEUE_MAX_LENGTH,
  });

  client.on('error', (err) => {
    logger.error(`client error: ${err instanceof Error ? err.message : String(err)}`);
  });

  try {
    await client.connect();
  } catch (err) {
    try {
      await client.quit();
    } catch {
      // best-effort cleanup; ignore secondary errors
    }
    throw err;
  }

  return wrapWithAutoTimeout(client as RedisClientType);
}
