[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / SnapshotRefSchema

# Variable: SnapshotRefSchema

> `const` **SnapshotRefSchema**: `ZodObject`\<\{ `capturedAt`: `ZodISODateTime`; `id`: `ZodString`; `version`: `ZodNumber`; \}, `$strip`\>

Which snapshot an output was compiled against: its id, version and capture
time. Every dealt card carries one, so its denominators have provenance.
