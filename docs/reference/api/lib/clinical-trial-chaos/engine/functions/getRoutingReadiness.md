[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/engine](../README.md) / getRoutingReadiness

# Function: getRoutingReadiness()

> **getRoutingReadiness**(`subject`, `stations`): `object`

Describes which active stations match a dossier before routing is allowed.
Matching domains remain visible while observations are unresolved so the
player can understand the destination without submitting prematurely.

## Parameters

### subject

[`ClinicalSubject`](../../types/interfaces/ClinicalSubject.md) \| `null`

### stations

readonly `Pick`\<[`StationConfig`](../../types/interfaces/StationConfig.md), `"id"`\>[]

## Returns

`object`

### matchingDomains

> **matchingDomains**: [`CDISCDomain`](../../types/type-aliases/CDISCDomain.md)[]

### unresolvedCount

> **unresolvedCount**: `number`
