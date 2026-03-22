import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

const globalForRedis = global as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 200, 2000),
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Connection options for BullMQ (avoids type conflict with bundled ioredis)
const parsed = new URL(redisUrl);
export const bullmqConnection = {
  host: parsed.hostname,
  port: parseInt(parsed.port || "6379", 10),
  password: parsed.password || undefined,
  maxRetriesPerRequest: null,
};
