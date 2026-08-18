[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useViewportMedia](../README.md) / UseViewportMediaResult

# Interface: UseViewportMediaResult\<T\>

Defined in: [hooks/useViewportMedia.ts:22](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L22)

## Type Parameters

### T

`T` = `string`

## Properties

### connectionInfo

> **connectionInfo**: [`NetworkConnectionInfo`](../../../lib/media-scheduler/interfaces/NetworkConnectionInfo.md)

Defined in: [hooks/useViewportMedia.ts:31](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L31)

***

### containerRef

> **containerRef**: `RefObject`\<`HTMLDivElement` \| `null`\>

Defined in: [hooks/useViewportMedia.ts:23](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L23)

***

### data

> **data**: `T` \| `null`

Defined in: [hooks/useViewportMedia.ts:29](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L29)

***

### error

> **error**: `Error` \| `null`

Defined in: [hooks/useViewportMedia.ts:30](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L30)

***

### isDeferred

> **isDeferred**: `boolean`

Defined in: [hooks/useViewportMedia.ts:27](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L27)

***

### isLoaded

> **isLoaded**: `boolean`

Defined in: [hooks/useViewportMedia.ts:25](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L25)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [hooks/useViewportMedia.ts:26](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L26)

***

### isNearViewport

> **isNearViewport**: `boolean`

Defined in: [hooks/useViewportMedia.ts:28](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L28)

***

### status

> **status**: [`MediaLoadStatus`](../../../lib/media-scheduler/type-aliases/MediaLoadStatus.md)

Defined in: [hooks/useViewportMedia.ts:24](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L24)

***

### triggerLoad

> **triggerLoad**: () => `void`

Defined in: [hooks/useViewportMedia.ts:32](https://github.com/fderuiter/portfolio/blob/main/hooks/useViewportMedia.ts#L32)

#### Returns

`void`
