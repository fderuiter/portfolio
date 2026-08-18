[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/moderation](../README.md) / checkRequestSubmissionRateLimit

# Function: checkRequestSubmissionRateLimit()

> **checkRequestSubmissionRateLimit**(`reqOrHeaders?`, `maxAttempts?`, `windowMs?`): `object`

Defined in: [lib/moderation.ts:153](https://github.com/fderuiter/portfolio/blob/main/lib/moderation.ts#L153)

Synchronously computes anonymous connection hash and checks submission rate limit.

## Parameters

### reqOrHeaders?

[`RequestOrHeaders`](../../services/privacy-service/type-aliases/RequestOrHeaders.md)

### maxAttempts?

`number` = `10`

### windowMs?

`number` = `60000`

## Returns

`object`

### connectionHash

> **connectionHash**: `string`

### isRateLimited

> **isRateLimited**: `boolean`

### remaining

> **remaining**: `number`
