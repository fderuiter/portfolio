[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/route-wrapper](../README.md) / withApiWrapper

# Variable: withApiWrapper

> `const` **withApiWrapper**: \<`TSchema`\>(`handler`, `options?`) => (`rawReq?`, `routeParams?`) => `Promise`\<`NextResponse`\<`unknown`\>\> = `createApiHandler`

Defined in: [lib/route-wrapper.ts:134](https://github.com/fderuiter/portfolio/blob/main/lib/route-wrapper.ts#L134)

Higher-order API route handler wrapper.
Provides automated Zod request schema validation, uniform error transformation,
Sentry exception logging, error sanitization, and security header enforcement.

## Type Parameters

### TSchema

`TSchema` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### handler

[`ApiHandler`](../type-aliases/ApiHandler.md)\<`TSchema` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\> ? `TSchema`\[`"_output"`\] : `undefined`\>

### options?

[`ApiWrapperOptions`](../interfaces/ApiWrapperOptions.md)\<`TSchema`\>

## Returns

(`rawReq?`, `routeParams?`) => `Promise`\<`NextResponse`\<`unknown`\>\>
