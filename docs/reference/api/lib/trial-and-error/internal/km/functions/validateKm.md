[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/km](../README.md) / validateKm

# Function: validateKm()

> **validateKm**(`km`, `snapshot`, `population`, `parentFace?`): [`KmReport`](../interfaces/KmReport.md)

Validates a KM figure draft against the snapshot its records belong to and
its parent Table's face. It asserts a fixed time origin, a non-increasing
step function, survival estimates, censoring ticks, the Number-at-Risk row
at every milestone, and that the subjects at risk at the origin and the
event count reconcile with the parent Table. Deterministic and pure.

## Parameters

### km

#### displayed

`object`[] = `...`

#### endpoint

`string` = `...`

#### milestones

`number`[] = `...`

Number-at-Risk milestone times, strictly increasing, from 0.

#### parent

\{ `atRiskRow`: `string`; `cardId`: `string`; `eventsRow`: `string`; \} = `...`

#### parent.atRiskRow

`string` = `faceText`

#### parent.cardId

`string` = `identifier`

#### parent.eventsRow

`string` = `faceText`

#### populationSnapshotId

`string` = `identifier`

#### records

`object`[] = `...`

#### timeOrigin

`number` = `...`

The time origin the draft's axis starts at. The SAP fixes it at 0.

#### timeUnit

`string` = `...`

### snapshot

#### capturedAt

`string` = `...`

#### id

`string` = `identifier`

#### subjects

`object`[] = `...`

#### version

`number` = `...`

### population

`"SCREENED"` \| `"ITT"` \| `"SAFETY"` \| `"PER_PROTOCOL"` \| `"FAS"`

### parentFace?

\{ `columns`: `string`[]; `kind`: `"TABLE"`; `rows`: `object`[]; \} \| \{ `columns`: `string`[]; `kind`: `"LISTING"`; `rows`: `string`[][]; \} \| \{ `atRisk?`: \{ `rows`: `object`[]; `times`: `number`[]; \}; `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; `source?`: `string`; \} \| \{ `cohort`: `string`; `count`: `number`; `kind`: `"TOKEN"`; \}

#### Type Literal

\{ `atRisk?`: \{ `rows`: `object`[]; `times`: `number`[]; \}; `kind`: `"FIGURE"`; `plot`: \{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \}; `source?`: `string`; \}

##### atRisk?

\{ `rows`: `object`[]; `times`: `number`[]; \} = `...`

The Number-at-Risk strip under a KM plot, one row per arm.

##### atRisk.rows

`object`[] = `...`

##### atRisk.times

`number`[] = `...`

##### kind

`"FIGURE"` = `...`

##### plot

\{ `series`: `object`[]; `type`: `"KM"`; \} \| \{ `series`: `object`[]; `type`: `"SPARKLINE"`; \} \| \{ `intervals`: `object`[]; `reference`: `number`; `type`: `"FOREST"`; \} = `FigurePlotSchema`

##### source?

`string` = `...`

The parent Table's number, printed on a dependent Figure.

## Returns

[`KmReport`](../interfaces/KmReport.md)
