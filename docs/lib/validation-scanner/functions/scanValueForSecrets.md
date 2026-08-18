[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/validation-scanner](../README.md) / scanValueForSecrets

# Function: scanValueForSecrets()

> **scanValueForSecrets**(`value`, `pathPrefix?`): [`SecretMatch`](../interfaces/SecretMatch.md)[]

Defined in: [lib/validation-scanner.ts:54](https://github.com/fderuiter/portfolio/blob/main/lib/validation-scanner.ts#L54)

Recursively scans a value (string, array, or object) for sensitive credential patterns.
Returns an array of detected matches with category and field path.

## Parameters

### value

`unknown`

### pathPrefix?

(`string` \| `number`)[] = `[]`

## Returns

[`SecretMatch`](../interfaces/SecretMatch.md)[]
