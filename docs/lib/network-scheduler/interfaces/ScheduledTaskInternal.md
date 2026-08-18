[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/network-scheduler](../README.md) / ScheduledTaskInternal

# Interface: ScheduledTaskInternal\<T\>

Defined in: [lib/network-scheduler.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L30)

## Type Parameters

### T

`T` = `unknown`

## Properties

### deferOnSlowNetwork

> **deferOnSlowNetwork**: `boolean`

Defined in: [lib/network-scheduler.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L34)

***

### execute

> **execute**: () => `T` \| `Promise`\<`T`\>

Defined in: [lib/network-scheduler.ts:36](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L36)

#### Returns

`T` \| `Promise`\<`T`\>

***

### id

> **id**: `string`

Defined in: [lib/network-scheduler.ts:31](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L31)

***

### onError?

> `optional` **onError?**: (`error`) => `void`

Defined in: [lib/network-scheduler.ts:38](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L38)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### onSuccess?

> `optional` **onSuccess?**: (`result`) => `void`

Defined in: [lib/network-scheduler.ts:37](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L37)

#### Parameters

##### result

`T`

#### Returns

`void`

***

### priority

> **priority**: [`TaskPriority`](../type-aliases/TaskPriority.md)

Defined in: [lib/network-scheduler.ts:32](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L32)

***

### queuedAt

> **queuedAt**: `number`

Defined in: [lib/network-scheduler.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L40)

***

### requiresIdle

> **requiresIdle**: `boolean`

Defined in: [lib/network-scheduler.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L35)

***

### status

> **status**: [`TaskStatus`](../type-aliases/TaskStatus.md)

Defined in: [lib/network-scheduler.ts:39](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L39)

***

### viewportProximity

> **viewportProximity**: `boolean`

Defined in: [lib/network-scheduler.ts:33](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L33)
