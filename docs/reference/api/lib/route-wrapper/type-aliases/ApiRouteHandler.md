[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/route-wrapper](../README.md) / ApiRouteHandler

# Type Alias: ApiRouteHandler

> **ApiRouteHandler** = \{(`req?`, `routeParams?`): `Promise`\<`NextResponse`\<`unknown`\>\>; (`req`, `routeContext`): `Promise`\<`NextResponse`\<`unknown`\>\>; \}

## Call Signature

> (`req?`, `routeParams?`): `Promise`\<`NextResponse`\<`unknown`\>\>

### Parameters

#### req?

`NextRequest`

#### routeParams?

##### params?

`Promise`\<`Record`\<`string`, `string` \| `string`[] \| `undefined`\>\> \| `Record`\<`string`, `string` \| `string`[] \| `undefined`\>

### Returns

`Promise`\<`NextResponse`\<`unknown`\>\>

## Call Signature

> (`req`, `routeContext`): `Promise`\<`NextResponse`\<`unknown`\>\>

### Parameters

#### req

`NextRequest`

#### routeContext

##### params

`Promise`\<`Record`\<`string`, `string` \| `string`[] \| `undefined`\>\>

### Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
