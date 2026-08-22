[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/doctor](../README.md) / DiagnosticCheckResult

# Interface: DiagnosticCheckResult

Defined in: [lib/dx/doctor.ts:13](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L13)

## Properties

### category

> **category**: `"architecture"` \| `"routes"` \| `"security"` \| `"database"` \| `"docs"` \| `"hydration"` \| `"accessibility"` \| `"quality"`

Defined in: [lib/dx/doctor.ts:16](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L16)

***

### details?

> `optional` **details?**: `string`[]

Defined in: [lib/dx/doctor.ts:27](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L27)

***

### fixable?

> `optional` **fixable?**: `boolean`

Defined in: [lib/dx/doctor.ts:28](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L28)

***

### fixedMessage?

> `optional` **fixedMessage?**: `string`

Defined in: [lib/dx/doctor.ts:29](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L29)

***

### id

> **id**: `string`

Defined in: [lib/dx/doctor.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L14)

***

### message

> **message**: `string`

Defined in: [lib/dx/doctor.ts:26](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L26)

***

### name

> **name**: `string`

Defined in: [lib/dx/doctor.ts:15](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L15)

***

### remediation?

> `optional` **remediation?**: [`RemediationAction`](../../cli-parser/interfaces/RemediationAction.md)

Defined in: [lib/dx/doctor.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L30)

***

### status

> **status**: `"warn"` \| `"fail"` \| `"pass"` \| `"fixed"`

Defined in: [lib/dx/doctor.ts:25](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L25)
