[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/auth/admin](../README.md) / getAdminAuthSession

# Function: getAdminAuthSession()

> **getAdminAuthSession**(): `Promise`\<[`AdminAuthSession`](../interfaces/AdminAuthSession.md)\>

Server-side helper to acquire the active session for admin pages.
Redirects unauthenticated visitors to `/admin/login`, and returns
structured authorization state without throwing runtime exceptions.

## Returns

`Promise`\<[`AdminAuthSession`](../interfaces/AdminAuthSession.md)\>
