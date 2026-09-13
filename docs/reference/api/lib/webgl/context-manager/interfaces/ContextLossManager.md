[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/webgl/context-manager](../README.md) / ContextLossManager

# Interface: ContextLossManager

## Properties

### dispose

> **dispose**: () => `void`

#### Returns

`void`

***

### getRecoveryCount

> **getRecoveryCount**: () => `number`

#### Returns

`number`

***

### getStatus

> **getStatus**: () => [`ContextLossStatus`](../type-aliases/ContextLossStatus.md)

#### Returns

[`ContextLossStatus`](../type-aliases/ContextLossStatus.md)

***

### isContextLost

> **isContextLost**: () => `boolean`

#### Returns

`boolean`

***

### simulateLoss

> **simulateLoss**: (`restoreDelayMs?`) => `boolean`

#### Parameters

##### restoreDelayMs?

`number`

#### Returns

`boolean`
