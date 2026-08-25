[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/site-governance/greenlight-engine](../README.md) / evaluateGreenlight

# Function: evaluateGreenlight()

> **evaluateGreenlight**(`siteData`, `studyId`, `overrides?`): [`GreenlightEvaluation`](../../types/interfaces/GreenlightEvaluation.md)

Defined in: [lib/site-governance/greenlight-engine.ts:29](https://github.com/fderuiter/portfolio/blob/main/lib/site-governance/greenlight-engine.ts#L29)

Evaluates the 6 operational readiness facets for clinical trial site qualification:
1. IRB: Ethics & IRB Approval
2. CTA: Clinical Trial Agreement
3. eISF: Electronic Investigator Site File
4. DOA: Delegation of Authority Log
5. Training: Site Staff Training & GCP
6. IP: Investigational Product Release

## Parameters

### siteData

[`SiteStartupData`](../../types/interfaces/SiteStartupData.md)

### studyId

`string`

### overrides?

#### sponsorOverrideActive?

`boolean`

#### waivedFacets?

[`GreenlightFacet`](../../types/type-aliases/GreenlightFacet.md)[]

## Returns

[`GreenlightEvaluation`](../../types/interfaces/GreenlightEvaluation.md)
