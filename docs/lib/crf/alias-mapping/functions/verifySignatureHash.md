[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/alias-mapping](../README.md) / verifySignatureHash

# Function: verifySignatureHash()

> **verifySignatureHash**(`signature`, `releases?`, `_currentFormValues?`): `object`

Defined in: [lib/crf/alias-mapping.ts:181](https://github.com/fderuiter/portfolio/blob/main/lib/crf/alias-mapping.ts#L181)

Validates electronic signature against protocol release snapshot or signature snapshot.
Preserves 100% hash verification across protocol releases.

## Parameters

### signature

[`ElectronicSignature`](../../types/interfaces/ElectronicSignature.md)

### releases?

[`ProtocolRelease`](../../types/interfaces/ProtocolRelease.md)[] = `[]`

### \_currentFormValues?

`Record`\<`string`, `string` \| `number` \| `boolean` \| `null`\> = `{}`

## Returns

`object`

### isValid

> **isValid**: `boolean`

### message

> **message**: `string`

### signedVersion

> **signedVersion**: `string`
