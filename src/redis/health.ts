import { RedisClientType, RedisClusterType } from 'redis';

import { RedisClient, withRedisTimeout } from './client';

export type HealthCheck = { ok: true } | { ok: false; error: string };

/**
 * Readiness ping timeout (ms). Tighter than the per-command default (2s) so
 * an unhealthy pod is detected and pulled out of the Service Endpoints
 * **before** business requests start piling up against the same wedged
 * connection.
 */
export const REDIS_HEALTH_TIMEOUT_MS = 1500;

function isCluster(client: RedisClient): client is RedisClusterType {
  // The single-client class does not expose a `masters` member, so its
  // presence is a reliable type discriminator on node-redis v4.
  return 'masters' in client;
}

async function pingOne(client: RedisClientType, timeoutMs: number, label: string): Promise<string> {
  return withRedisTimeout(client.ping(), timeoutMs, label);
}

/**
 * Ping Redis and return a structured result. **Never throws** — failures are
 * normalized to `{ ok: false, error }` so the caller can simply flip the HTTP
 * status to 503 without wrapping in try/catch.
 *
 * Cluster handling: node-redis 4.x does not expose `ping()` on the cluster
 * type because PING must be routed to a specific node. We ping **every**
 * master node concurrently — that way one dead shard is enough to flip
 * readiness to `degraded`, which matches the operational reality (the data
 * for that slot range is unavailable, and continuing to serve traffic to
 * this pod is dishonest).
 *
 * Error messages are intentionally surfaced as-is (timeout label, server
 * reply) for operator triage; they must not include secrets or internal
 * topology details.
 */
export async function checkRedisHealth(
  client: RedisClient,
  timeoutMs: number = REDIS_HEALTH_TIMEOUT_MS
): Promise<HealthCheck> {
  try {
    if (isCluster(client)) {
      const masters = client.masters;
      if (!masters || masters.length === 0) {
        return { ok: false, error: 'no master nodes available' };
      }
      const replies = await Promise.all(
        masters.map(async (master) => {
          const node = await client.nodeClient(master);
          return pingOne(node, timeoutMs, `health.ping[${master.address}]`);
        })
      );
      const bad = replies.filter((r) => r !== 'PONG');
      if (bad.length > 0) {
        return {
          ok: false,
          error: `unexpected ping reply from ${bad.length}/${replies.length} master(s)`,
        };
      }
      return { ok: true };
    }

    const pong = await pingOne(client, timeoutMs, 'health.ping');
    if (pong !== 'PONG') {
      return { ok: false, error: `unexpected ping reply: ${pong}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
