[**temp_dir**](../../../README.md)

***

[temp_dir](../../../modules.md) / [lib/github](../README.md) / parseGitHubUrl

# Function: parseGitHubUrl()

> **parseGitHubUrl**(`url`): \{ `owner`: `string`; `repo`: `string`; \} \| `null`

Defined in: [lib/github.ts:43](https://github.com/fderuiter/portfolio/blob/e9125b13b4fd502f929719e363744f8eb92647bc/lib/github.ts#L43)

Robust helper to parse owner and repository name from arbitrary GitHub URLs.
Sanitizes trailing .git extensions and correctly extracts segments.
Supports format: https://github.com/owner/repo (or with trailing slashes/subpaths)

## Parameters

### url

`string`

## Returns

\{ `owner`: `string`; `repo`: `string`; \} \| `null`
