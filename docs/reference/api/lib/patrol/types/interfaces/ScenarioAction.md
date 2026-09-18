[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/types](../README.md) / ScenarioAction

# Interface: ScenarioAction

## Properties

### category?

> `optional` **category?**: [`ActionCategory`](../type-aliases/ActionCategory.md)

***

### costMinutes?

> `optional` **costMinutes?**: `number`

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

### preconditions?

> `optional` **preconditions?**: `string`[]

IDs of actions that must be executed prior to this action becoming available.

***

### prerequisites?

> `optional` **prerequisites?**: `string`[]

Alias for preconditions to ensure backwards compatibility.

***

### reassessesSceneSafety?

> `optional` **reassessesSceneSafety?**: `boolean`

Whether this action triggers a scene safety re-assessment.

***

### requiredEquipment?

> `optional` **requiredEquipment?**: `string`[]

***

### requiresSceneSafety?

> `optional` **requiresSceneSafety?**: `boolean`

Whether executing this action without secured scene safety causes condition deterioration.

***

### reveals?

> `optional` **reveals?**: `object`

Data progressively revealed when this action is completed.

#### actors?

> `optional` **actors?**: [`PatrolActor`](PatrolActor.md)[]

#### environment?

> `optional` **environment?**: `Partial`\<[`EnvironmentState`](EnvironmentState.md)\>

#### findings?

> `optional` **findings?**: `string`[]

#### patient?

> `optional` **patient?**: `Partial`\<[`PatientState`](PatientState.md)\>

***

### securesSceneSafety?

> `optional` **securesSceneSafety?**: `boolean`

Whether this action establishes or secures scene safety (such as uphill crossed skis).

***

### vitalsCheck?

> `optional` **vitalsCheck?**: [`VitalsData`](VitalsData.md)

Vitals measured or checked when this action is executed.
