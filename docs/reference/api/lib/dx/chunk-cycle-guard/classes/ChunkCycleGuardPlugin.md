[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/chunk-cycle-guard](../README.md) / ChunkCycleGuardPlugin

# Class: ChunkCycleGuardPlugin

Webpack plugin that turns a runtime chunk cycle into a compilation error.
Registered for every compilation (client, server and edge) from
`next.config.ts`, so `npm run build` fails on Vercel and in CI.

## Constructors

### Constructor

> **new ChunkCycleGuardPlugin**(): `ChunkCycleGuardPlugin`

#### Returns

`ChunkCycleGuardPlugin`

## Properties

### pluginName

> `readonly` `static` **pluginName**: `"ChunkCycleGuardPlugin"` = `"ChunkCycleGuardPlugin"`

## Methods

### apply()

> **apply**(`compiler`): `void`

#### Parameters

##### compiler

[`ChunkCycleCompilerLike`](../interfaces/ChunkCycleCompilerLike.md)

#### Returns

`void`
