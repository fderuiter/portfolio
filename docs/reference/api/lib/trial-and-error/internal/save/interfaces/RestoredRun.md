[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/save](../README.md) / RestoredRun

# Interface: RestoredRun

A resumable run rebuilt from a save.

## Properties

### act

> **act**: `object`

#### blinds

> **blinds**: `object`[]

#### bossPool?

> `optional` **bossPool?**: `object`[]

#### crisisDeck?

> `optional` **crisisDeck?**: `object`[]

#### id

> **id**: `string` = `identifier`

#### shop?

> `optional` **shop?**: `object`

The Procurement Shop between Blinds. Without it there is no shop.

##### shop.entries

> **entries**: (\{ `kind`: `"RELIC"`; `price`: `number`; `relic`: \{ `description`: `string`; `id`: `string`; `modifier`: \{ `chips`: `number`; `label`: `string`; `plusMult`: `number`; `sourceId`: `string`; `xMult`: `number`; \}; `name`: `string`; \}; \} \| \{ `guidance`: \{ `document`: `string`; `flavor`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `id`: `string`; `name`: `string`; `sellValue`: `number`; \}; `kind`: `"GUIDANCE"`; `price`: `number`; \} \| \{ `kind`: `"SEAL"`; `price`: `number`; `seal`: \{ `effect`: \{ `kind`: `"PLUS_CHIPS"`; `value`: `number`; \} \| \{ `kind`: `"PLUS_MULT"`; `value`: `number`; \} \| \{ `kind`: `"WAIVE"`; \}; `eligible`: \{ `cardTypes?`: (... \| ... \| ... \| ...)[]; `populations?`: (... \| ... \| ... \| ... \| ...)[]; `topics?`: `string`[]; \}; `footnote`: `string`; `id`: `string`; `name`: `string`; `sellValue`: `number`; \}; \})[]

##### shop.packs

> **packs**: `object`[]

##### shop.sites

> **sites**: `object`[]

#### title

> **title**: `string`

***

### log

> **log**: [`RunLog`](RunLog.md)

***

### run

> **run**: [`RunState`](../../run/interfaces/RunState.md)
