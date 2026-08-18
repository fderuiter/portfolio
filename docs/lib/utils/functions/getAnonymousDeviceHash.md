[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/utils](../README.md) / getAnonymousDeviceHash

# Function: getAnonymousDeviceHash()

> **getAnonymousDeviceHash**(`reqOrHeaders?`, `includeUserAgent?`): `string`

Defined in: [lib/utils.ts:77](https://github.com/fderuiter/portfolio/blob/main/lib/utils.ts#L77)

Computes an anonymous device hash incorporating trimmed proxy IP and optional User-Agent.
Utility alias wrapper forwarding callers to standard privacy service hashing primitives.

## Parameters

### reqOrHeaders?

[`RequestOrHeaders`](../../services/privacy-service/type-aliases/RequestOrHeaders.md)

### includeUserAgent?

`boolean` = `true`

## Returns

`string`
