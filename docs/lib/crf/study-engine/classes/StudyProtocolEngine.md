[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-engine](../README.md) / StudyProtocolEngine

# Class: StudyProtocolEngine

Defined in: [lib/crf/study-engine.ts:175](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L175)

Pure Functional Protocol Engine

## Constructors

### Constructor

> **new StudyProtocolEngine**(): `StudyProtocolEngine`

#### Returns

`StudyProtocolEngine`

## Methods

### addArm()

> `static` **addArm**(`study`, `arm`): `object`

Defined in: [lib/crf/study-engine.ts:631](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L631)

Add Study Arm to Protocol Graph

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### arm

[`StudyArm`](../../types/interfaces/StudyArm.md)

#### Returns

`object`

##### arm

> **arm**: [`StudyArm`](../../types/interfaces/StudyArm.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### addBiomedicalConcept()

> `static` **addBiomedicalConcept**(`study`, `concept`): `object`

Defined in: [lib/crf/study-engine.ts:718](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L718)

Add Biomedical Concept to Protocol Graph

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### concept

[`BiomedicalConcept`](../../types/interfaces/BiomedicalConcept.md)

#### Returns

`object`

##### concept

> **concept**: [`BiomedicalConcept`](../../types/interfaces/BiomedicalConcept.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### addCohort()

> `static` **addCohort**(`study`, `cohort`): `object`

Defined in: [lib/crf/study-engine.ts:690](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L690)

Add Study Cohort to Protocol Graph

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### cohort

[`StudyCohort`](../../types/interfaces/StudyCohort.md)

#### Returns

`object`

##### cohort

> **cohort**: [`StudyCohort`](../../types/interfaces/StudyCohort.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### addEpoch()

> `static` **addEpoch**(`study`, `epoch`): `object`

Defined in: [lib/crf/study-engine.ts:659](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L659)

Add Study Epoch to Protocol Graph

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### epoch

[`StudyEpoch`](../../types/interfaces/StudyEpoch.md)

#### Returns

`object`

##### epoch

> **epoch**: [`StudyEpoch`](../../types/interfaces/StudyEpoch.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### addField()

> `static` **addField**(`study`, `domainOrFormId`, `fieldData`, `sectionIndex?`): `object`

Defined in: [lib/crf/study-engine.ts:333](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L333)

Add Clinical Field to Form

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### domainOrFormId

`string`

##### fieldData

`Partial`\<[`CRFField`](../../types/interfaces/CRFField.md)\> & `object`

##### sectionIndex?

`number` = `0`

#### Returns

`object`

##### error?

> `optional` **error?**: `string`

##### field?

> `optional` **field?**: [`CRFField`](../../types/interfaces/CRFField.md)

##### form?

> `optional` **form?**: [`CRFForm`](../../types/interfaces/CRFForm.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### addForm()

> `static` **addForm**(`study`, `domain`, `customName?`): `object`

Defined in: [lib/crf/study-engine.ts:256](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L256)

Add / Scaffold CDASH Domain Form

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### domain

`string`

##### customName?

`string`

#### Returns

`object`

##### form

> **form**: [`CRFForm`](../../types/interfaces/CRFForm.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### addRule()

> `static` **addRule**(`study`, `domainOrFormId`, `ruleData`): `object`

Defined in: [lib/crf/study-engine.ts:780](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L780)

Add Dynamic AST Edit Check / Calculation Rule to Form

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### domainOrFormId

`string`

##### ruleData

###### actionType

`"show_field"` \| `"hide_field"` \| `"require_field"` \| `"raise_query"` \| `"set_value"`

###### formulaExpression?

`string`

###### name

`string`

###### queryMessage?

`string`

###### querySeverity?

`"error"` \| `"warning"` \| `"info"`

###### targetFieldIdOrVar

`string`

###### triggerFieldIdsOrVars?

`string`[]

#### Returns

`object`

##### error?

> `optional` **error?**: `string`

##### form?

> `optional` **form?**: [`CRFForm`](../../types/interfaces/CRFForm.md)

##### rule?

> `optional` **rule?**: [`EditCheckRule`](../../types/interfaces/EditCheckRule.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### addVisit()

> `static` **addVisit**(`study`, `visitData`): `object`

Defined in: [lib/crf/study-engine.ts:489](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L489)

Add Longitudinal Study Visit to SoA Matrix

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### visitData

`Partial`\<[`StudyVisit`](../../types/interfaces/StudyVisit.md)\> & `object`

#### Returns

`object`

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### visit

> **visit**: [`StudyVisit`](../../types/interfaces/StudyVisit.md)

***

### assignArmVisitForms()

> `static` **assignArmVisitForms**(`study`, `visitIdOrName`, `armId`, `formIdsOrDomains`): `object`

Defined in: [lib/crf/study-engine.ts:586](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L586)

Assign Forms to a Study Visit specifically for a designated Study Arm

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### visitIdOrName

`string`

##### armId

`string`

##### formIdsOrDomains

`string`[]

#### Returns

`object`

##### error?

> `optional` **error?**: `string`

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### visit?

> `optional` **visit?**: [`StudyVisit`](../../types/interfaces/StudyVisit.md)

***

### assignVisitForms()

> `static` **assignVisitForms**(`study`, `visitIdOrName`, `formIdsOrDomains`): `object`

Defined in: [lib/crf/study-engine.ts:549](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L549)

Assign Forms to a Study Visit (Additive)

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### visitIdOrName

`string`

##### formIdsOrDomains

`string`[]

#### Returns

`object`

##### error?

> `optional` **error?**: `string`

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### visit?

> `optional` **visit?**: [`StudyVisit`](../../types/interfaces/StudyVisit.md)

***

### createInitialStudy()

> `static` **createInitialStudy**(`profile?`): [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

Defined in: [lib/crf/study-engine.ts:179](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L179)

Create Initial Blank Study Protocol

#### Parameters

##### profile?

`Partial`\<[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)\>

#### Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### diffProtocols()

> `static` **diffProtocols**(`studyA`, `studyB`): [`ProtocolDiffSummary`](../../universal-schema/interfaces/ProtocolDiffSummary.md)

Defined in: [lib/crf/study-engine.ts:952](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L952)

Semantic Diff between Two Protocols

#### Parameters

##### studyA

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### studyB

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

#### Returns

[`ProtocolDiffSummary`](../../universal-schema/interfaces/ProtocolDiffSummary.md)

***

### exportProtocol()

> `static` **exportProtocol**(`study`, `format`): `object`

Defined in: [lib/crf/study-engine.ts:959](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L959)

Multi-Format Regulatory Export Compilation

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### format

`"json"` \| `"yaml"` \| `"odm"` \| `"fhir"` \| `"sas"` \| `"r"` \| `"usdm"`

#### Returns

`object`

##### error?

> `optional` **error?**: `string`

##### format

> **format**: `string`

##### output

> **output**: `string`

##### sizeBytes

> **sizeBytes**: `number`

##### success

> **success**: `boolean`

***

### getArmAwareVisitMatrix()

> `static` **getArmAwareVisitMatrix**(`study`): `object`[] \| `object`[]

Defined in: [lib/crf/study-engine.ts:734](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L734)

Constructs an arm-aware visit matrix reflecting form assignments across study arms and epochs

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

#### Returns

`object`[] \| `object`[]

***

### getField()

> `static` **getField**(`study`, `domainOrFormId`, `fieldIdOrVar`): \{ `field`: [`CRFField`](../../types/interfaces/CRFField.md); `fieldIndex`: `number`; `form`: [`CRFForm`](../../types/interfaces/CRFForm.md); `sectionIndex`: `number`; \} \| `undefined`

Defined in: [lib/crf/study-engine.ts:232](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L232)

Find Field within Study or Specific Form

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### domainOrFormId

`string`

##### fieldIdOrVar

`string`

#### Returns

\{ `field`: [`CRFField`](../../types/interfaces/CRFField.md); `fieldIndex`: `number`; `form`: [`CRFForm`](../../types/interfaces/CRFForm.md); `sectionIndex`: `number`; \} \| `undefined`

***

### getForm()

> `static` **getForm**(`study`, `formIdOrDomain`): [`CRFForm`](../../types/interfaces/CRFForm.md) \| `undefined`

Defined in: [lib/crf/study-engine.ts:221](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L221)

Find Form by ID or Domain (Case-Insensitive)

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### formIdOrDomain

`string`

#### Returns

[`CRFForm`](../../types/interfaces/CRFForm.md) \| `undefined`

***

### listDomains()

> `static` **listDomains**(): [`DomainMetadata`](../interfaces/DomainMetadata.md)[]

Defined in: [lib/crf/study-engine.ts:871](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L871)

List Supported CDASH Domains

#### Returns

[`DomainMetadata`](../interfaces/DomainMetadata.md)[]

***

### listPresets()

> `static` **listPresets**(): `object`[]

Defined in: [lib/crf/study-engine.ts:840](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L840)

List Available Presets

#### Returns

`object`[]

***

### loadPreset()

> `static` **loadPreset**(`presetId`): `object`

Defined in: [lib/crf/study-engine.ts:855](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L855)

Load Preset by ID

#### Parameters

##### presetId

`string`

#### Returns

`object`

##### presetInfo

> **presetInfo**: `object`

###### presetInfo.id

> **id**: `string`

###### presetInfo.name

> **name**: `string`

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### removeArm()

> `static` **removeArm**(`study`, `armId`): `object`

Defined in: [lib/crf/study-engine.ts:644](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L644)

Remove Study Arm from Protocol Graph

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### armId

`string`

#### Returns

`object`

##### removedArm?

> `optional` **removedArm?**: [`StudyArm`](../../types/interfaces/StudyArm.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### removeCohort()

> `static` **removeCohort**(`study`, `cohortId`): `object`

Defined in: [lib/crf/study-engine.ts:703](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L703)

Remove Study Cohort from Protocol Graph

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### cohortId

`string`

#### Returns

`object`

##### removedCohort?

> `optional` **removedCohort?**: [`StudyCohort`](../../types/interfaces/StudyCohort.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### removeEpoch()

> `static` **removeEpoch**(`study`, `epochId`): `object`

Defined in: [lib/crf/study-engine.ts:675](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L675)

Remove Study Epoch from Protocol Graph

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### epochId

`string`

#### Returns

`object`

##### removedEpoch?

> `optional` **removedEpoch?**: [`StudyEpoch`](../../types/interfaces/StudyEpoch.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### removeField()

> `static` **removeField**(`study`, `domainOrFormId`, `fieldIdOrVar`): `object`

Defined in: [lib/crf/study-engine.ts:449](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L449)

Remove Field from Form & Prune AST Rules

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### domainOrFormId

`string`

##### fieldIdOrVar

`string`

#### Returns

`object`

##### error?

> `optional` **error?**: `string`

##### form?

> `optional` **form?**: [`CRFForm`](../../types/interfaces/CRFForm.md)

##### removedField?

> `optional` **removedField?**: [`CRFField`](../../types/interfaces/CRFField.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### removeForm()

> `static` **removeForm**(`study`, `formIdOrDomain`): `object`

Defined in: [lib/crf/study-engine.ts:303](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L303)

Remove Form & Automatically Prune Schedule of Activities (SoA) References

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### formIdOrDomain

`string`

#### Returns

`object`

##### removedForm?

> `optional` **removedForm?**: [`CRFForm`](../../types/interfaces/CRFForm.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### removeVisit()

> `static` **removeVisit**(`study`, `visitIdOrName`): `object`

Defined in: [lib/crf/study-engine.ts:524](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L524)

Remove Study Visit from SoA Matrix

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### visitIdOrName

`string`

#### Returns

`object`

##### removedVisit?

> `optional` **removedVisit?**: [`StudyVisit`](../../types/interfaces/StudyVisit.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### updateField()

> `static` **updateField**(`study`, `domainOrFormId`, `fieldIdOrVar`, `updates`): `object`

Defined in: [lib/crf/study-engine.ts:407](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L407)

Update Existing Clinical Field in Form

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### domainOrFormId

`string`

##### fieldIdOrVar

`string`

##### updates

`Partial`\<[`CRFField`](../../types/interfaces/CRFField.md)\>

#### Returns

`object`

##### error?

> `optional` **error?**: `string`

##### field?

> `optional` **field?**: [`CRFField`](../../types/interfaces/CRFField.md)

##### form?

> `optional` **form?**: [`CRFForm`](../../types/interfaces/CRFForm.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### validateProtocol()

> `static` **validateProtocol**(`study`): [`ProtocolValidationResult`](../interfaces/ProtocolValidationResult.md)

Defined in: [lib/crf/study-engine.ts:878](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L878)

4-Tier Regulatory & Logic Conformance Validation

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

#### Returns

[`ProtocolValidationResult`](../interfaces/ProtocolValidationResult.md)
