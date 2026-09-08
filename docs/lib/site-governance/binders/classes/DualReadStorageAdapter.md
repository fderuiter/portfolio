[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/binders](../README.md) / DualReadStorageAdapter

# Class: DualReadStorageAdapter

Defined in: [lib/site-governance/binders.ts:174](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L174)

Zero-downtime Dual-Read Storage Port Adapter.
Provides seamless read fallback from primary to secondary storage,
automatic backfill / self-healing, and atomic dual-write synchronization.

## Constructors

### Constructor

> **new DualReadStorageAdapter**(`primary`, `secondary`): `DualReadStorageAdapter`

Defined in: [lib/site-governance/binders.ts:175](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L175)

#### Parameters

##### primary

[`StoragePort`](../interfaces/StoragePort.md)

##### secondary

[`StoragePort`](../interfaces/StoragePort.md)

#### Returns

`DualReadStorageAdapter`

## Properties

### primary

> `readonly` **primary**: [`StoragePort`](../interfaces/StoragePort.md)

Defined in: [lib/site-governance/binders.ts:176](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L176)

***

### secondary

> `readonly` **secondary**: [`StoragePort`](../interfaces/StoragePort.md)

Defined in: [lib/site-governance/binders.ts:177](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L177)

## Methods

### readDocument()

> **readDocument**(`id`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md) \| `null`\>

Defined in: [lib/site-governance/binders.ts:186](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L186)

Reads document with zero downtime:
1. Attempts read from primary storage.
2. If primary fails or item missing, falls back to secondary storage.
3. If found in secondary, asynchronously backfills item to primary storage.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md) \| `null`\>

***

### reconcile()

> **reconcile**(): `Promise`\<\{ `primaryCount`: `number`; `secondaryCount`: `number`; `syncedCount`: `number`; \}\>

Defined in: [lib/site-governance/binders.ts:220](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L220)

Reconciles all documents between primary and secondary ports for 100% parity.

#### Returns

`Promise`\<\{ `primaryCount`: `number`; `secondaryCount`: `number`; `syncedCount`: `number`; \}\>

***

### writeDocument()

> **writeDocument**(`doc`): `Promise`\<`void`\>

Defined in: [lib/site-governance/binders.ts:213](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L213)

Dual-writes document to both primary and secondary storage ports.

#### Parameters

##### doc

[`BinderDocument`](../../types/interfaces/BinderDocument.md)

#### Returns

`Promise`\<`void`\>
