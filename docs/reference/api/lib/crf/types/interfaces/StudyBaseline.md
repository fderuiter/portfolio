[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / StudyBaseline

# Interface: StudyBaseline

Immutable, version-tagged study baseline snapshot.

## Properties

### actor

> **actor**: [`StudyBaselineActor`](StudyBaselineActor.md)

***

### checksum?

> `optional` **checksum?**: `string`

***

### createdAt

> **createdAt**: `string`

***

### description?

> `optional` **description?**: `string`

***

### id

> **id**: `string`

***

### label

> **label**: `string`

***

### provenance?

> `optional` **provenance?**: `object`

#### parentBaselineId?

> `optional` **parentBaselineId?**: `string`

#### parentVersionTag?

> `optional` **parentVersionTag?**: `string`

#### totalFields

> **totalFields**: `number`

#### totalForms

> **totalForms**: `number`

#### totalRules

> **totalRules**: `number`

#### totalVisits

> **totalVisits**: `number`

***

### study

> **study**: [`StudyProtocol`](StudyProtocol.md)

***

### versionTag

> **versionTag**: `string`
