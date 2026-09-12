[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/github](../README.md) / GitHubStatsProvenance

# Type Alias: GitHubStatsProvenance

> **GitHubStatsProvenance** = `"live"` \| `"live-partial"` \| `"simulated"`

Where a [GitHubStats](../interfaces/GitHubStats.md) payload came from.

- `live` - every figure was read from the GitHub API.
- `live-partial` - the repository figures are live, but at least one
  secondary series (currently the commit timeline) was synthesized because
  its endpoint failed, was throttled, or returned nothing.
- `simulated` - no upstream data was usable; every figure is generated
  locally and is not a real measurement.
