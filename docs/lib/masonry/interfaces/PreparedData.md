[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/masonry](../README.md) / PreparedData

# Interface: PreparedData

## Properties

### blocks?

> `optional` **blocks?**: [`PreparedBlock`](../../pretext-block-parser/interfaces/PreparedBlock.md)[]

***

### items?

> `optional` **items?**: [`ExtendedRichInlineItem`](../../pretext-block-parser/interfaces/ExtendedRichInlineItem.md)[]

***

### paddingHeight

> **paddingHeight**: `number`

***

### paragraphs?

> `optional` **paragraphs?**: [`PreparedParagraph`](PreparedParagraph.md)[]

***

### prepared?

> `optional` **prepared?**: `PreparedRichInline`

Legacy flat shape (single paragraph, not wrapped in `paragraphs`).
Still produced by some callers/tests; normalized below.

***

### realityBlocks?

> `optional` **realityBlocks?**: [`PreparedBlock`](../../pretext-block-parser/interfaces/PreparedBlock.md)[]
