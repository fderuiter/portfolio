[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/types](../README.md) / ClinicalSubject

# Interface: ClinicalSubject

## Properties

### assignedDomainSlot?

> `optional` **assignedDomainSlot?**: [`CDISCDomain`](../type-aliases/CDISCDomain.md)

***

### createdAt

> **createdAt**: `number`

***

### id

> **id**: `string`

***

### isSAE?

> `optional` **isSAE?**: `boolean`

***

### maxTime

> **maxTime**: `number`

***

### observations

> **observations**: [`ClinicalObservation`](ClinicalObservation.md)[]

***

### status

> **status**: `"queued"` \| `"validating"` \| `"routing"` \| `"signing"` \| `"submitted"` \| `"rejected"` \| `"expired"`

***

### studySite

> **studySite**: `string`

***

### subjectLabel

> **subjectLabel**: `string`

***

### timeRemaining

> **timeRemaining**: `number`
