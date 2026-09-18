[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/personal-library](../README.md) / PersonalLibraryEntry

# Interface: PersonalLibraryEntry

One saved block. `version` increments on every edit, and an insertion
records the version it was taken from.

## Properties

### assumptions?

> `optional` **assumptions?**: `string`

Free-text notes the author wants carried with the block - protocol
assumptions, units, populations it is valid for.

***

### codelists

> **codelists**: [`CodelistDefinition`](../../types/interfaces/CodelistDefinition.md)[]

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

### name

> **name**: `string`

***

### provenance

> **provenance**: [`LibraryEntryProvenance`](LibraryEntryProvenance.md)

***

### rules

> **rules**: [`EditCheckRule`](../../types/interfaces/EditCheckRule.md)[]

***

### section

> **section**: [`CRFSection`](../../types/interfaces/CRFSection.md)

***

### updatedAt

> **updatedAt**: `string`

***

### version

> **version**: `number`

Monotonic version, incremented by each successful update.
