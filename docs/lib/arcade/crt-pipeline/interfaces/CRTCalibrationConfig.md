[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/arcade/crt-pipeline](../README.md) / CRTCalibrationConfig

# Interface: CRTCalibrationConfig

Defined in: [lib/arcade/crt-pipeline.ts:22](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L22)

## Properties

### bloomIntensity

> **bloomIntensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:46](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L46)

Diffusion intensity of the screen bloom and phosphor glow (0.0 to 1.0).

***

### curvature

> **curvature**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L50)

Physical CRT tube barrel curvature factor (0.0 to 1.0).

***

### flickerShimmer

> **flickerShimmer**: `boolean`

Defined in: [lib/arcade/crt-pipeline.ts:58](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L58)

Subtle refresh-rate phosphor micro-flicker shimmer.

***

### phosphorIntensity

> **phosphorIntensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:42](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L42)

Opacity of the RGB phosphor mask overlay (0.0 to 1.0).

***

### phosphorMask

> **phosphorMask**: [`PhosphorMaskType`](../type-aliases/PhosphorMaskType.md)

Defined in: [lib/arcade/crt-pipeline.ts:38](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L38)

Type of physical phosphor mask to emulate.

***

### scanlineDensity

> **scanlineDensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L34)

Pixel pitch/interval between scanlines (2, 3, or 4 px).

***

### scanlineIntensity

> **scanlineIntensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L30)

Scanline darkness and prominence (0.0 to 1.0).

***

### scanlinesEnabled

> **scanlinesEnabled**: `boolean`

Defined in: [lib/arcade/crt-pipeline.ts:26](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L26)

Whether horizontal CRT scanlines are rendered.

***

### vignetteIntensity

> **vignetteIntensity**: `number`

Defined in: [lib/arcade/crt-pipeline.ts:54](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/crt-pipeline.ts#L54)

Corner shadow and radial falloff intensity (0.0 to 1.0).
