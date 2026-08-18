[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/alias-mapping](../README.md) / resolveFieldAlias

# Function: resolveFieldAlias()

> **resolveFieldAlias**(`fieldNameOrId`, `aliasMap?`): `object`

Defined in: [lib/crf/alias-mapping.ts:122](https://github.com/fderuiter/portfolio/blob/main/lib/crf/alias-mapping.ts#L122)

Dynamically resolves legacy field IDs or variable names against active field alias mappings.

## Parameters

### fieldNameOrId

`string`

### aliasMap?

[`FieldAliasMapping`](../../types/interfaces/FieldAliasMapping.md)[] = `[]`

## Returns

`object`

### currentName

> **currentName**: `string`

### legacyName?

> `optional` **legacyName?**: `string`

### mapping?

> `optional` **mapping?**: [`FieldAliasMapping`](../../types/interfaces/FieldAliasMapping.md)
