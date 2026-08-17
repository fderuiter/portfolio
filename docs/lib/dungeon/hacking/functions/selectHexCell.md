[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/hacking](../README.md) / selectHexCell

# Function: selectHexCell()

> **selectHexCell**(`puzzle`, `row`, `col`): `object`

Defined in: [lib/dungeon/hacking.ts:93](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/hacking.ts#L93)

Selects a hex matrix cell and processes the next step in the bypass sequence.

## Parameters

### puzzle

[`HexMatrixPuzzle`](../../types/interfaces/HexMatrixPuzzle.md)

### row

`number`

### col

`number`

## Returns

`object`

### message

> **message**: `string`

### puzzle

> **puzzle**: [`HexMatrixPuzzle`](../../types/interfaces/HexMatrixPuzzle.md)

### soundType

> **soundType**: `"match"` \| `"click"` \| `"fail"`
