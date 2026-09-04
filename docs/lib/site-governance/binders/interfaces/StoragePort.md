[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/binders](../README.md) / StoragePort

# Interface: StoragePort

Defined in: [lib/site-governance/binders.ts:133](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L133)

In-memory / Abstract Storage Port Interface for dual-read port adapter pattern.

## Properties

### name

> **name**: `string`

Defined in: [lib/site-governance/binders.ts:134](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L134)

## Methods

### get()

> **get**(`id`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md) \| `null`\>

Defined in: [lib/site-governance/binders.ts:135](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L135)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md) \| `null`\>

***

### list()

> **list**(`siteId?`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)[]\>

Defined in: [lib/site-governance/binders.ts:137](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L137)

#### Parameters

##### siteId?

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)[]\>

***

### set()

> **set**(`doc`): `Promise`\<`void`\>

Defined in: [lib/site-governance/binders.ts:136](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L136)

#### Parameters

##### doc

[`BinderDocument`](../../types/interfaces/BinderDocument.md)

#### Returns

`Promise`\<`void`\>
