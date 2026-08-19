[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/github](../README.md) / getGitHubStats

# Function: getGitHubStats()

> **getGitHubStats**(`owner`, `repo`, `fallbackLanguage?`): `Promise`\<[`GitHubStats`](../interfaces/GitHubStats.md) \| `null`\>

Defined in: [lib/github.ts:209](https://github.com/fderuiter/portfolio/blob/main/lib/github.ts#L209)

Public facing API client wrapper.
Integrates Next.js unstable_cache and seamlessly falls back to direct API fetching
or deterministic simulated stats when executed outside the Next.js app context or
when rate limits/404s are encountered.

## Parameters

### owner

`string`

### repo

`string`

### fallbackLanguage?

`string`

## Returns

`Promise`\<[`GitHubStats`](../interfaces/GitHubStats.md) \| `null`\>
