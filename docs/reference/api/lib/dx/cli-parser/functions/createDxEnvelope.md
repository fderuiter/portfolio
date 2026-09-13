[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/cli-parser](../README.md) / createDxEnvelope

# Function: createDxEnvelope()

> **createDxEnvelope**\<`T`\>(`options`): [`DxEnvelope`](../interfaces/DxEnvelope.md)\<`T`\>

Creates a standardized DX JSON Envelope

## Type Parameters

### T

`T` = `unknown`

## Parameters

### options

#### command

`string`

#### data

`T`

#### durationMs

`number`

#### metadata?

`Record`\<`string`, `unknown`\>

#### remediations?

[`RemediationAction`](../interfaces/RemediationAction.md)[]

#### success

`boolean`

## Returns

[`DxEnvelope`](../interfaces/DxEnvelope.md)\<`T`\>
