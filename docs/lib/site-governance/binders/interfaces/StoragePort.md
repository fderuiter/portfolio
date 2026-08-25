[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/binders](../README.md) / StoragePort

# Interface: StoragePort

Defined in: [lib/site-governance/binders.ts:48](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L48)

In-memory / Abstract Storage Port Interface for dual-read port adapter pattern.

## Properties

### name

> **name**: `string`

Defined in: [lib/site-governance/binders.ts:49](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L49)

## Methods

### get()

> **get**(`id`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md) \| `null`\>

Defined in: [lib/site-governance/binders.ts:50](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L50)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md) \| `null`\>

***

### list()

> **list**(`siteId?`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)[]\>

Defined in: [lib/site-governance/binders.ts:52](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L52)

#### Parameters

##### siteId?

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)[]\>

***

### set()

> **set**(`doc`): `Promise`\<`void`\>

Defined in: [lib/site-governance/binders.ts:51](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L51)

#### Parameters

##### doc

[`BinderDocument`](../../types/interfaces/BinderDocument.md)

#### Returns

`Promise`\<`void`\>
