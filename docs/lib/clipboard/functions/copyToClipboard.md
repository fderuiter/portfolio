[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/clipboard](../README.md) / copyToClipboard

# Function: copyToClipboard()

> **copyToClipboard**(`text`): `Promise`\<`void`\>

Robust clipboard writing utility.
Attempts modern navigator.clipboard API before falling back to programmatic textarea selection.
Propagates errors cleanly to the caller.

## Parameters

### text

`string`

## Returns

`Promise`\<`void`\>
