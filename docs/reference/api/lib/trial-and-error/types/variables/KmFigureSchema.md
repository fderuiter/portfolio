[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / KmFigureSchema

# Variable: KmFigureSchema

> `const` **KmFigureSchema**: `ZodObject`\<\{ `displayed`: `ZodArray`\<`ZodObject`\<\{ `arm`: `ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `PLACEBO`: `"PLACEBO"`; \}\>; `atRisk`: `ZodArray`\<`ZodNumber`\>; `censorTicks`: `ZodArray`\<`ZodNumber`\>; `curve`: `ZodArray`\<`ZodTuple`\<\[`ZodNumber`, `ZodNumber`\], `null`\>\>; \}, `$strip`\>\>; `endpoint`: `ZodString`; `milestones`: `ZodArray`\<`ZodNumber`\>; `parent`: `ZodObject`\<\{ `atRiskRow`: `ZodString`; `cardId`: `ZodString`; `eventsRow`: `ZodString`; \}, `$strip`\>; `populationSnapshotId`: `ZodString`; `records`: `ZodArray`\<`ZodObject`\<\{ `event`: `ZodBoolean`; `subjectId`: `ZodString`; `time`: `ZodNumber`; \}, `$strip`\>\>; `timeOrigin`: `ZodNumber`; `timeUnit`: `ZodString`; \}, `$strip`\>

A Kaplan–Meier figure: the time-to-event records it was compiled from, the
immutable snapshot they belong to, the parent Table it depends on, and
what the draft actually prints. `parent` names the parent's face rows that
must reconcile with the figure: subjects at risk at the origin and events.
