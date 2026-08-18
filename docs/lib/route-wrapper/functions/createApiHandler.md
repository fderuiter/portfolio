[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/route-wrapper](../README.md) / createApiHandler

# Function: createApiHandler()

## Call Signature

> **createApiHandler**\<`TSchema`\>(`handler`, `options`): (`rawReq?`, `routeParams?`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [lib/route-wrapper.ts:25](https://github.com/fderuiter/portfolio/blob/main/lib/route-wrapper.ts#L25)

Higher-order API route handler wrapper.
Provides automated Zod request schema validation, uniform error transformation,
Sentry exception logging, error sanitization, and security header enforcement.

### Type Parameters

#### TSchema

`TSchema` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

### Parameters

#### handler

[`ApiHandler`](../type-aliases/ApiHandler.md)\<`output`\<`TSchema`\>\>

#### options

[`ApiWrapperOptions`](../interfaces/ApiWrapperOptions.md)\<`TSchema`\> & `object`

### Returns

(`rawReq?`, `routeParams?`) => `Promise`\<`NextResponse`\<`unknown`\>\>

## Call Signature

> **createApiHandler**(`handler`, `options?`): (`rawReq?`, `routeParams?`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [lib/route-wrapper.ts:33](https://github.com/fderuiter/portfolio/blob/main/lib/route-wrapper.ts#L33)

Higher-order API route handler wrapper.
Provides automated Zod request schema validation, uniform error transformation,
Sentry exception logging, error sanitization, and security header enforcement.

### Parameters

#### handler

[`ApiHandler`](../type-aliases/ApiHandler.md)\<`undefined`\>

#### options?

[`ApiWrapperOptions`](../interfaces/ApiWrapperOptions.md)\<`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>\>

### Returns

(`rawReq?`, `routeParams?`) => `Promise`\<`NextResponse`\<`unknown`\>\>
