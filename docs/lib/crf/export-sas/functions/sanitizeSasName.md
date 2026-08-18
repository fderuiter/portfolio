[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-sas](../README.md) / sanitizeSasName

# Function: sanitizeSasName()

> **sanitizeSasName**(`name`, `maxLength?`): `string`

Defined in: [lib/crf/export-sas.ts:21](https://github.com/fderuiter/portfolio/blob/main/lib/crf/export-sas.ts#L21)

Sanitizes a string into a valid SAS variable or dataset name.
- Maximum 32 characters
- Must start with letter or underscore
- May contain letters, numbers, underscores
- Converted to uppercase

## Parameters

### name

`string`

### maxLength?

`number` = `32`

## Returns

`string`
