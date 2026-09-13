[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-pdf](../README.md) / generateStudyPdf

# Function: generateStudyPdf()

> **generateStudyPdf**(`study`, `options`): `Promise`\<`Blob`\>

Generates a high-fidelity PDF Document for a Study Protocol or single form.

## Parameters

### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

StudyProtocol definition

### options

[`ExportPdfOptions`](../../types/interfaces/ExportPdfOptions.md)

Export options (mode, scope, branding, etc.)

## Returns

`Promise`\<`Blob`\>

Promise resolving to binary Blob
