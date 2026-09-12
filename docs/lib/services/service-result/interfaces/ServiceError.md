[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/service-result](../README.md) / ServiceError

# Interface: ServiceError\<E\>

Standardized Service Result & Error Envelope
Adheres to ADR 0028 and Typed Service Contract (Spec & Handler) architecture.

## Type Parameters

### E

`E` *extends* `string` = `string`

## Properties

### code

> **code**: `E`

***

### details?

> `optional` **details?**: `unknown`

***

### message

> **message**: `string`

***

### recoverable

> **recoverable**: `boolean`

***

### suggestion?

> `optional` **suggestion?**: `string`
