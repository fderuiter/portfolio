[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/arcade/crt-pipeline](../README.md) / CRTCalibrationConfig

# Interface: CRTCalibrationConfig

Defined in: [lib/arcade/crt-pipeline.ts:21](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L21)

## Properties

### bloomIntensity

> **bloomIntensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:45](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L45)

Diffusion intensity of the screen bloom and phosphor glow (0.0 to 1.0).

***

### curvature

> **curvature**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:49](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L49)

Physical CRT tube barrel curvature factor (0.0 to 1.0).

***

### flickerShimmer

> **flickerShimmer**: `boolean`

Defined in: [lib/arcade/crt-pipeline.ts:57](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L57)

Subtle refresh-rate phosphor micro-flicker shimmer.

***

### phosphorIntensity

> **phosphorIntensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:41](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L41)

Opacity of the RGB phosphor mask overlay (0.0 to 1.0).

***

### phosphorMask

> **phosphorMask**: [`PhosphorMaskType`](../type-aliases/PhosphorMaskType.md)

Defined in: [lib/arcade/crt-pipeline.ts:37](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L37)

Type of physical phosphor mask to emulate.

***

### scanlineDensity

> **scanlineDensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:33](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L33)

Pixel pitch/interval between scanlines (2, 3, or 4 px).

***

### scanlineIntensity

> **scanlineIntensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:29](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L29)

Scanline darkness and prominence (0.0 to 1.0).

***

### scanlinesEnabled

> **scanlinesEnabled**: `boolean`

Defined in: [lib/arcade/crt-pipeline.ts:25](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L25)

Whether horizontal CRT scanlines are rendered.

***

### vignetteIntensity

> **vignetteIntensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:53](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L53)

Corner shadow and radial falloff intensity (0.0 to 1.0).
