[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/viewport](../README.md) / ArcadeViewport

# Class: ArcadeViewport

## Constructors

### Constructor

> **new ArcadeViewport**(`config`): `ArcadeViewport`

#### Parameters

##### config

[`ViewportConfig`](../interfaces/ViewportConfig.md)

#### Returns

`ArcadeViewport`

## Methods

### applyTransform()

> **applyTransform**(`ctx`, `metrics`): `void`

Applies the transformation matrix to a 2D canvas context.

#### Parameters

##### ctx

`CanvasRenderingContext2D`

##### metrics

[`ViewportMetrics`](../interfaces/ViewportMetrics.md)

#### Returns

`void`

***

### calculateMetrics()

> **calculateMetrics**(`containerWidth`, `containerHeight`, `rawDpr?`): [`ViewportMetrics`](../interfaces/ViewportMetrics.md)

Calculates viewport metrics based on container dimensions and physical pixel ratio.

#### Parameters

##### containerWidth

`number`

##### containerHeight

`number`

##### rawDpr?

`number` = `1.0`

#### Returns

[`ViewportMetrics`](../interfaces/ViewportMetrics.md)
