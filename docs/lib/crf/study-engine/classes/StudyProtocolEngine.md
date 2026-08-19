[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-engine](../README.md) / StudyProtocolEngine

# Class: StudyProtocolEngine

Defined in: [lib/crf/study-engine.ts:170](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L170)

Pure Functional Protocol Engine

## Constructors

### Constructor

> **new StudyProtocolEngine**(): `StudyProtocolEngine`

#### Returns

`StudyProtocolEngine`

## Methods

### addField()

> `static` **addField**(`study`, `domainOrFormId`, `fieldData`, `sectionIndex?`): `object`

Defined in: [lib/crf/study-engine.ts:328](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L328)

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

Defined in: [lib/crf/study-engine.ts:251](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L251)

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

Defined in: [lib/crf/study-engine.ts:581](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L581)

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

`"error"` \| `"info"` \| `"warning"`

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

Defined in: [lib/crf/study-engine.ts:484](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L484)

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

### assignVisitForms()

> `static` **assignVisitForms**(`study`, `visitIdOrName`, `formIdsOrDomains`): `object`

Defined in: [lib/crf/study-engine.ts:544](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L544)

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

Defined in: [lib/crf/study-engine.ts:174](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L174)

Create Initial Blank Study Protocol

#### Parameters

##### profile?

`Partial`\<[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)\>

#### Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### diffProtocols()

> `static` **diffProtocols**(`studyA`, `studyB`): [`ProtocolDiffSummary`](../../universal-schema/interfaces/ProtocolDiffSummary.md)

Defined in: [lib/crf/study-engine.ts:753](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L753)

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

Defined in: [lib/crf/study-engine.ts:760](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L760)

Multi-Format Regulatory Export Compilation

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### format

`"json"` \| `"r"` \| `"yaml"` \| `"odm"` \| `"fhir"` \| `"sas"`

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

### getField()

> `static` **getField**(`study`, `domainOrFormId`, `fieldIdOrVar`): \{ `field`: [`CRFField`](../../types/interfaces/CRFField.md); `fieldIndex`: `number`; `form`: [`CRFForm`](../../types/interfaces/CRFForm.md); `sectionIndex`: `number`; \} \| `undefined`

Defined in: [lib/crf/study-engine.ts:227](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L227)

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

Defined in: [lib/crf/study-engine.ts:216](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L216)

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

Defined in: [lib/crf/study-engine.ts:672](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L672)

List Supported CDASH Domains

#### Returns

[`DomainMetadata`](../interfaces/DomainMetadata.md)[]

***

### listPresets()

> `static` **listPresets**(): `object`[]

Defined in: [lib/crf/study-engine.ts:641](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L641)

List Available Presets

#### Returns

`object`[]

***

### loadPreset()

> `static` **loadPreset**(`presetId`): `object`

Defined in: [lib/crf/study-engine.ts:656](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L656)

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

### removeField()

> `static` **removeField**(`study`, `domainOrFormId`, `fieldIdOrVar`): `object`

Defined in: [lib/crf/study-engine.ts:444](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L444)

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

Defined in: [lib/crf/study-engine.ts:298](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L298)

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

Defined in: [lib/crf/study-engine.ts:519](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L519)

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

Defined in: [lib/crf/study-engine.ts:402](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L402)

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

Defined in: [lib/crf/study-engine.ts:679](https://github.com/fderuiter/portfolio/blob/main/lib/crf/study-engine.ts#L679)

4-Tier Regulatory & Logic Conformance Validation

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

#### Returns

[`ProtocolValidationResult`](../interfaces/ProtocolValidationResult.md)
