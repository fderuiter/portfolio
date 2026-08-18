[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useInteractiveRouter](../README.md) / RouterTransitionContextType

# Interface: RouterTransitionContextType

Defined in: [components/providers/RouterTransitionProvider.tsx:9](https://github.com/fderuiter/portfolio/blob/main/components/providers/RouterTransitionProvider.tsx#L9)

## Properties

### isPending

> **isPending**: `boolean`

Defined in: [components/providers/RouterTransitionProvider.tsx:11](https://github.com/fderuiter/portfolio/blob/main/components/providers/RouterTransitionProvider.tsx#L11)

True when a React transition or route navigation is currently pending

***

### navigate

> **navigate**: (`href`, `title?`, `event?`) => `void`

Defined in: [components/providers/RouterTransitionProvider.tsx:17](https://github.com/fderuiter/portfolio/blob/main/components/providers/RouterTransitionProvider.tsx#L17)

Executes client navigation wrapped in a non-blocking React transition

#### Parameters

##### href

`string`

##### title?

`string`

##### event?

`MouseEvent`\<`Element`, `MouseEvent`\>

#### Returns

`void`

***

### onHover

> **onHover**: (`href`) => `void`

Defined in: [components/providers/RouterTransitionProvider.tsx:19](https://github.com/fderuiter/portfolio/blob/main/components/providers/RouterTransitionProvider.tsx#L19)

Event handler helper for hover/focus asset prefetching

#### Parameters

##### href

`string`

#### Returns

`void`

***

### pendingHref

> **pendingHref**: `string` \| `null`

Defined in: [components/providers/RouterTransitionProvider.tsx:13](https://github.com/fderuiter/portfolio/blob/main/components/providers/RouterTransitionProvider.tsx#L13)

Href target of the active pending transition, or null if idle

***

### prefetch

> **prefetch**: (`href`) => `void`

Defined in: [components/providers/RouterTransitionProvider.tsx:15](https://github.com/fderuiter/portfolio/blob/main/components/providers/RouterTransitionProvider.tsx#L15)

Asynchronously prefetches assets for destination route

#### Parameters

##### href

`string`

#### Returns

`void`
