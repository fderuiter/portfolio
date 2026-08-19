[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/cli-engine](../README.md) / executeListCommand

# Function: executeListCommand()

> **executeListCommand**(`study`, `category`, `options?`): [`CliCommandResult`](../interfaces/CliCommandResult.md)

Defined in: [lib/crf/cli-engine.ts:515](https://github.com/fderuiter/portfolio/blob/main/lib/crf/cli-engine.ts#L515)

List Catalogs Command (domains, presets, forms, visits)

## Parameters

### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

### category

`"domains"` \| `"forms"` \| `"visits"` \| `"presets"`

### options?

[`CliExecutionOptions`](../interfaces/CliExecutionOptions.md) = `{}`

## Returns

[`CliCommandResult`](../interfaces/CliCommandResult.md)
