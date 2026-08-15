import { Redis } from "@upstash/redis";

const createRedisClient = () => {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "http://localhost:8079",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "example_token",
  });
};

type RedisClientType = ReturnType<typeof createRedisClient>;

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
