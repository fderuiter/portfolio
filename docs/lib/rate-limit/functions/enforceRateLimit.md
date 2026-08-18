[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/rate-limit](../README.md) / enforceRateLimit

# Function: enforceRateLimit()

> **enforceRateLimit**(`req`, `limiter?`): `Promise`\<[`RateLimitCheckResult`](../interfaces/RateLimitCheckResult.md)\>

Defined in: [lib/rate-limit.ts:29](https://github.com/fderuiter/portfolio/blob/main/lib/rate-limit.ts#L29)

Enforces sliding-window rate limiting on incoming API requests.
Employs anonymized identity hashing (SHA-256) using client IP and User-Agent
to protect user privacy while preventing DoS traffic spikes.

## Parameters

### req

`NextRequest`

The incoming NextRequest object.

### limiter?

`RegionRatelimit` = `defaultLimiter`

Optional custom Upstash Ratelimit instance.

## Returns

`Promise`\<[`RateLimitCheckResult`](../interfaces/RateLimitCheckResult.md)\>

Object containing limited status and optional 429 response.
