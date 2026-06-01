import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!redis) {
    redis = new Redis({ url, token });
  }

  return redis;
}

export async function enqueueJob<TPayload extends Record<string, unknown>>(
  queue: string,
  payload: TPayload,
) {
  const client = getRedis();
  if (!client) return { queued: false };

  await client.lpush(queue, {
    ...payload,
    createdAt: new Date().toISOString(),
  });

  return { queued: true };
}
