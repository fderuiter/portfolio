[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/github](../README.md) / getGitHubStats

# Function: getGitHubStats()

> **getGitHubStats**(`owner`, `repo`): `Promise`\<[`GitHubStats`](../interfaces/GitHubStats.md) \| `null`\>

Defined in: [lib/github.ts:202](https://github.com/fderuiter/portfolio/blob/main/lib/github.ts#L202)

Public facing API client wrapper.
Integrates Next.js unstable_cache and seamlessly falls back to direct API fetching
when executed outside the Next.js app context (like CLI scripts, build environments, tests).

## Parameters

### owner

`string`

### repo

`string`

## Returns

`Promise`\<[`GitHubStats`](../interfaces/GitHubStats.md) \| `null`\>
