[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/graphics-engine](../README.md) / generateHermiteSplinePath

# Function: generateHermiteSplinePath()

> **generateHermiteSplinePath**(`points`, `heightForArea?`): `object`

Defined in: [lib/graphics-engine.ts:273](https://github.com/fderuiter/portfolio/blob/main/lib/graphics-engine.ts#L273)

Computes cubic Hermite spline paths (Catmull-Rom style tangents) connecting a series of points.
This generates smooth organic curves by calculating tangents at each point.

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
