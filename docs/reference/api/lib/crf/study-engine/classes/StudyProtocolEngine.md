[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/study-engine](../README.md) / StudyProtocolEngine

# Class: StudyProtocolEngine

Pure Functional Protocol Engine

## Constructors

### Constructor

> **new StudyProtocolEngine**(): `StudyProtocolEngine`

#### Returns

`StudyProtocolEngine`

## Methods

### addArm()

> `static` **addArm**(`study`, `arm`): `object`

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

> `static` **addField**(`study`, `domainOrFormId`, `fieldData`, `sectionIndexOrOptions?`): `object`

Add Clinical Field to Form (Appends or Inserts at Target Index)

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### domainOrFormId

`string`

##### fieldData

`Partial`\<[`CRFField`](../../types/interfaces/CRFField.md)\> & `object`

##### sectionIndexOrOptions?

`number` \| \{ `sectionId?`: `string`; `sectionIndex?`: `number`; `targetIndex?`: `number`; \}

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

Create Initial Blank Study Protocol

#### Parameters

##### profile?

`Partial`\<[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)\>

#### Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### diffProtocols()

> `static` **diffProtocols**(`studyA`, `studyB`): [`ProtocolDiffSummary`](../../universal-schema/interfaces/ProtocolDiffSummary.md)

Semantic Diff between Two Protocols

#### Parameters

##### studyA

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### studyB

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

#### Returns

[`ProtocolDiffSummary`](../../universal-schema/interfaces/ProtocolDiffSummary.md)

***

### duplicateField()

> `static` **duplicateField**(`study`, `domainOrFormId`, `fieldIdOrVar`, `targetSectionId?`): `object`

Duplicate Clinical Field with Unique Identity and Nonconflicting CDASH Variable Name

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### domainOrFormId

`string`

##### fieldIdOrVar

`string`

##### targetSectionId?

`string`

#### Returns

`object`

##### duplicatedField?

> `optional` **duplicatedField?**: [`CRFField`](../../types/interfaces/CRFField.md)

##### error?

> `optional` **error?**: `string`

##### form?

> `optional` **form?**: [`CRFForm`](../../types/interfaces/CRFForm.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### duplicateForm()

> `static` **duplicateForm**(`study`, `formIdOrDomain`, `options?`): `object`

Duplicate Form with Fresh Identities, Deep Cloning, and Internal Rule Remapping

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### formIdOrDomain

`string`

##### options?

###### customName?

`string`

###### newDomain?

`string`

###### renameVariables?

`boolean`

#### Returns

`object`

##### duplicatedForm?

> `optional` **duplicatedForm?**: [`CRFForm`](../../types/interfaces/CRFForm.md)

##### error?

> `optional` **error?**: `string`

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### exportProtocol()

> `static` **exportProtocol**(`study`, `format`): `object`

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

Constructs an arm-aware visit matrix reflecting form assignments across study arms and epochs

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

#### Returns

`object`[] \| `object`[]

***

### getField()

> `static` **getField**(`study`, `domainOrFormId`, `fieldIdOrVar`): \{ `field`: [`CRFField`](../../types/interfaces/CRFField.md); `fieldIndex`: `number`; `form`: [`CRFForm`](../../types/interfaces/CRFForm.md); `sectionIndex`: `number`; \} \| `undefined`

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

Find Form by ID or Domain (Case-Insensitive)

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### formIdOrDomain

`string`

#### Returns

[`CRFForm`](../../types/interfaces/CRFForm.md) \| `undefined`

***

### insertField()

> `static` **insertField**(`study`, `domainOrFormId`, `fieldData`, `options?`): `object`

Insert Clinical Field into Specified Section and Position

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### domainOrFormId

`string`

##### fieldData

`Partial`\<[`CRFField`](../../types/interfaces/CRFField.md)\> & `object`

##### options?

###### sectionId?

`string`

###### sectionIndex?

`number`

###### targetIndex?

`number`

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

### listDomains()

> `static` **listDomains**(): [`DomainMetadata`](../interfaces/DomainMetadata.md)[]

List Supported CDASH Domains

#### Returns

[`DomainMetadata`](../interfaces/DomainMetadata.md)[]

***

### listPresets()

> `static` **listPresets**(): `object`[]

List Available Presets

#### Returns

`object`[]

***

### loadPreset()

> `static` **loadPreset**(`presetId`): `object`

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

### previewFormRemoval()

> `static` **previewFormRemoval**(`study`, `formIdOrDomain`): `object`

Preview Form Removal Impact on Visit & Arm Schedule

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### formIdOrDomain

`string`

#### Returns

`object`

##### affectedArms

> **affectedArms**: [`StudyArm`](../../types/interfaces/StudyArm.md)[]

##### affectedVisits

> **affectedVisits**: [`StudyVisit`](../../types/interfaces/StudyVisit.md)[]

***

### removeArm()

> `static` **removeArm**(`study`, `armId`): `object`

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

Remove Form & Automatically Prune Visit and Arm Assignments

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### formIdOrDomain

`string`

#### Returns

`object`

##### affectedArms?

> `optional` **affectedArms?**: [`StudyArm`](../../types/interfaces/StudyArm.md)[]

##### affectedVisits?

> `optional` **affectedVisits?**: [`StudyVisit`](../../types/interfaces/StudyVisit.md)[]

##### removedForm?

> `optional` **removedForm?**: [`CRFForm`](../../types/interfaces/CRFForm.md)

##### study

> **study**: [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### undo?

> `optional` **undo?**: (`currentStudy`) => [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

###### Parameters

###### currentStudy

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

###### Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### removeVisit()

> `static` **removeVisit**(`study`, `visitIdOrName`): `object`

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

### restoreForm()

> `static` **restoreForm**(`study`, `form`, `originalAssignments?`, `originalIndex?`): [`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

Restore Form and its Associated Visit / Arm Assignments

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

##### form

[`CRFForm`](../../types/interfaces/CRFForm.md)

##### originalAssignments?

[`StudyVisit`](../../types/interfaces/StudyVisit.md)[] \| `object`[]

##### originalIndex?

`number`

#### Returns

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

***

### updateField()

> `static` **updateField**(`study`, `domainOrFormId`, `fieldIdOrVar`, `updates`): `object`

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

4-Tier Regulatory & Logic Conformance Validation

#### Parameters

##### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

#### Returns

[`ProtocolValidationResult`](../interfaces/ProtocolValidationResult.md)
