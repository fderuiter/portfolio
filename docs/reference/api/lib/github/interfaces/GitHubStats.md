[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/github](../README.md) / GitHubStats

# Interface: GitHubStats

## Properties

### commitActivity

> **commitActivity**: `number`[]

***

### commitsCount?

> `optional` **commitsCount?**: `number`

***

### forks

> **forks**: `number`

***

### languages

> **languages**: [`GitHubLanguage`](GitHubLanguage.md)[]

***

### openIssues

> **openIssues**: `number`

***

### primaryLanguage?

> `optional` **primaryLanguage?**: `string`

***

### provenance

> **provenance**: [`GitHubStatsProvenance`](../type-aliases/GitHubStatsProvenance.md)

How much of this payload is a real measurement. Never assume `live`.

***

### recentCommits

> **recentCommits**: [`GitHubCommit`](GitHubCommit.md)[]

***

### stars

> **stars**: `number`

***

### updatedAt?

> `optional` **updatedAt?**: `string`

Upstream last-push timestamp, when the repository endpoint supplied one.
