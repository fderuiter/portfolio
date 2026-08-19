[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-pdf](../README.md) / generateFormPdf

# Function: generateFormPdf()

> **generateFormPdf**(`form`, `study`, `options?`): `Promise`\<`Blob`\>

Defined in: [lib/crf/export-pdf.ts:401](https://github.com/fderuiter/portfolio/blob/main/lib/crf/export-pdf.ts#L401)

Convenience helper to export a single form to PDF.

## Parameters

### form

[`CRFForm`](../../types/interfaces/CRFForm.md)

### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

### options?

`Partial`\<[`ExportPdfOptions`](../../types/interfaces/ExportPdfOptions.md)\> = `{}`

## Returns

`Promise`\<`Blob`\>
