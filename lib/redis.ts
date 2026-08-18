import { Redis } from "@upstash/redis";
import { getEnv } from "./env";

const createRedisClient = () => {
  const currentEnv = getEnv();
  return new Redis({
    url: currentEnv.UPSTASH_REDIS_REST_URL || "http://localhost:8079",
    token: currentEnv.UPSTASH_REDIS_REST_TOKEN || "example_token",
  });
};

type RedisClientType = ReturnType<typeof createRedisClient>;

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

export const redis = globalForRedis.redis ?? createRedisClient();

if (getEnv().NODE_ENV !== "production") globalForRedis.redis = redis;
