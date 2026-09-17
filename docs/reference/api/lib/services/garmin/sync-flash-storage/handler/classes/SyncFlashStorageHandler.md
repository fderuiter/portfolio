[**fderuiter-portfolio**](../../../../../../README.md)

***

[fderuiter-portfolio](../../../../../../modules.md) / [lib/services/garmin/sync-flash-storage/handler](../README.md) / SyncFlashStorageHandler

# Class: SyncFlashStorageHandler

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

#### Parameters

##### input

###### action

`"load"` \| `"save"` \| `"clear"` = `...`

###### variables?

`object`[] = `...`

#### Returns

`Promise`\<[`SyncFlashStorageResult`](../../spec/type-aliases/SyncFlashStorageResult.md)\>

#### Implementation of

[`SyncFlashStorageSpec`](../../spec/interfaces/SyncFlashStorageSpec.md).[`execute`](../../spec/interfaces/SyncFlashStorageSpec.md#execute)
