[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / ComplianceViolation

# Interface: ComplianceViolation

## Properties

### autoFixAvailable

> **autoFixAvailable**: `boolean`

***

### autoFixType?

> `optional` **autoFixType?**: `"truncate_variable"` \| `"add_core_variable"` \| `"assign_nci_codelist"` \| `"fix_date_format"` \| `"assign_visit_form"`

***

### fieldId?

> `optional` **fieldId?**: `string`

***

### formId

> **formId**: `string`

***

### formName

> **formName**: `string`

***

### id

> **id**: `string`

***

### message

> **message**: `string`

***

### ruleDescription

> **ruleDescription**: `string`

***

### ruleId

> **ruleId**: `"SD0001"` \| `"SD0002"` \| `"SD0003"` \| `"SD0004"` \| `"SD0005"`

***

### severity

> **severity**: [`ComplianceSeverity`](../type-aliases/ComplianceSeverity.md)

***

### suggestedFix?

> `optional` **suggestedFix?**: `string`

***

### variableName?

> `optional` **variableName?**: `string`
