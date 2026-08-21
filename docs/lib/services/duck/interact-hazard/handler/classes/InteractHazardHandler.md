[**fderuiter-portfolio**](../../../../../../README.md)

***

[fderuiter-portfolio](../../../../../../modules.md) / [lib/services/duck/interact-hazard/handler](../README.md) / InteractHazardHandler

# Class: InteractHazardHandler

Defined in: [lib/services/duck/interact-hazard/handler.ts:13](https://github.com/fderuiter/portfolio/blob/main/lib/services/duck/interact-hazard/handler.ts#L13)

## Implements

- [`InteractHazardSpec`](../../spec/interfaces/InteractHazardSpec.md)

## Constructors

### Constructor

> **new InteractHazardHandler**(): `InteractHazardHandler`

#### Returns

`InteractHazardHandler`

## Methods

### execute()

> **execute**(`input`): [`InteractHazardResult`](../../spec/type-aliases/InteractHazardResult.md)

Defined in: [lib/services/duck/interact-hazard/handler.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/services/duck/interact-hazard/handler.ts#L14)

#### Parameters

##### input

###### action

`"distract_with_squeaky"` \| `"distract_with_kong"` \| `"fix_hazard"` = `...`

###### hazardId?

`string` = `...`

###### state

[`WorkingWithDuckState`](../../../../../working-with-duck-engine/interfaces/WorkingWithDuckState.md) = `...`

###### x?

`number` = `...`

###### y?

`number` = `...`

#### Returns

[`InteractHazardResult`](../../spec/type-aliases/InteractHazardResult.md)

#### Implementation of

[`InteractHazardSpec`](../../spec/interfaces/InteractHazardSpec.md).[`execute`](../../spec/interfaces/InteractHazardSpec.md#execute)
