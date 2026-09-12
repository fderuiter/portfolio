[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/security](../README.md) / validateRouteInitialization

# Function: validateRouteInitialization()

> **validateRouteInitialization**(): `void`

Validates that the required authorization secret is configured.
Designed to run during route initialization (fail-closed behavior).
If the validation secret is missing in staging or production (non-development) environments,
it immediately throws an error to prevent route initialization.

## Returns

`void`
