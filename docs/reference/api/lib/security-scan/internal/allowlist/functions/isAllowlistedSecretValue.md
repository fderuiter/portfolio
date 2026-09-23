[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/security-scan/internal/allowlist](../README.md) / isAllowlistedSecretValue

# Function: isAllowlistedSecretValue()

> **isAllowlistedSecretValue**(`value`, `file?`): `boolean`

Whether a detected candidate value is a known-safe fixture/example rather
than a real secret, given the (repo-relative, forward-slash) file it was
found in.

## Parameters

### value

`string`

### file?

`string` = `""`

## Returns

`boolean`
