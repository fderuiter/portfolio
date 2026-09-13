[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/maintenance-service](../README.md) / MaintenanceAdapters

# Interface: MaintenanceAdapters

## Methods

### processEmailRetry()

> **processEmailRetry**(`now`): `Promise`\<`Record`\<`string`, `number` \| `null`\>\>

#### Parameters

##### now

`Date`

#### Returns

`Promise`\<`Record`\<`string`, `number` \| `null`\>\>

***

### runRetention()

> **runRetention**(`now`): `Promise`\<`Record`\<`string`, `number` \| `null`\>\>

#### Parameters

##### now

`Date`

#### Returns

`Promise`\<`Record`\<`string`, `number` \| `null`\>\>

***

### syncTelemetry()

> **syncTelemetry**(`batchSize`): `Promise`\<`Record`\<`string`, `number` \| `null`\>\>

#### Parameters

##### batchSize

`number`

#### Returns

`Promise`\<`Record`\<`string`, `number` \| `null`\>\>
