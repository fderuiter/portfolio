[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-r](../README.md) / parseMultiSelectValue

# Function: parseMultiSelectValue()

> **parseMultiSelectValue**(`edcValue`, `optionCode`): `"N"` \| `"Y"`

Defined in: [lib/crf/export-r.ts:155](https://github.com/fderuiter/portfolio/blob/main/lib/crf/export-r.ts#L155)

Parses a comma-separated multi-select EDC response string
and checks whether a specific option code is selected.
Returns 'Y' if selected, 'N' if absent/unselected.

## Parameters

### edcValue

`string` \| `boolean` \| `string`[] \| `null` \| `undefined`

### optionCode

`string`

## Returns

`"N"` \| `"Y"`
