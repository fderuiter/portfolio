[**fderuiter-portfolio**](../../../../../../README.md)

***

[fderuiter-portfolio](../../../../../../modules.md) / [lib/services/duck/interact-hazard/spec](../README.md) / InteractHazardSpec

# Interface: InteractHazardSpec

Defined in: [lib/services/duck/interact-hazard/spec.ts:42](https://github.com/fderuiter/portfolio/blob/main/lib/services/duck/interact-hazard/spec.ts#L42)

## Methods

### execute()

> **execute**(`input`): [`InteractHazardResult`](../type-aliases/InteractHazardResult.md)

Defined in: [lib/services/duck/interact-hazard/spec.ts:43](https://github.com/fderuiter/portfolio/blob/main/lib/services/duck/interact-hazard/spec.ts#L43)

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

[`InteractHazardResult`](../type-aliases/InteractHazardResult.md)
