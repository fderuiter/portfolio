[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/pretext-block-parser](../README.md) / calculateBlockHeight

# Function: calculateBlockHeight()

> **calculateBlockHeight**(`block`, `containerWidth`, `lineHeight?`): `number`

Defined in: [lib/pretext-block-parser.ts:203](https://github.com/fderuiter/portfolio/blob/main/lib/pretext-block-parser.ts#L203)

Calculates the accurate offscreen height of a structured block prior to layout scheduling.

## Parameters

### block

[`StructuredBlock`](../interfaces/StructuredBlock.md) \| [`PreparedBlock`](../interfaces/PreparedBlock.md)

### containerWidth

`number`

### lineHeight?

`number` = `BLOCK_LAYOUT_CONFIG.PARAGRAPH_LINE_HEIGHT`

## Returns

`number`
