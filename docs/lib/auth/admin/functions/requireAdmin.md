[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/auth/admin](../README.md) / requireAdmin

# Function: requireAdmin()

> **requireAdmin**(): `Promise`\<\{ `userId`: `string`; \}\>

Defined in: lib/auth/admin.ts:72

Enforces admin authorization on Server Components or Server Actions.
Redirects to /admin/login if unauthenticated, or throws an authorization error if unauthorized.

## Returns

`Promise`\<\{ `userId`: `string`; \}\>
