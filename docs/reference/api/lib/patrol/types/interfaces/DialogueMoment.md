[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/types](../README.md) / DialogueMoment

# Interface: DialogueMoment

A single interpersonal/delegation dialogue beat: a prompt from another
character (patient, bystander, fellow patroller, or dispatch) paired with
several non-binary response options.

## Properties

### afterActionId?

> `optional` **afterActionId?**: `string`

ID of the scenario action that must be completed before this moment becomes available.

***

### context?

> `optional` **context?**: `string`

Optional stage-direction / scene-setting context.

***

### id

> **id**: `string`

***

### options

> **options**: [`DialogueOption`](DialogueOption.md)[]

***

### prompt

> **prompt**: `string`

The line or situation prompting a response.

***

### speaker

> **speaker**: `string`

Who initiates this dialogue beat, e.g. "Casey (Second-Year Patroller)".
