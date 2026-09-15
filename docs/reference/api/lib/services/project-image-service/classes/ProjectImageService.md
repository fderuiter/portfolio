[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/project-image-service](../README.md) / ProjectImageService

# Class: ProjectImageService

## Constructors

### Constructor

> **new ProjectImageService**(): `ProjectImageService`

#### Returns

`ProjectImageService`

## Methods

### deleteMediaAsset()

> `static` **deleteMediaAsset**(`key`): `boolean`

Deletes a media asset from storage by key.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### getMediaAsset()

> `static` **getMediaAsset**(`key`): [`MediaAssetRecord`](../interfaces/MediaAssetRecord.md) \| `null`

Retrieves a media asset from storage by key.

#### Parameters

##### key

`string`

#### Returns

[`MediaAssetRecord`](../interfaces/MediaAssetRecord.md) \| `null`

***

### saveMediaAsset()

> `static` **saveMediaAsset**(`key`, `buffer`, `contentType`): `string`

Saves a validated media buffer to storage and returns its relative asset URL.

#### Parameters

##### key

`string`

##### buffer

`Buffer`

##### contentType

`string`

#### Returns

`string`

***

### uploadProjectImage()

> `static` **uploadProjectImage**(`slug`, `fileBuffer`, `mimeType`): `Promise`\<\{ `hero_image_url`: `string`; `key`: `string`; \}\>

Processes, validates, persists, and links a project image asset to a case study.
If database persistence fails, the prior asset is preserved.

#### Parameters

##### slug

`string`

##### fileBuffer

`Buffer`

##### mimeType

`string`

#### Returns

`Promise`\<\{ `hero_image_url`: `string`; `key`: `string`; \}\>
