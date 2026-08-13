[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/github](../README.md) / getGitHubStats

# Function: getGitHubStats()

> **getGitHubStats**(`owner`, `repo`): `Promise`\<[`GitHubStats`](../interfaces/GitHubStats.md) \| `null`\>

Defined in: [lib/github.ts:187](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/lib/github.ts#L187)

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
