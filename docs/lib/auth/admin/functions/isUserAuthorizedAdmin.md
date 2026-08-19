[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/auth/admin](../README.md) / isUserAuthorizedAdmin

# Function: isUserAuthorizedAdmin()

> **isUserAuthorizedAdmin**(`userId?`, `emailAddresses?`): `boolean`

Defined in: lib/auth/admin.ts:22

Pure evaluation helper determining if a given Clerk User ID or list of emails
is present in the server's authorized admin allowlist.

## Parameters

### userId?

`string` \| `null`

### emailAddresses?

(`string` \| `null` \| `undefined`)[] \| `null`

## Returns

`boolean`
