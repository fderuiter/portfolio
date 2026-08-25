[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/binders](../README.md) / BinderSyncEngine

# Class: BinderSyncEngine

Defined in: [lib/site-governance/binders.ts:168](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L168)

CRA QC Staging Workflow & Bidirectional eISF / eTMF Synchronizer Engine.

## Constructors

### Constructor

> **new BinderSyncEngine**(`adapter`): `BinderSyncEngine`

Defined in: [lib/site-governance/binders.ts:169](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L169)

#### Parameters

##### adapter

[`DualReadStorageAdapter`](DualReadStorageAdapter.md)

#### Returns

`BinderSyncEngine`

## Methods

### approveQC()

> **approveQC**(`docId`, `craId`, `qcComments?`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>

Defined in: [lib/site-governance/binders.ts:192](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L192)

CRA QC Approval action.

#### Parameters

##### docId

`string`

##### craId

`string`

##### qcComments?

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>

***

### performBatchSync()

> **performBatchSync**(`siteId`): `Promise`\<\{ `errors`: `string`[]; `processed`: `number`; `syncedToEtmf`: `number`; \}\>

Defined in: [lib/site-governance/binders.ts:266](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L266)

Executes batch bidirectional synchronization across site binder documents.

#### Parameters

##### siteId

`string`

#### Returns

`Promise`\<\{ `errors`: `string`[]; `processed`: `number`; `syncedToEtmf`: `number`; \}\>

***

### rejectQC()

> **rejectQC**(`docId`, `craId`, `rejectionReason`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>

Defined in: [lib/site-governance/binders.ts:210](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L210)

CRA QC Rejection action.

#### Parameters

##### docId

`string`

##### craId

`string`

##### rejectionReason

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>

***

### stageDocumentForQC()

> **stageDocumentForQC**(`doc`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>

Defined in: [lib/site-governance/binders.ts:174](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L174)

Stages a document in eISF for CRA QC review.

#### Parameters

##### doc

`Omit`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md), `"qcStatus"` \| `"etmfZone"`\> & `object`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>

***

### syncBackFromETMF()

> **syncBackFromETMF**(`docId`, `updates`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>

Defined in: [lib/site-governance/binders.ts:246](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L246)

Propagates eTMF metadata changes back to eISF.

#### Parameters

##### docId

`string`

##### updates

`Partial`\<`Pick`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md), `"version"` \| `"qcComments"` \| `"title"`\>\>

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>

***

### syncToETMF()

> **syncToETMF**(`docId`): `Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>

Defined in: [lib/site-governance/binders.ts:228](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/binders.ts#L228)

Synchronizes QC_APPROVED document from eISF to eTMF Zone.

#### Parameters

##### docId

`string`

#### Returns

`Promise`\<[`BinderDocument`](../../types/interfaces/BinderDocument.md)\>
