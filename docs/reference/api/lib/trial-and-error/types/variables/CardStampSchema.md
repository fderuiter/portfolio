[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / CardStampSchema

# Variable: CardStampSchema

> `const` **CardStampSchema**: `ZodEnum`\<\{ `BLINDED`: `"BLINDED"`; `QC_PASS`: `"QC_PASS"`; `REDLINE`: `"REDLINE"`; `SEALED`: `"SEALED"`; `STALE`: `"STALE"`; \}\>

Marks stamped on a card face. T&E-UX-03 produces REDLINE and QC_PASS; the
rest are the slots later tickets fill (stale outputs, sealed and blinded
sessions).
