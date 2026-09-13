[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/arcade/crt-pipeline](../README.md) / CRTCalibrationConfig

# Interface: CRTCalibrationConfig

## Properties

### bloomIntensity

> **bloomIntensity**: `number`

Diffusion intensity of the screen bloom and phosphor glow (0.0 to 1.0).

***

### curvature

> **curvature**: `number`

Physical CRT tube barrel curvature factor (0.0 to 1.0).

***

### flickerShimmer

> **flickerShimmer**: `boolean`

Subtle refresh-rate phosphor micro-flicker shimmer.

***

### phosphorIntensity

> **phosphorIntensity**: `number`

Opacity of the RGB phosphor mask overlay (0.0 to 1.0).

***

### phosphorMask

> **phosphorMask**: [`PhosphorMaskType`](../type-aliases/PhosphorMaskType.md)

Type of physical phosphor mask to emulate.

***

### scanlineDensity

> **scanlineDensity**: `number`

Pixel pitch/interval between scanlines (2, 3, or 4 px).

***

### scanlineIntensity

> **scanlineIntensity**: `number`

Scanline darkness and prominence (0.0 to 1.0).

***

### scanlinesEnabled

> **scanlinesEnabled**: `boolean`

Whether horizontal CRT scanlines are rendered.

***

### vignetteIntensity

> **vignetteIntensity**: `number`

Corner shadow and radial falloff intensity (0.0 to 1.0).
