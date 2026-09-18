[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/media-storage](../README.md) / MediaStorageProvider

# Interface: MediaStorageProvider

Pluggable media storage provider contract per ADR 0043.

## Methods

### delete()

> **delete**(`key`): `Promise`\<`void`\>

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### getAsset()?

> `optional` **getAsset**(`key`): `Promise`\<[`MediaAssetRecord`](MediaAssetRecord.md) \| `null`\>

#### Parameters

##### key

`string`

#### Returns

`Promise`\<[`MediaAssetRecord`](MediaAssetRecord.md) \| `null`\>

***

### getUrl()

> **getUrl**(`key`): `string`

#### Parameters

##### key

`string`

#### Returns

`string`

***

### upload()

> **upload**(`file`, `filename`, `contentType`): `Promise`\<[`MediaUploadResult`](MediaUploadResult.md)\>

#### Parameters

##### file

`Buffer`

##### filename

`string`

##### contentType

`string`

#### Returns

`Promise`\<[`MediaUploadResult`](MediaUploadResult.md)\>
