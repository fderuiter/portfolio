[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/case-studies-data](../README.md) / IMEDNET\_COMMANDS\_OBJ

# Variable: IMEDNET\_COMMANDS\_OBJ

> `const` **IMEDNET\_COMMANDS\_OBJ**: `object`

Defined in: [lib/case-studies-data.ts:20](https://github.com/fderuiter/portfolio/blob/main/lib/case-studies-data.ts#L20)

## Type Declaration

### imednet records search --study BRIGHT-01

> **imednet records search --study BRIGHT-01**: `object`

#### imednet records search --study BRIGHT-01.description

> **description**: `string` = `"Search dynamic patient records and EDC form entries matching active trials."`

#### imednet records search --study BRIGHT-01.payload

> **payload**: `object`

#### imednet records search --study BRIGHT-01.payload.domain

> **domain**: `string` = `"VS (Vital Signs)"`

#### imednet records search --study BRIGHT-01.payload.results

> **results**: `object`[]

#### imednet records search --study BRIGHT-01.payload.studyID

> **studyID**: `string` = `"BRIGHT-01"`

#### imednet records search --study BRIGHT-01.payload.totalRecordsMatched

> **totalRecordsMatched**: `number` = `3`

### imednet studies list

> **imednet studies list**: `object`

#### imednet studies list.description

> **description**: `string` = `"Retrieve a list of all active clinical trials from the iMednet EDC platform."`

#### imednet studies list.payload

> **payload**: `object`[]

### imednet subjects get --id 123

> **imednet subjects get --id 123**: `object`

#### imednet subjects get --id 123.description

> **description**: `string` = `"Query specific details and records for subject 123 (HIPAA-anonymized)."`

#### imednet subjects get --id 123.payload

> **payload**: `object`

#### imednet subjects get --id 123.payload.complianceScore

> **complianceScore**: `string` = `"[VERIFY_SECURITY_LOGS]"`

#### imednet subjects get --id 123.payload.demographics

> **demographics**: `object`

#### imednet subjects get --id 123.payload.demographics.age

> **age**: `number` = `11`

#### imednet subjects get --id 123.payload.demographics.ethnicity

> **ethnicity**: `string` = `"ANONYMIZED_UNDER_HIPAA_SAFE_HARBOR"`

#### imednet subjects get --id 123.payload.demographics.gender

> **gender**: `string` = `"F"`

#### imednet subjects get --id 123.payload.enrollmentDate

> **enrollmentDate**: `string` = `"2025-11-12"`

#### imednet subjects get --id 123.payload.lastVisit

> **lastVisit**: `string` = `"2026-05-10T14:30Z"`

#### imednet subjects get --id 123.payload.recordsCount

> **recordsCount**: `number` = `18`

#### imednet subjects get --id 123.payload.siteID

> **siteID**: `number` = `401`

#### imednet subjects get --id 123.payload.status

> **status**: `string` = `"COMPLETED"`

#### imednet subjects get --id 123.payload.studyID

> **studyID**: `string` = `"BRIGHT-01"`

#### imednet subjects get --id 123.payload.subjectID

> **subjectID**: `string` = `"SUB-123"`
