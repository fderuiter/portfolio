[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-r](../README.md) / sanitizeRName

# Function: sanitizeRName()

> **sanitizeRName**(`name`, `maxLength?`): `string`

Defined in: [lib/crf/export-r.ts:18](https://github.com/fderuiter/portfolio/blob/main/lib/crf/export-r.ts#L18)

Sanitizes a string into a valid R variable name.
R names should start with a letter and contain letters, numbers, dots, or underscores.

## Parameters

### name

`string`

### maxLength?

`number` = `32`

## Returns

`string`
