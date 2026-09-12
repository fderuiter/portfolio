[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/export-docx](../README.md) / generateStudyDocx

# Function: generateStudyDocx()

> **generateStudyDocx**(`study`, `options`): `Promise`\<`Blob`\>

Generates a complete Microsoft Word (.docx) document representing the CRF Study or a Single Form.

## Parameters

### study

[`StudyProtocol`](../../types/interfaces/StudyProtocol.md)

StudyProtocol definition

### options

[`ExportDocxOptions`](../../types/interfaces/ExportDocxOptions.md)

Export options (mode, scope, branding, etc.)

## Returns

`Promise`\<`Blob`\>

Promise resolving to binary Blob
