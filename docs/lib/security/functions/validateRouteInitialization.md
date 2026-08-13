[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/security](../README.md) / validateRouteInitialization

# Function: validateRouteInitialization()

> **validateRouteInitialization**(): `void`

Defined in: [lib/security.ts:9](https://github.com/fderuiter/portfolio/blob/main/lib/security.ts#L9)

Validates that the required authorization secret is configured.
Designed to run during route initialization (fail-closed behavior).
If the validation secret is missing in staging or production (non-development) environments,
it immediately throws an error to prevent route initialization.

## Returns

`void`
