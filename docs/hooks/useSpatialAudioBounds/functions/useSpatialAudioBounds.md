[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useSpatialAudioBounds](../README.md) / useSpatialAudioBounds

# Function: useSpatialAudioBounds()

> **useSpatialAudioBounds**\<`T`\>(): `object`

Defined in: [hooks/useSpatialAudioBounds.ts:83](https://github.com/fderuiter/portfolio/blob/main/hooks/useSpatialAudioBounds.ts#L83)

Standardized observer hook for caching navigation link bounds and computing
spatial audio panning coordinates without synchronous layout queries during hover events.

## Type Parameters

### T

`T` *extends* `HTMLElement` = `HTMLElement`

## Returns

`object`

### containerRef

> **containerRef**: (`node`) => `void` = `setContainerRef`

#### Parameters

##### node

`T` \| `null`

#### Returns

`void`

### getPan

> **getPan**: (`node`) => `number`

#### Parameters

##### node

`HTMLElement`

#### Returns

`number`

### handleHover

> **handleHover**: (`e`) => `void`

#### Parameters

##### e

`MouseEvent`\<`HTMLElement`\>

#### Returns

`void`

### registerNavElement

> **registerNavElement**: (`node`) => `void`

#### Parameters

##### node

`HTMLElement` \| `null`

#### Returns

`void`
