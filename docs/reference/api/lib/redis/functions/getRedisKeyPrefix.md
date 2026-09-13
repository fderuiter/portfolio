[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/redis](../README.md) / getRedisKeyPrefix

# Function: getRedisKeyPrefix()

> **getRedisKeyPrefix**(): `string`

Resolves the active key prefix for Upstash Redis operations.

Isolation policy:
1. If explicit UPSTASH_REDIS_KEY_PREFIX is provided, use it.
2. If VERCEL_ENV === "preview", isolate with "preview:" prefix to prevent
   ephemeral PR deployments from colliding with production queues or rate limits.
3. In production, default is "" (unprefixed) to maintain backward compatibility
   with existing queues and keys.
4. In test / dev environments, default is "" unless explicitly configured.

## Returns

`string`
