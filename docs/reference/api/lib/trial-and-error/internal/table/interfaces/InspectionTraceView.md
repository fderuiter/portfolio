[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / InspectionTraceView

# Interface: InspectionTraceView

Table-to-Listing tracing for the inspected output.

## Properties

### blocked

> **blocked**: `string` \| `null`

Why no cell can be traced now, or null.

***

### cells

> **cells**: `Record`\<`string`, [`CellTrace`](../../listing/interfaces/CellTrace.md)\>

The Listing rows behind each traced cell, keyed `row:col`.

***

### listing

> **listing**: \{ `cardType`: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`; `chips`: `number`; `csrStage?`: `"DISPOSITION"` \| `"BASELINE"` \| `"EFFICACY"` \| `"SAFETY_AE"` \| `"PATIENT_LISTING"`; `draftId?`: `string`; `face?`: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}; `id`: `string`; `mult`: `number`; `number`: `string`; `population`: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`; `shellId?`: `string`; `soc?`: `string`; `title`: `string`; `topic`: `string`; \} \| `null`

The supporting Listing in hand the Table traces into, or null.

#### Union Members

##### Type Literal

\{ `cardType`: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"`; `chips`: `number`; `csrStage?`: `"DISPOSITION"` \| `"BASELINE"` \| `"EFFICACY"` \| `"SAFETY_AE"` \| `"PATIENT_LISTING"`; `draftId?`: `string`; `face?`: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}; `id`: `string`; `mult`: `number`; `number`: `string`; `population`: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`; `shellId?`: `string`; `soc?`: `string`; `title`: `string`; `topic`: `string`; \}

##### cardType

> **cardType**: `"TABLE"` \| `"LISTING"` \| `"FIGURE"` \| `"SUBJECT_TOKEN"` = `CardTypeSchema`

##### chips

> **chips**: `number` = `nonNegativeInt`

##### csrStage?

> `optional` **csrStage?**: `"DISPOSITION"` \| `"BASELINE"` \| `"EFFICACY"` \| `"SAFETY_AE"` \| `"PATIENT_LISTING"`

##### draftId?

> `optional` **draftId?**: `string`

##### face?

> `optional` **face?**: \{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}

Face data. Draft cards derive their face from the draft table instead.

##### id

> **id**: `string` = `identifier`

##### mult

> **mult**: `number` = `nonNegativeInt`

##### number

> **number**: `string`

##### population

> **population**: `"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"` = `PopulationTypeSchema`

##### shellId?

> `optional` **shellId?**: `string`

A blank shell: a planned output with no cohort data allocated yet. It
compiles only once the player allocates one of the shell's analysis sets.

##### soc?

> `optional` **soc?**: `string`

##### title

> **title**: `string`

##### topic

> **topic**: `string` = `identifier`

***

`null`

***

### log

> **log**: [`TraceRecord`](TraceRecord.md)[]

This output's audit log entries, in trace order.

***

### synergy

> **synergy**: `boolean`

Playing the Table with `listing` earns the TLF Pair ×Mult now.
