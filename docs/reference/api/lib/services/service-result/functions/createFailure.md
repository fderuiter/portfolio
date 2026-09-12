[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/service-result](../README.md) / createFailure

# Function: createFailure()

> **createFailure**\<`E`\>(`code`, `message`, `options?`): [`ServiceFailure`](../interfaces/ServiceFailure.md)\<`E`\>

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
