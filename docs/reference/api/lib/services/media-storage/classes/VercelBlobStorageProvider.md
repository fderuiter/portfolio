[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/media-storage](../README.md) / VercelBlobStorageProvider

# Class: VercelBlobStorageProvider

Cloud storage provider directing media uploads to Vercel Blob.
Active in preview and production environments with BLOB_READ_WRITE_TOKEN.

## Implements

- [`MediaStorageProvider`](../interfaces/MediaStorageProvider.md)

## Constructors

### Constructor

> **new VercelBlobStorageProvider**(`token?`): `VercelBlobStorageProvider`

#### Parameters

##### token?

`string`

#### Returns

`VercelBlobStorageProvider`

## Methods

### delete()

> **delete**(`key`): `Promise`\<`void`\>

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MediaStorageProvider`](../interfaces/MediaStorageProvider.md).[`delete`](../interfaces/MediaStorageProvider.md#delete)

***

### getUrl()

> **getUrl**(`key`): `string`

#### Parameters

##### key

`string`

#### Returns

`string`

#### Implementation of

[`MediaStorageProvider`](../interfaces/MediaStorageProvider.md).[`getUrl`](../interfaces/MediaStorageProvider.md#geturl)

***

### upload()

> **upload**(`file`, `filename`, `contentType`): `Promise`\<[`MediaUploadResult`](../interfaces/MediaUploadResult.md)\>

#### Parameters

##### file

`Buffer`

##### filename

`string`

##### contentType

`string`

#### Returns

`Promise`\<[`MediaUploadResult`](../interfaces/MediaUploadResult.md)\>

#### Implementation of

[`MediaStorageProvider`](../interfaces/MediaStorageProvider.md).[`upload`](../interfaces/MediaStorageProvider.md#upload)
