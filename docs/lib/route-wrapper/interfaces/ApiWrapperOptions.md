[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/route-wrapper](../README.md) / ApiWrapperOptions

# Interface: ApiWrapperOptions\<TSchema\>

Defined in: [lib/route-wrapper.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/route-wrapper.ts#L7)

## Type Parameters

### TSchema

`TSchema` *extends* `ZodSchema` = `ZodSchema`

## Properties

### customJsonError?

> `optional` **customJsonError?**: `string`

Defined in: [lib/route-wrapper.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/route-wrapper.ts#L14)

***

### customValidationError?

> `optional` **customValidationError?**: (`error`, `req`) => `object`

Defined in: [lib/route-wrapper.ts:10](https://github.com/fderuiter/portfolio/blob/main/lib/route-wrapper.ts#L10)

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

Defined in: [lib/route-wrapper.ts:15](https://github.com/fderuiter/portfolio/blob/main/lib/route-wrapper.ts#L15)

***

### schema?

> `optional` **schema?**: `TSchema`

Defined in: [lib/route-wrapper.ts:8](https://github.com/fderuiter/portfolio/blob/main/lib/route-wrapper.ts#L8)

***

### type?

> `optional` **type?**: `"body"` \| `"query"`

Defined in: [lib/route-wrapper.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/route-wrapper.ts#L9)
