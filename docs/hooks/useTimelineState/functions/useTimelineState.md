[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useTimelineState](../README.md) / useTimelineState

# Function: useTimelineState()

> **useTimelineState**(): `object`

Defined in: [hooks/useTimelineState.ts:7](https://github.com/fderuiter/portfolio/blob/main/hooks/useTimelineState.ts#L7)

## Returns

`object`

### cardOverrides

> **cardOverrides**: `Record`\<`number`, [`TimelineMode`](../type-aliases/TimelineMode.md)\>

### getCardMode

> **getCardMode**: (`idx`) => [`TimelineMode`](../type-aliases/TimelineMode.md)

#### Parameters

##### idx

`number`

#### Returns

[`TimelineMode`](../type-aliases/TimelineMode.md)

### globalMode

> **globalMode**: [`TimelineMode`](../type-aliases/TimelineMode.md)

### handleCardToggle

> **handleCardToggle**: (`idx`) => `void`

#### Parameters

##### idx

`number`

#### Returns

`void`

### handleGlobalToggle

> **handleGlobalToggle**: (`mode`) => `void`

#### Parameters

##### mode

[`TimelineMode`](../type-aliases/TimelineMode.md)

#### Returns

`void`
