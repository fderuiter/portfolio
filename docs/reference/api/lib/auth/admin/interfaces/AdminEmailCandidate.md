[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/auth/admin](../README.md) / AdminEmailCandidate

# Interface: AdminEmailCandidate

Shape of a Clerk `EmailAddress` this module needs: structurally compatible
with `@clerk/backend`'s `EmailAddress` (and `@clerk/nextjs`'s re-export),
but expressed independently so tests can pass synthetic objects without
constructing real Clerk SDK instances.

## Properties

### emailAddress?

> `optional` **emailAddress?**: `string` \| `null`

***

### verification?

> `optional` **verification?**: \{ `status?`: `string` \| `null`; \} \| `null`
