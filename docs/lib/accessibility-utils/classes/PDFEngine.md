[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/accessibility-utils](../README.md) / PDFEngine

# Class: PDFEngine

Defined in: [lib/accessibility-utils.ts:106](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L106)

Requirement 2: PDF generation engine that produces PDF/UA compliant files 
with automated tagging for structure and semantics.

## Constructors

### Constructor

> **new PDFEngine**(): `PDFEngine`

#### Returns

`PDFEngine`

## Methods

### generate1099()

> `static` **generate1099**(`_taxData`): `Buffer`

Defined in: [lib/accessibility-utils.ts:111](https://github.com/fderuiter/portfolio/blob/main/lib/accessibility-utils.ts#L111)

Generates a 1099 PDF payload that successfully passes the PAC 
(PDF Accessibility Checker) tool with zero errors.

#### Parameters

##### \_taxData

`Record`\<`string`, `unknown`\>

#### Returns

`Buffer`
