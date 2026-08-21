[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/telemetry/outbox](../README.md) / TelemetryStorage

# Interface: TelemetryStorage

Defined in: [lib/telemetry/outbox.ts:65](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L65)

Storage adapter interface matching Web Storage API subset.

## Methods

### getItem()

> **getItem**(`key`): `string` \| `null`

Defined in: [lib/telemetry/outbox.ts:66](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L66)

#### Parameters

##### key

`string`

#### Returns

`string` \| `null`

***

### removeItem()

> **removeItem**(`key`): `void`

Defined in: [lib/telemetry/outbox.ts:68](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L68)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### setItem()

> **setItem**(`key`, `value`): `void`

Defined in: [lib/telemetry/outbox.ts:67](https://github.com/fderuiter/portfolio/blob/main/lib/telemetry/outbox.ts#L67)

#### Parameters

##### key

`string`

##### value

`string`

#### Returns

`void`
