[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/github](../README.md) / parseGitHubUrl

# Function: parseGitHubUrl()

> **parseGitHubUrl**(`url`): \{ `owner`: `string`; `repo`: `string`; \} \| `null`

Defined in: [lib/github.ts:57](https://github.com/fderuiter/portfolio/blob/main/lib/github.ts#L57)

Robust helper to parse owner and repository name from arbitrary GitHub URLs.
Sanitizes trailing .git extensions and correctly extracts segments.
Supports format: https://github.com/owner/repo (or with trailing slashes/subpaths)

## Parameters

### url

`string`

## Returns

\{ `owner`: `string`; `repo`: `string`; \} \| `null`
