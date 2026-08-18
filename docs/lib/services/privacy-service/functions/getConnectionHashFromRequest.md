[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/privacy-service](../README.md) / getConnectionHashFromRequest

# Function: getConnectionHashFromRequest()

> **getConnectionHashFromRequest**(`reqOrHeaders?`): `Promise`\<`string`\>

Defined in: [lib/services/privacy-service.ts:94](https://github.com/fderuiter/portfolio/blob/main/lib/services/privacy-service.ts#L94)

Generates an anonymous SHA-256 connection hash directly from a request or header map.
Reads pre-computed connection tokens from proxy headers before recomputing client hashes.

## Parameters

### reqOrHeaders?

[`RequestOrHeaders`](../type-aliases/RequestOrHeaders.md)

## Returns

`Promise`\<`string`\>
