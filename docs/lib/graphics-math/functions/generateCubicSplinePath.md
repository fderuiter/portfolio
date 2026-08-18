[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/graphics-math](../README.md) / generateCubicSplinePath

# Function: generateCubicSplinePath()

> **generateCubicSplinePath**(`points`, `heightForArea?`): `object`

Defined in: [lib/graphics-math.ts:143](https://github.com/fderuiter/portfolio/blob/main/lib/graphics-math.ts#L143)

Computes cubic Bezier curves connecting a series of points using midpoint control points.
Generates an SVG path string ('d' attribute) for the line and an optional closed area path.

## Parameters

### points

[`Point2D`](../type-aliases/Point2D.md)[]

### heightForArea?

`number`

## Returns

`object`

### areaD

> **areaD**: `string`

### pathD

> **pathD**: `string`
