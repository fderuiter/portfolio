[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/maintenance-service](../README.md) / MaintenanceService

# Class: MaintenanceService

Deep module for the single Vercel Hobby maintenance invocation. It isolates
phase failures, returns partial progress, and reserves response time before
the platform's ten-second function limit.

## Constructors

### Constructor

> **new MaintenanceService**(): `MaintenanceService`

#### Returns

`MaintenanceService`

## Methods

### run()

> `static` **run**(`options?`): `Promise`\<[`MaintenanceSummary`](../interfaces/MaintenanceSummary.md)\>

#### Parameters

##### options?

###### adapters?

[`MaintenanceAdapters`](../interfaces/MaintenanceAdapters.md)

###### batchSize?

`number`

###### clock?

() => `number`

###### deadlineMs?

`number`

###### now?

`Date`

#### Returns

`Promise`\<[`MaintenanceSummary`](../interfaces/MaintenanceSummary.md)\>
