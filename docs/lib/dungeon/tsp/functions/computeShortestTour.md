[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dungeon/tsp](../README.md) / computeShortestTour

# Function: computeShortestTour()

> **computeShortestTour**(`startX`, `startY`, `nodes`, `exitX`, `exitY`): `object`

Recalculates the shortest TSP route through remaining unvisited landmark nodes
using nearest-neighbor heuristic starting from player position.

## Parameters

### startX

`number`

### startY

`number`

### nodes

[`TSPNode`](../../types/interfaces/TSPNode.md)[]

### exitX

`number`

### exitY

`number`

## Returns

`object`

### totalDistance

> **totalDistance**: `number`

### tour

> **tour**: `object`[]
