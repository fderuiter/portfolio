[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/privacy-service](../README.md) / extractClientIp

# Function: extractClientIp()

> **extractClientIp**(`reqOrHeaders?`): `string`

Centralized primary proxy IP extraction routine.
Extracts client IP address from proxy headers without logging or retaining raw IP.
Supports HTTP request objects, Headers instances, and header maps.

## Parameters

### reqOrHeaders?

[`RequestOrHeaders`](../type-aliases/RequestOrHeaders.md)

## Returns

`string`
