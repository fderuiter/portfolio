[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/auth/admin](../README.md) / getAdminAuthSession

# Function: getAdminAuthSession()

> **getAdminAuthSession**(): `Promise`\<[`AdminAuthSession`](../interfaces/AdminAuthSession.md)\>

Defined in: [lib/auth/admin.ts:85](https://github.com/fderuiter/portfolio/blob/main/lib/auth/admin.ts#L85)

Server-side helper to acquire the active session for admin pages.
Redirects unauthenticated visitors to `/admin/login`, and returns
structured authorization state without throwing runtime exceptions.

## Returns

`Promise`\<[`AdminAuthSession`](../interfaces/AdminAuthSession.md)\>
