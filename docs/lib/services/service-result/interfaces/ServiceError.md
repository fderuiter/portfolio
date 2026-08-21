[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/service-result](../README.md) / ServiceError

# Interface: ServiceError\<E\>

Defined in: [lib/services/service-result.ts:6](https://github.com/fderuiter/portfolio/blob/main/lib/services/service-result.ts#L6)

Standardized Service Result & Error Envelope
Adheres to ADR 0028 and Typed Service Contract (Spec & Handler) architecture.

## Type Parameters

### E

`E` *extends* `string` = `string`

## Properties

### code

> **code**: `E`

Defined in: [lib/services/service-result.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/services/service-result.ts#L7)

***

### details?

> `optional` **details?**: `unknown`

Defined in: [lib/services/service-result.ts:11](https://github.com/fderuiter/portfolio/blob/main/lib/services/service-result.ts#L11)

***

### message

> **message**: `string`

Defined in: [lib/services/service-result.ts:8](https://github.com/fderuiter/portfolio/blob/main/lib/services/service-result.ts#L8)

***

### recoverable

> **recoverable**: `boolean`

Defined in: [lib/services/service-result.ts:10](https://github.com/fderuiter/portfolio/blob/main/lib/services/service-result.ts#L10)

***

### suggestion?

> `optional` **suggestion?**: `string`

Defined in: [lib/services/service-result.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/services/service-result.ts#L9)
