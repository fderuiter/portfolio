[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/redis](../README.md) / isRedisConfigured

# Function: isRedisConfigured()

> **isRedisConfigured**(): `boolean`

Checks whether Upstash Redis is actively configured with valid credentials.
Returns false in local, test, or offline environments where dummy fallback
URLs or tokens are detected.

## Returns

`boolean`

True if valid Upstash Redis credentials are present in environment variables.
