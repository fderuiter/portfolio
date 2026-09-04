[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/binders](../README.md) / InMemoryStoragePort

# Class: InMemoryStoragePort

Defined in: [lib/site-governance/binders.ts:140](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L140)

In-memory / Abstract Storage Port Interface for dual-read port adapter pattern.

## Implements

- [`StoragePort`](../interfaces/StoragePort.md)

## Constructors

### Constructor

> **new InMemoryStoragePort**(`name`, `initialDocs?`): `InMemoryStoragePort`

Defined in: [lib/site-governance/binders.ts:144](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L144)

#### Parameters

##### name

`string`

##### initialDocs?

[`BinderDocument`](../../types/interfaces/BinderDocument.md)[] = `[]`

#### Returns

`InMemoryStoragePort`

## Properties

### name

> `readonly` **name**: `string`

Defined in: [lib/site-governance/binders.ts:141](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L141)

#### Implementation of

[`StoragePort`](../interfaces/StoragePort.md).[`name`](../interfaces/StoragePort.md#name)

## Methods

### get()

> **get**(`id`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md) \| `null`\>

Defined in: [lib/site-governance/binders.ts:151](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L151)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md) \| `null`\>

#### Implementation of

[`StoragePort`](../interfaces/StoragePort.md).[`get`](../interfaces/StoragePort.md#get)

***

### list()

> **list**(`siteId?`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)[]\>

Defined in: [lib/site-governance/binders.ts:160](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L160)

#### Parameters

##### siteId?

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)[]\>

#### Implementation of

[`StoragePort`](../interfaces/StoragePort.md).[`list`](../interfaces/StoragePort.md#list)

***

### set()

> **set**(`doc`): `Promise`\<`void`\>

Defined in: [lib/site-governance/binders.ts:156](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L156)

#### Parameters

##### doc

[`BinderDocument`](../../types/interfaces/BinderDocument.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`StoragePort`](../interfaces/StoragePort.md).[`set`](../interfaces/StoragePort.md#set)
