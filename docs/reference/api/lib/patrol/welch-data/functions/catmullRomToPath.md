[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/welch-data](../README.md) / catmullRomToPath

# Function: catmullRomToPath()

> **catmullRomToPath**(`points`, `closed?`): `string`

Converts a sequence of 2D control points into a smooth cubic Bézier SVG path string
using the standard Catmull-Rom formulation:
CP1 = P1 + (P2 - P0) / 6
CP2 = P2 - (P3 - P1) / 6

## Parameters

### points

[`WelchPoint`](../interfaces/WelchPoint.md)[]

### closed?

`boolean` = `false`

## Returns

`string`
