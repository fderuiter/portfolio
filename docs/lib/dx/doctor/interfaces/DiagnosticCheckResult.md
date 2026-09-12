[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/doctor](../README.md) / DiagnosticCheckResult

# Interface: DiagnosticCheckResult

## Properties

### category

> **category**: `"architecture"` \| `"routes"` \| `"security"` \| `"database"` \| `"docs"` \| `"hydration"` \| `"accessibility"` \| `"quality"`

***

### details?

> `optional` **details?**: `string`[]

***

### fixable?

> `optional` **fixable?**: `boolean`

***

### fixedMessage?

> `optional` **fixedMessage?**: `string`

***

### id

> **id**: `string`

***

### message

> **message**: `string`

***

### name

> **name**: `string`

***

### remediation?

> `optional` **remediation?**: [`RemediationAction`](../../cli-parser/interfaces/RemediationAction.md)

***

### status

> **status**: `"warn"` \| `"fail"` \| `"pass"` \| `"fixed"`
