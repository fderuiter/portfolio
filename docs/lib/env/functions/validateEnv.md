[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/env](../README.md) / validateEnv

# Function: validateEnv()

> **validateEnv**(`rawEnv?`): `object`

Defined in: [lib/env.ts:83](https://github.com/fderuiter/portfolio/blob/main/lib/env.ts#L83)

Validate and parse environment variables against the defined schemas.
Returns parsed object and validation issues (if any).

## Parameters

### rawEnv?

`Record`\<`string`, `string` \| `undefined`\> = `process.env`

## Returns

`object`

### data

> **data**: [`AppEnv`](../type-aliases/AppEnv.md)

### errors

> **errors**: `Record`\<`string`, `string`[]\>

### success

> **success**: `boolean`
