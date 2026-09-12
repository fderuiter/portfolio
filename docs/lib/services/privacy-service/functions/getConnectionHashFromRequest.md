[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/privacy-service](../README.md) / getConnectionHashFromRequest

# Function: getConnectionHashFromRequest()

> **getConnectionHashFromRequest**(`reqOrHeaders?`): `Promise`\<`string`\>

Generates an anonymous SHA-256 connection hash directly from a request or header map.
Reads pre-computed connection tokens from proxy headers before recomputing client hashes.

## Parameters

### reqOrHeaders?

[`RequestOrHeaders`](../type-aliases/RequestOrHeaders.md)

## Returns

`Promise`\<`string`\>
