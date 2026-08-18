[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/case-studies-data](../README.md) / PROMPTOPS\_COMMANDS\_OBJ

# Variable: PROMPTOPS\_COMMANDS\_OBJ

> `const` **PROMPTOPS\_COMMANDS\_OBJ**: `object`

Defined in: [lib/case-studies-data.ts:119](https://github.com/fderuiter/portfolio/blob/main/lib/case-studies-data.ts#L119)

## Type Declaration

### promptops init --template clinical

> **promptops init --template clinical**: `object`

#### promptops init --template clinical.description

> **description**: `string` = `"Initialize a new PromptOps project with clinical workflow schemas and macros."`

#### promptops init --template clinical.payload

> **payload**: `object`

#### promptops init --template clinical.payload.project

> **project**: `string` = `"clinical-trial-audit"`

#### promptops init --template clinical.payload.schemaVersion

> **schemaVersion**: `string` = `"Draft-07"`

#### promptops init --template clinical.payload.status

> **status**: `string` = `"INITIALIZED"`

#### promptops init --template clinical.payload.templatesCreated

> **templatesCreated**: `string`[]

### promptops mcp serve

> **promptops mcp serve**: `object`

#### promptops mcp serve.description

> **description**: `string` = `"Start Model Context Protocol (MCP) server exposing PromptOps tools and prompt library."`

#### promptops mcp serve.payload

> **payload**: `object`

#### promptops mcp serve.payload.port

> **port**: `number` = `8080`

#### promptops mcp serve.payload.protocolVersion

> **protocolVersion**: `string` = `"2024-11-05"`

#### promptops mcp serve.payload.registeredTools

> **registeredTools**: `string`[]

#### promptops mcp serve.payload.serverStatus

> **serverStatus**: `string` = `"LISTENING"`

#### promptops run --workflow workflows/clinical/consensus.workflow.yaml

> **promptops run --workflow workflows/clinical/consensus.workflow.yaml**: `object`

#### promptops run --workflow workflows/clinical/consensus.workflow.yaml.description

> **description**: `string` = `"Execute multi-agent DAG workflow pipeline with topological sorting and tool resolution."`

#### promptops run --workflow workflows/clinical/consensus.workflow.yaml.payload

> **payload**: `object`

#### promptops run --workflow workflows/clinical/consensus.workflow.yaml.payload.auditHash

> **auditHash**: `string` = `"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"`

#### promptops run --workflow workflows/clinical/consensus.workflow.yaml.payload.mcpToolsCalled

> **mcpToolsCalled**: `string`[]

#### promptops run --workflow workflows/clinical/consensus.workflow.yaml.payload.steps

> **steps**: `string`[]

#### promptops run --workflow workflows/clinical/consensus.workflow.yaml.payload.topologicalOrder

> **topologicalOrder**: `string`[]

#### promptops run --workflow workflows/clinical/consensus.workflow.yaml.payload.workflowID

> **workflowID**: `string` = `"clinical-consensus-arbitration"`

### promptops validate --all

> **promptops validate --all**: `object`

#### promptops validate --all.description

> **description**: `string` = `"Run two-pass schema validation against Draft-07 JSON schemas and Jinja2 macros."`

#### promptops validate --all.payload

> **payload**: `object`

#### promptops validate --all.payload.macroLibraries

> **macroLibraries**: `string`[]

#### promptops validate --all.payload.passed

> **passed**: `boolean` = `true`

#### promptops validate --all.payload.schemasChecked

> **schemasChecked**: `number` = `8`

#### promptops validate --all.payload.twoPassValidation

> **twoPassValidation**: `string` = `"PASSED (Raw structural & Jinja2 rendered templates)"`

#### promptops validate --all.payload.typeErrors

> **typeErrors**: `number` = `0`
