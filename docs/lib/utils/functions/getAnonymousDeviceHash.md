[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/utils](../README.md) / getAnonymousDeviceHash

# Function: getAnonymousDeviceHash()

> **getAnonymousDeviceHash**(`reqOrHeaders?`, `includeUserAgent?`): `string`

Defined in: [lib/utils.ts:179](https://github.com/fderuiter/portfolio/blob/main/lib/utils.ts#L179)

Computes an anonymous device hash incorporating trimmed proxy IP and optional User-Agent.
Standardizes client identification across telemetry and feedback endpoints.

## Parameters

### reqOrHeaders?

[`RequestOrHeaders`](../type-aliases/RequestOrHeaders.md)

### includeUserAgent?

`boolean` = `true`

## Returns

`string`
