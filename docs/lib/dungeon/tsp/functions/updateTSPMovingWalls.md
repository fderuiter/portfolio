[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/tsp](../README.md) / updateTSPMovingWalls

# Function: updateTSPMovingWalls()

> **updateTSPMovingWalls**(`grid`, `walls`, `moveCount`): `object`

Defined in: [lib/dungeon/tsp.ts:73](https://github.com/fderuiter/portfolio/blob/main/lib/dungeon/tsp.ts#L73)

Updates dynamic moving walls for Room 1 (TSP).
Shifting barriers cycle on player movement count or step parity.

## Parameters

### grid

`string`[][]

### walls

[`TSPMovingWall`](../../types/interfaces/TSPMovingWall.md)[]

### moveCount

`number`

## Returns

`object`

### updatedGrid

> **updatedGrid**: `string`[][]

### updatedWalls

> **updatedWalls**: [`TSPMovingWall`](../../types/interfaces/TSPMovingWall.md)[]
