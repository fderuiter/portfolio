[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/blinding](../README.md) / structuralQc

# Function: structuralQc()

> **structuralQc**(`draft`, `shell`): [`StructuralQcReport`](../interfaces/StructuralQcReport.md)

Structural QC of a blinded draft, run across the DMC firewall. It checks
that both treatment arms have a column (and that the columns match the
shell's layout when it has one), that no planned row or cell is missing,
and that every cell in a row prints the same format. Its results name
columns and rows only: no cell value, and no digit of one, reaches them.
Deterministic and pure.

## Parameters

### draft

#### cells

`string`[][] = `...`

#### columns

`object`[] = `...`

#### draftLabel

`string` = `...`

#### id

`string` = `identifier`

#### populationSnapshotId

`string` = `identifier`

#### rows

`object`[] = `...`

#### shellId

`string` = `identifier`

### shell

\{ `allowedFootnoteSlots`: `number`; `cardType`: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`; `chips`: `number`; `compatiblePopulations?`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `id`: `string`; `isBlinded?`: `boolean`; `layout?`: \{ `columns`: `object`[]; `rows`: `object`[]; \}; `mult`: `number`; `requiredRulebookId`: `string`; `tableNumber`: `string`; `targetPopulation`: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`; `title`: `string`; \} \| `undefined`

#### Type Literal

\{ `allowedFootnoteSlots`: `number`; `cardType`: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`; `chips`: `number`; `compatiblePopulations?`: (`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[]; `id`: `string`; `isBlinded?`: `boolean`; `layout?`: \{ `columns`: `object`[]; `rows`: `object`[]; \}; `mult`: `number`; `requiredRulebookId`: `string`; `tableNumber`: `string`; `targetPopulation`: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`; `title`: `string`; \}

##### allowedFootnoteSlots

`number` = `nonNegativeInt`

##### cardType

`"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"` = `CardTypeSchema`

##### chips

`number` = `nonNegativeInt`

##### compatiblePopulations?

(`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`)[] = `...`

##### id

`string` = `identifier`

##### isBlinded?

`boolean` = `...`

A closed-session output: face down, and absent from the derived view,
until the scenario's DMC convenes the closed session.

##### layout?

\{ `columns`: `object`[]; `rows`: `object`[]; \} = `...`

##### layout.columns

`object`[] = `...`

##### layout.rows

`object`[] = `...`

##### mult

`number` = `nonNegativeInt`

##### requiredRulebookId

`string` = `identifier`

##### tableNumber

`string` = `...`

##### targetPopulation

`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"` = `PopulationTypeSchema`

##### title

`string` = `...`

***

`undefined`

## Returns

[`StructuralQcReport`](../interfaces/StructuralQcReport.md)
