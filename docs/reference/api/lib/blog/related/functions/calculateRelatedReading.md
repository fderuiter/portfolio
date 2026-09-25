[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/blog/related](../README.md) / calculateRelatedReading

# Function: calculateRelatedReading()

> **calculateRelatedReading**(`current`, `options`): [`RelatedItem`](../interfaces/RelatedItem.md)[]

Calculates contextually matched related dispatches and case studies
based on shared content pillar and overlapping normalized technical tags.

Scoring model:
- Shared Pillar (dispatches): +10 points
- Domain Keyword Alignment (case studies): +6 points
- Exact / Normalized Tag Match: +4 points per matching tag

Returns deterministically sorted top N items.

## Parameters

### current

#### pillar

`"clinical-data-engineering"` \| `"formal-verification"` \| `"accessibility-engineering"` \| `"browser-graphics-engineering"` \| `"agent-first-dx"` \| `"field-notes"`

#### slug

`string`

#### tags

`string`[]

### options

[`CalculateRelatedOptions`](../interfaces/CalculateRelatedOptions.md)

## Returns

[`RelatedItem`](../interfaces/RelatedItem.md)[]
