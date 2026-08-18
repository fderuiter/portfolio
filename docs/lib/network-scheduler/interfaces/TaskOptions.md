[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/network-scheduler](../README.md) / TaskOptions

# Interface: TaskOptions\<T\>

Defined in: [lib/network-scheduler.ts:19](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L19)

## Type Parameters

### T

`T` = `unknown`

## Properties

### deferOnSlowNetwork?

> `optional` **deferOnSlowNetwork?**: `boolean`

Defined in: [lib/network-scheduler.ts:23](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L23)

***

### execute

> **execute**: () => `T` \| `Promise`\<`T`\>

Defined in: [lib/network-scheduler.ts:25](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L25)

#### Returns

`T` \| `Promise`\<`T`\>

***

### id

> **id**: `string`

Defined in: [lib/network-scheduler.ts:20](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L20)

***

### onError?

> `optional` **onError?**: (`error`) => `void`

Defined in: [lib/network-scheduler.ts:27](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L27)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### onSuccess?

> `optional` **onSuccess?**: (`result`) => `void`

Defined in: [lib/network-scheduler.ts:26](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L26)

#### Parameters

##### result

`T`

#### Returns

`void`

***

### priority?

> `optional` **priority?**: [`TaskPriority`](../type-aliases/TaskPriority.md)

Defined in: [lib/network-scheduler.ts:21](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L21)

***

### requiresIdle?

> `optional` **requiresIdle?**: `boolean`

Defined in: [lib/network-scheduler.ts:24](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L24)

***

### viewportProximity?

> `optional` **viewportProximity?**: `boolean`

Defined in: [lib/network-scheduler.ts:22](https://github.com/fderuiter/portfolio/blob/main/lib/network-scheduler.ts#L22)
