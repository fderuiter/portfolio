[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/accessibility-utils](../README.md) / PDFEngine

# Class: PDFEngine

Defined in: [lib/accessibility-utils.ts:14](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L14)

Requirement 2: PDF generation engine that produces PDF/UA compliant files 
with automated tagging for structure and semantics.

## Constructors

### Constructor

> **new PDFEngine**(): `PDFEngine`

#### Returns

`PDFEngine`

## Methods

### generate1099()

> `static` **generate1099**(`taxData`): `Buffer`

Defined in: [lib/accessibility-utils.ts:19](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L19)

Generates a 1099 PDF payload that successfully passes the PAC 
(PDF Accessibility Checker) tool with zero errors.

#### Parameters

##### taxData

`Record`\<`string`, `unknown`\>

#### Returns

`Buffer`
