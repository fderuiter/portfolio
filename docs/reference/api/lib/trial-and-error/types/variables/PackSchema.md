[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/types](../README.md) / PackSchema

# Variable: PackSchema

> `const` **PackSchema**: `ZodObject`\<\{ `choose`: `ZodNumber`; `description`: `ZodString`; `id`: `ZodString`; `kind`: `ZodEnum`\<\{ `GUIDANCE`: `"GUIDANCE"`; `RELIC`: `"RELIC"`; `SITE_ACTIVATION`: `"SITE_ACTIVATION"`; \}\>; `name`: `ZodString`; `price`: `ZodNumber`; `size`: `ZodNumber`; \}, `$strip`\>

A booster pack: it opens to `size` cards, of which the player keeps `choose`.
