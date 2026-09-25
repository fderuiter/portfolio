[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / EncounterStageView

# Interface: EncounterStageView

One stage of a staged encounter, as the Blind panel shows it.

## Extends

- [`EncounterStage`](../../../types/type-aliases/EncounterStage.md)

## Properties

### hands

> **hands**: (`"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`)[]

#### Inherited from

`EncounterStage.hands`

***

### name

> **name**: `string`

#### Inherited from

`EncounterStage.name`

***

### quota

> **quota**: `number`

#### Inherited from

`EncounterStage.quota`

***

### score

> **score**: `number`

***

### session

> **session**: `"OPEN"` \| `"CLOSED"`

#### Inherited from

`EncounterStage.session`

***

### status

> **status**: `"ACTIVE"` \| `"DEFENDED"` \| `"PENDING"`
