[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/webgl/context-manager](../README.md) / ContextLossManager

# Interface: ContextLossManager

Defined in: [lib/webgl/context-manager.ts:19](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L19)

## Properties

### dispose

> **dispose**: () => `void`

Defined in: [lib/webgl/context-manager.ts:24](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L24)

#### Returns

`void`

***

### getRecoveryCount

> **getRecoveryCount**: () => `number`

Defined in: [lib/webgl/context-manager.ts:22](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L22)

#### Returns

`number`

***

### getStatus

> **getStatus**: () => [`ContextLossStatus`](../type-aliases/ContextLossStatus.md)

Defined in: [lib/webgl/context-manager.ts:20](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L20)

#### Returns

[`ContextLossStatus`](../type-aliases/ContextLossStatus.md)

***

### isContextLost

> **isContextLost**: () => `boolean`

Defined in: [lib/webgl/context-manager.ts:21](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L21)

#### Returns

`boolean`

***

### simulateLoss

> **simulateLoss**: (`restoreDelayMs?`) => `boolean`

Defined in: [lib/webgl/context-manager.ts:23](https://github.com/fderuiter/portfolio/blob/main/lib/webgl/context-manager.ts#L23)

#### Parameters

##### restoreDelayMs?

`number`

#### Returns

`boolean`
