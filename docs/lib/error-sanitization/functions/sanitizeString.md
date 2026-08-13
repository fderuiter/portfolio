[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/error-sanitization](../README.md) / sanitizeString

# Function: sanitizeString()

> **sanitizeString**(`str`): `string`

Defined in: [lib/error-sanitization.ts:7](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/lib/error-sanitization.ts#L7)

Utility to sanitize errors for production environment console output.
Blocks the leak of absolute system paths and deep stack traces.

## Parameters

### str

`string`

## Returns

`string`
