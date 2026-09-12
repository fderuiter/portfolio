[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/moderation](../README.md) / checkSubmissionAttemptRateLimit

# Function: checkSubmissionAttemptRateLimit()

> **checkSubmissionAttemptRateLimit**(`connectionHash`, `maxAttempts?`, `windowMs?`): `object`

Enforces anonymous rate limiting on content submission attempts using request hashes.

## Parameters

### connectionHash

`string`

### maxAttempts?

`number` = `10`

### windowMs?

`number` = `60000`

## Returns

`object`

### isRateLimited

> **isRateLimited**: `boolean`

### remaining

> **remaining**: `number`
