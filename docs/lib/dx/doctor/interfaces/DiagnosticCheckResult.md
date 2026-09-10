[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/doctor](../README.md) / DiagnosticCheckResult

# Interface: DiagnosticCheckResult

Defined in: [lib/dx/doctor.ts:18](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L18)

## Properties

### category

> **category**: `"architecture"` \| `"routes"` \| `"security"` \| `"database"` \| `"docs"` \| `"hydration"` \| `"accessibility"` \| `"quality"`

Defined in: [lib/dx/doctor.ts:21](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L21)

***

### details?

> `optional` **details?**: `string`[]

Defined in: [lib/dx/doctor.ts:32](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L32)

***

### fixable?

> `optional` **fixable?**: `boolean`

Defined in: [lib/dx/doctor.ts:33](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L33)

***

### fixedMessage?

> `optional` **fixedMessage?**: `string`

Defined in: [lib/dx/doctor.ts:34](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L34)

***

### id

> **id**: `string`

Defined in: [lib/dx/doctor.ts:19](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L19)

***

### message

> **message**: `string`

Defined in: [lib/dx/doctor.ts:31](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L31)

***

### name

> **name**: `string`

Defined in: [lib/dx/doctor.ts:20](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L20)

***

### remediation?

> `optional` **remediation?**: [`RemediationAction`](../../cli-parser/interfaces/RemediationAction.md)

Defined in: [lib/dx/doctor.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L35)

***

### status

> **status**: `"warn"` \| `"fail"` \| `"pass"` \| `"fixed"`

Defined in: [lib/dx/doctor.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/dx/doctor.ts#L30)
