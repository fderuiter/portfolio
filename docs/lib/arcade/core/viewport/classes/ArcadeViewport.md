[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/arcade/core/viewport](../README.md) / ArcadeViewport

# Class: ArcadeViewport

Defined in: [lib/arcade/core/viewport.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/viewport.ts#L34)

## Constructors

### Constructor

> **new ArcadeViewport**(`config`): `ArcadeViewport`

Defined in: [lib/arcade/core/viewport.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/viewport.ts#L40)

#### Parameters

##### config

[`ViewportConfig`](../interfaces/ViewportConfig.md)

#### Returns

`ArcadeViewport`

## Methods

### applyTransform()

> **applyTransform**(`ctx`, `metrics`): `void`

Defined in: [lib/arcade/core/viewport.ts:101](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/viewport.ts#L101)

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

Defined in: [lib/arcade/core/viewport.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/core/viewport.ts#L50)

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
