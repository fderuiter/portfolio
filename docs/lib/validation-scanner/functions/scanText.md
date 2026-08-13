[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/validation-scanner](../README.md) / scanText

# Function: scanText()

> **scanText**(`text`): [`ScanMatch`](../interfaces/ScanMatch.md)[]

Defined in: [lib/validation-scanner.ts:42](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/lib/validation-scanner.ts#L42)

Scans a given string for sensitive credential patterns.

## Parameters

### text

`string`

The text to scan.

## Returns

[`ScanMatch`](../interfaces/ScanMatch.md)[]

An array of matching elements with line number and category.
