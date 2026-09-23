[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / PopulationTypeSchema

# Variable: PopulationTypeSchema

> `const` **PopulationTypeSchema**: `ZodEnum`\<\{ `FAS`: `"FAS"`; `ITT`: `"ITT"`; `PER_PROTOCOL`: `"PER_PROTOCOL"`; `SAFETY`: `"SAFETY"`; `SCREENED`: `"SCREENED"`; \}\>

Analysis populations act as card suits. FAS and ITT are distinct members:
a scenario may only treat them as equivalent by declaring an alias in its
SAP rulebook.
