[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/media-scheduler](../README.md) / QueueTask

# Interface: QueueTask\<T\>

Defined in: [lib/media-scheduler.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L34)

## Type Parameters

### T

`T` = `unknown`

## Properties

### id

> **id**: `string`

Defined in: [lib/media-scheduler.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L35)

***

### isAboveTheFold

> **isAboveTheFold**: `boolean`

Defined in: [lib/media-scheduler.ts:37](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L37)

***

### isNearViewport

> **isNearViewport**: `boolean`

Defined in: [lib/media-scheduler.ts:39](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L39)

***

### loadFn

> **loadFn**: () => `Promise`\<`T`\>

Defined in: [lib/media-scheduler.ts:41](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L41)

#### Returns

`Promise`\<`T`\>

***

### onStatusChange?

> `optional` **onStatusChange?**: (`status`) => `void`

Defined in: [lib/media-scheduler.ts:44](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L44)

#### Parameters

##### status

[`MediaLoadStatus`](../type-aliases/MediaLoadStatus.md)

#### Returns

`void`

***

### priority

> **priority**: [`MediaPriority`](../type-aliases/MediaPriority.md)

Defined in: [lib/media-scheduler.ts:36](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L36)

***

### reject

> **reject**: (`reason?`) => `void`

Defined in: [lib/media-scheduler.ts:43](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L43)

#### Parameters

##### reason?

`unknown`

#### Returns

`void`

***

### requiresViewportProximity

> **requiresViewportProximity**: `boolean`

Defined in: [lib/media-scheduler.ts:38](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L38)

***

### resolve

> **resolve**: (`value`) => `void`

Defined in: [lib/media-scheduler.ts:42](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L42)

#### Parameters

##### value

`T` \| `PromiseLike`\<`T`\>

#### Returns

`void`

***

### status

> **status**: [`MediaLoadStatus`](../type-aliases/MediaLoadStatus.md)

Defined in: [lib/media-scheduler.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/media-scheduler.ts#L40)
