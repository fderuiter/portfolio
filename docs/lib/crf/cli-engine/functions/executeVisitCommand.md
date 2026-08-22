[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/cli-engine](../README.md) / executeVisitCommand

# Function: executeVisitCommand()

> **executeVisitCommand**(`study`, `action`, `args`, `options?`): [`CliCommandResult`](../interfaces/CliCommandResult.md)

Defined in: [lib/crf/cli-engine.ts:376](https://github.com/fderuiter/portfolio/blob/main/lib/crf/cli-engine.ts#L376)

Add / Remove / Assign Visits

## Parameters

### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

### action

`"add"` \| `"rm"` \| `"assign"`

### args

`string`[]

### options?

[`CliExecutionOptions`](../interfaces/CliExecutionOptions.md) = `{}`

## Returns

[`CliCommandResult`](../interfaces/CliCommandResult.md)
