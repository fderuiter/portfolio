[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/snapshots](../README.md) / TransitionOutcome

# Type Alias: TransitionOutcome

> **TransitionOutcome** = \{ `changed`: [`PopulationType`](../../../types/type-aliases/PopulationType.md)[]; `ok`: `true`; `snapshot`: [`PopulationSnapshot`](../../../types/type-aliases/PopulationSnapshot.md); \} \| \{ `message`: `string`; `ok`: `false`; \}

The result of applying a transition: the next version, or a refusal.
