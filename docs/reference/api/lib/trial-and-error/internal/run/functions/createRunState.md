[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/run](../README.md) / createRunState

# Function: createRunState()

> **createRunState**(`act`, `seed?`): [`RunState`](../interfaces/RunState.md)

A fresh run for `seed`: the Boss drawn from the act's pool (a pool of one
is fixed and consumes no draw), and the first Blind dealt with full CPU.
The first Blind draws no crisis.

## Parameters

### act

#### blinds

`object`[] = `...`

#### bossPool?

`object`[] = `...`

#### crisisDeck?

`object`[] = `...`

#### id

`string` = `identifier`

#### shop?

\{ `entries`: (\{ `kind`: `"RELIC"`; `price`: `number`; `relic`: \{ `description`: `string`; `id`: `string`; `modifier`: \{ `chips`: `number`; `label`: `string`; `plusMult`: `number`; `sourceId`: `string`; `xMult`: `number`; \}; `name`: `string`; \}; \} \| \{ `guidance`: \{ `document`: `string`; `flavor`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `id`: `string`; `name`: `string`; `sellValue`: `number`; \}; `kind`: `"GUIDANCE"`; `price`: `number`; \} \| \{ `kind`: `"SEAL"`; `price`: `number`; `seal`: \{ `effect`: \{ `kind`: `"PLUS_CHIPS"`; `value`: `number`; \} \| \{ `kind`: `"PLUS_MULT"`; `value`: `number`; \} \| \{ `kind`: `"WAIVE"`; \}; `eligible`: \{ `cardTypes?`: (... \| ... \| ... \| ...)[]; `populations?`: (... \| ... \| ... \| ... \| ...)[]; `topics?`: `string`[]; \}; `footnote`: `string`; `id`: `string`; `name`: `string`; `sellValue`: `number`; \}; \})[]; `packs`: `object`[]; `sites`: `object`[]; \} = `...`

The Procurement Shop between Blinds. Without it there is no shop.

#### shop.entries

(\{ `kind`: `"RELIC"`; `price`: `number`; `relic`: \{ `description`: `string`; `id`: `string`; `modifier`: \{ `chips`: `number`; `label`: `string`; `plusMult`: `number`; `sourceId`: `string`; `xMult`: `number`; \}; `name`: `string`; \}; \} \| \{ `guidance`: \{ `document`: `string`; `flavor`: `string`; `handType`: `"HIGH_TABLE"` \| `"TLF_PAIR"` \| `"TLF_TWO_PAIR"` \| `"POPULATION_FLUSH"` \| `"CSR_STRAIGHT"` \| `"EFFICACY_FULL_HOUSE"` \| `"MEDDRA_FIVE_OF_A_KIND"`; `id`: `string`; `name`: `string`; `sellValue`: `number`; \}; `kind`: `"GUIDANCE"`; `price`: `number`; \} \| \{ `kind`: `"SEAL"`; `price`: `number`; `seal`: \{ `effect`: \{ `kind`: `"PLUS_CHIPS"`; `value`: `number`; \} \| \{ `kind`: `"PLUS_MULT"`; `value`: `number`; \} \| \{ `kind`: `"WAIVE"`; \}; `eligible`: \{ `cardTypes?`: (... \| ... \| ... \| ...)[]; `populations?`: (... \| ... \| ... \| ... \| ...)[]; `topics?`: `string`[]; \}; `footnote`: `string`; `id`: `string`; `name`: `string`; `sellValue`: `number`; \}; \})[] = `...`

#### shop.packs

`object`[] = `...`

#### shop.sites

`object`[] = `...`

#### title

`string` = `...`

### seed?

`string` = `DEFAULT_SEED`

## Returns

[`RunState`](../interfaces/RunState.md)
