[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useRouterTransition](../README.md) / NavigationContextType

# Interface: NavigationContextType

Defined in: [components/providers/NavigationProvider.tsx:16](https://github.com/fderuiter/portfolio/blob/main/components/providers/NavigationProvider.tsx#L16)

## Properties

### isNavigating

> **isNavigating**: `boolean`

Defined in: [components/providers/NavigationProvider.tsx:20](https://github.com/fderuiter/portfolio/blob/main/components/providers/NavigationProvider.tsx#L20)

Indicates whether a client-side route transition is currently active.

***

### pendingHref

> **pendingHref**: `string` \| `null`

Defined in: [components/providers/NavigationProvider.tsx:24](https://github.com/fderuiter/portfolio/blob/main/components/providers/NavigationProvider.tsx#L24)

The destination href currently being navigated to, or null if idle.

***

### prefetchRoute

> **prefetchRoute**: (`href`) => `void`

Defined in: [components/providers/NavigationProvider.tsx:32](https://github.com/fderuiter/portfolio/blob/main/components/providers/NavigationProvider.tsx#L32)

Asynchronously prefetches destination route assets.

#### Parameters

##### href

`string`

#### Returns

`void`

***

### startNavigation

> **startNavigation**: (`href`, `label?`) => `void`

Defined in: [components/providers/NavigationProvider.tsx:28](https://github.com/fderuiter/portfolio/blob/main/components/providers/NavigationProvider.tsx#L28)

Triggers client-side route navigation within a non-blocking React transition.

#### Parameters

##### href

`string`

##### label?

`string`

#### Returns

`void`
