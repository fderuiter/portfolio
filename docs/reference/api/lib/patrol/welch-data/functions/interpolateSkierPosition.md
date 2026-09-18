[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/welch-data](../README.md) / interpolateSkierPosition

# Function: interpolateSkierPosition()

> **interpolateSkierPosition**(`points`, `progress`): `object`

Interpolates the 2D position and tangent heading angle for an animated skier descending
along a piecewise Catmull-Rom trail polyline given progress t in [0, 1].

## Parameters

### points

[`WelchPoint`](../interfaces/WelchPoint.md)[]

### progress

`number`

## Returns

`object`

### angleRad

> **angleRad**: `number`

### x

> **x**: `number`

### y

> **y**: `number`
