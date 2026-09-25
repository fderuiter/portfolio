[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/run](../README.md) / deriveRunView

# Function: deriveRunView()

> **deriveRunView**(`act`, `run`): [`RunView`](../interfaces/RunView.md)

Derives everything a run renders. Pure; safe to call on every render.

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

### run

[`RunState`](../interfaces/RunState.md)

## Returns

[`RunView`](../interfaces/RunView.md)
