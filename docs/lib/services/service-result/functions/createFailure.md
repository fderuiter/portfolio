[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/service-result](../README.md) / createFailure

# Function: createFailure()

> **createFailure**\<`E`\>(`code`, `message`, `options?`): [`ServiceFailure`](../interfaces/ServiceFailure.md)\<`E`\>

Defined in: [lib/services/service-result.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/services/service-result.ts#L40)

Creates a type-safe failure ServiceResult envelope with structured error taxonomy.

## Type Parameters

### E

`E` *extends* `string` = `string`

## Parameters

### code

`E`

### message

`string`

### options?

#### details?

`unknown`

#### recoverable?

`boolean`

#### suggestion?

`string`

## Returns

[`ServiceFailure`](../interfaces/ServiceFailure.md)\<`E`\>
