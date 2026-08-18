[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/privacy-service](../README.md) / extractClientIp

# Function: extractClientIp()

> **extractClientIp**(`reqOrHeaders?`): `string`

Defined in: [lib/services/privacy-service.ts:73](https://github.com/fderuiter/portfolio/blob/main/lib/services/privacy-service.ts#L73)

Centralized primary proxy IP extraction routine.
Extracts client IP address from proxy headers without logging or retaining raw IP.
Supports HTTP request objects, Headers instances, and header maps.

## Parameters

### reqOrHeaders?

[`RequestOrHeaders`](../type-aliases/RequestOrHeaders.md)

## Returns

`string`
