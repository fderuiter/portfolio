[**fderuiter-portfolio**](../../../../../../README.md)

***

[fderuiter-portfolio](../../../../../../modules.md) / [lib/services/garmin/sync-flash-storage/handler](../README.md) / SyncFlashStorageHandler

# Class: SyncFlashStorageHandler

Defined in: [lib/services/garmin/sync-flash-storage/handler.ts:13](https://github.com/fderuiter/portfolio/blob/main/lib/services/garmin/sync-flash-storage/handler.ts#L13)

## Implements

- [`SyncFlashStorageSpec`](../../spec/interfaces/SyncFlashStorageSpec.md)

## Constructors

### Constructor

> **new SyncFlashStorageHandler**(): `SyncFlashStorageHandler`

#### Returns

`SyncFlashStorageHandler`

## Methods

### execute()

> **execute**(`input`): `Promise`\<[`SyncFlashStorageResult`](../../spec/type-aliases/SyncFlashStorageResult.md)\>

Defined in: [lib/services/garmin/sync-flash-storage/handler.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/services/garmin/sync-flash-storage/handler.ts#L14)

#### Parameters

##### input

###### action

`"load"` \| `"clear"` \| `"save"` = `...`

###### variables?

`object`[] = `...`

#### Returns

`Promise`\<[`SyncFlashStorageResult`](../../spec/type-aliases/SyncFlashStorageResult.md)\>

#### Implementation of

[`SyncFlashStorageSpec`](../../spec/interfaces/SyncFlashStorageSpec.md).[`execute`](../../spec/interfaces/SyncFlashStorageSpec.md#execute)
