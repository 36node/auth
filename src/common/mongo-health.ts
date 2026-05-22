import { Connection } from 'mongoose';

export type HealthCheck = { ok: true } | { ok: false; error: string };

/**
 * Readiness ping timeout (ms). Same budget as the Redis health ping so the
 * two checks can run concurrently with a known upper bound.
 */
export const MONGO_HEALTH_TIMEOUT_MS = 1500;

/**
 * Ping MongoDB via `admin().command({ ping: 1 })` and return a structured
 * result. **Never throws** — failures are normalized to `{ ok: false, error }`.
 *
 * Notes:
 * - `connection.readyState` alone is not enough; the driver may still report
 *   "connected" (state=1) on a half-dead socket. An actual ping is the only
 *   reliable signal.
 * - `connection.db` is undefined until the first connection is established;
 *   we treat that as not-yet-ready rather than throwing.
 * - The ping itself uses `Promise.race` against a timer because the driver's
 *   own selection/operation timeouts are tied to the pool and can still
 *   leave this call pending under pool exhaustion / topology issues.
 */
export async function checkMongoHealth(
  connection: Connection,
  timeoutMs: number = MONGO_HEALTH_TIMEOUT_MS
): Promise<HealthCheck> {
  let timer: NodeJS.Timeout | undefined;
  try {
    if (!connection.db) {
      return { ok: false, error: 'mongo connection not yet initialized' };
    }
    const result = (await Promise.race([
      connection.db.admin().command({ ping: 1 }),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`[mongo] health.ping timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ])) as { ok?: number } | null | undefined;

    if (!result || result.ok !== 1) {
      return { ok: false, error: 'unexpected ping reply' };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
