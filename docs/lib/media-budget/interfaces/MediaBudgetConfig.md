[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/media-budget](../README.md) / MediaBudgetConfig

# Interface: MediaBudgetConfig

Defined in: [lib/media-budget.ts:5](https://github.com/fderuiter/portfolio/blob/main/lib/media-budget.ts#L5)

## Properties

### maxAggregateBytes

> **maxAggregateBytes**: `number`

Defined in: [lib/media-budget.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/media-budget.ts#L9)

Maximum allowed aggregate size in bytes for all static media files combined. Default: 10MB (10,485,760 bytes)

***

### maxSingleFileBytes

> **maxSingleFileBytes**: `number`

Defined in: [lib/media-budget.ts:7](https://github.com/fderuiter/portfolio/blob/main/lib/media-budget.ts#L7)

Maximum allowed size in bytes for an individual static media file. Default: 3MB (3,145,728 bytes)

***

### mediaExtensions

> **mediaExtensions**: `string`[]

Defined in: [lib/media-budget.ts:11](https://github.com/fderuiter/portfolio/blob/main/lib/media-budget.ts#L11)

File extensions categorized as static media assets

***

### scanDirectories

> **scanDirectories**: `string`[]

Defined in: [lib/media-budget.ts:13](https://github.com/fderuiter/portfolio/blob/main/lib/media-budget.ts#L13)

Relative directory paths to scan for static media assets (default: ['public'])
