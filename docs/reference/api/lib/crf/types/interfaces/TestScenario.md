[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / TestScenario

# Interface: TestScenario

Declared here rather than in the scenario engine so `types.ts` remains the
single public contract for the study document, with no runtime import and
therefore no cycle between the contract and the engine that operates on it.

## Properties

### createdAt

> **createdAt**: `string`

***

### description?

> `optional` **description?**: `string`

***

### expectations

> **expectations**: [`ScenarioExpectation`](../type-aliases/ScenarioExpectation.md)[]

***

### formId

> **formId**: `string`

***

### id

> **id**: `string`

***

### inputs

> **inputs**: `Record`\<`string`, `string` \| `number` \| `boolean` \| `null`\>

***

### lastRun?

> `optional` **lastRun?**: [`ScenarioRunEvidence`](ScenarioRunEvidence.md)

***

### name

> **name**: `string`

***

### scope

> **scope**: `object`

#### subjectId

> **subjectId**: `string`

#### visitId

> **visitId**: `string`

***

### updatedAt

> **updatedAt**: `string`
