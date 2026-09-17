[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/project-image-service](../README.md) / sanitizeSvg

# Function: sanitizeSvg()

> **sanitizeSvg**(`svgContent`): `string`

Sanitizes SVG XML strings using DOMPurify defense-in-depth, stripping
scripts, foreign objects, inline event handlers, and external URLs per ADR 0043.

## Parameters

### svgContent

`string`

## Returns

`string`
