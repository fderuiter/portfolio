[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/route-wrapper](../README.md) / ApiWrapperOptions

# Interface: ApiWrapperOptions\<TSchema\>

## Type Parameters

### TSchema

`TSchema` *extends* `ZodSchema` = `ZodSchema`

## Properties

### customJsonError?

> `optional` **customJsonError?**: `string`

***

### customValidationError?

> `optional` **customValidationError?**: (`error`, `req`) => `object`

#### Parameters

##### error

`unknown`

##### req

`NextRequest`

#### Returns

`object`

##### details?

> `optional` **details?**: `object`[]

##### error

> **error**: `string`

***

### defaultStatus?

> `optional` **defaultStatus?**: `number`

***

### schema?

> `optional` **schema?**: `TSchema`

***

### type?

> `optional` **type?**: `"body"` \| `"query"`
