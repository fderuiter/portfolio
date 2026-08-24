[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/privacy-service](../README.md) / generateClientConnectionHash

# Function: generateClientConnectionHash()

> **generateClientConnectionHash**(`ip`): `Promise`\<`string`\>

Defined in: [lib/services/privacy-service.ts:55](https://github.com/fderuiter/portfolio/blob/main/lib/services/privacy-service.ts#L55)

Computes a privacy-preserving SHA-256 hash token from client IP / connection info
using standard Web Crypto APIs (crypto.subtle), safe for Edge and Node runtimes.
Never stores or logs plain-text IP addresses.

## Parameters

### ip

`string`

## Returns

`Promise`\<`string`\>
