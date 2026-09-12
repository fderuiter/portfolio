[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/arcade/crt-pipeline](../README.md) / renderCRTEffects

# Function: renderCRTEffects()

> **renderCRTEffects**(`ctx`, `width`, `height`, `config`, `theme`, `frameCount?`): `void`

Applies calibrated CRT post-processing passes to a 2D canvas rendering context.

## Parameters

### ctx

`CanvasRenderingContext2D`

The active CanvasRenderingContext2D.

### width

`number`

The viewport width in pixels.

### height

`number`

The viewport height in pixels.

### config

[`CRTCalibrationConfig`](../interfaces/CRTCalibrationConfig.md)

CRT calibration parameters.

### theme

[`CRTThemeConfig`](../../../dungeon/types/interfaces/CRTThemeConfig.md)

Active CRT phosphor color theme.

### frameCount?

`number` = `0`

Animation tick frame count for subtle phosphor shimmer.

## Returns

`void`
