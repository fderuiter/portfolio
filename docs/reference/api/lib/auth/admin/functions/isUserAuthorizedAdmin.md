[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/auth/admin](../README.md) / isUserAuthorizedAdmin

# Function: isUserAuthorizedAdmin()

> **isUserAuthorizedAdmin**(`userId?`, `emailAddresses?`): `boolean`

Pure evaluation helper determining if a given Clerk User ID or list of
email addresses is present in the server's authorized admin allowlist.

Email-based authorization policy: only an address with
`verification.status === "verified"` can satisfy the `ADMIN_EMAILS`
allowlist. An address with no verification record, a non-"verified"
status, or a matching string but unverified ownership is never sufficient
— Clerk lets an account hold unverified email addresses, and an attacker
who adds an allowlisted address to their own account without proving
ownership must not inherit that address's trust. This check applies
uniformly to every address Clerk returns for the user (primary and
secondary alike): restricting it to only the primary address would not
close the gap, since Clerk does not require the primary address to be
verified either.

## Parameters

### userId?

`string` \| `null`

### emailAddresses?

[`AdminEmailCandidate`](../interfaces/AdminEmailCandidate.md)[] \| `null`

## Returns

`boolean`
