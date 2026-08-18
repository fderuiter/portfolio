[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/arcade/virtual-input-bridge](../README.md) / useVirtualInputBridge

# Function: useVirtualInputBridge()

> **useVirtualInputBridge**(`options?`): `object`

Defined in: [lib/arcade/virtual-input-bridge.ts:100](https://github.com/fderuiter/portfolio/blob/main/lib/arcade/virtual-input-bridge.ts#L100)

Shared Virtual Input Bridge hook managing touch interactions across all arcade titles.

## Parameters

### options?

[`VirtualInputBridgeOptions`](../interfaces/VirtualInputBridgeOptions.md) = `{}`

## Returns

`object`

### handleActionPress

> **handleActionPress**: (`actionKey`, `e?`) => `void`

#### Parameters

##### actionKey

`"actionA"` \| `"actionB"` \| `"actionC"`

##### e?

`Event` \| `SyntheticEvent`\<`Element`, `Event`\>

#### Returns

`void`

### handleActionRelease

> **handleActionRelease**: (`actionKey`, `e?`) => `void`

#### Parameters

##### actionKey

`"actionA"` \| `"actionB"` \| `"actionC"`

##### e?

`Event` \| `SyntheticEvent`\<`Element`, `Event`\>

#### Returns

`void`

### handleDirectionPress

> **handleDirectionPress**: (`direction`, `e?`) => `void`

#### Parameters

##### direction

[`VirtualDirection`](../type-aliases/VirtualDirection.md)

##### e?

`Event` \| `SyntheticEvent`\<`Element`, `Event`\>

#### Returns

`void`

### handleDirectionRelease

> **handleDirectionRelease**: (`direction`, `e?`) => `void`

#### Parameters

##### direction

[`VirtualDirection`](../type-aliases/VirtualDirection.md)

##### e?

`Event` \| `SyntheticEvent`\<`Element`, `Event`\>

#### Returns

`void`

### handleDragEnd

> **handleDragEnd**: (`e?`) => `void`

#### Parameters

##### e?

`Event` \| `SyntheticEvent`\<`Element`, `Event`\>

#### Returns

`void`

### handleDragMove

> **handleDragMove**: (`x`, `y`, `e?`) => `void`

#### Parameters

##### x

`number`

##### y

`number`

##### e?

`Event` \| `SyntheticEvent`\<`Element`, `Event`\>

#### Returns

`void`

### handleDragStart

> **handleDragStart**: (`x`, `y`, `pointerId?`, `e?`) => `void`

#### Parameters

##### x

`number`

##### y

`number`

##### pointerId?

`number`

##### e?

`Event` \| `SyntheticEvent`\<`Element`, `Event`\>

#### Returns

`void`

### inputState

> **inputState**: [`VirtualInputState`](../interfaces/VirtualInputState.md)
