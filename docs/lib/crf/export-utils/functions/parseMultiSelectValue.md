[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-utils](../README.md) / parseMultiSelectValue

# Function: parseMultiSelectValue()

> **parseMultiSelectValue**(`edcValue`, `optionCode`): `"N"` \| `"Y"`

Defined in: [lib/crf/export-utils.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/crf/export-utils.ts#L35)

Parses a comma-separated multi-select EDC response string
and checks whether a specific option code is selected.
Returns 'Y' if selected, 'N' if absent/unselected.

## Parameters

### edcValue

`string` \| `string`[] \| `null` \| `undefined`

### optionCode

`string`

## Returns

`"N"` \| `"Y"`
