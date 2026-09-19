[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/build-integrity](../README.md) / failBuildOnDataSourceError

# Function: failBuildOnDataSourceError()

> **failBuildOnDataSourceError**(`source`, `cause`): `void`

Converts a caught data-source failure into a build failure, but only while a
production build is generating pages.

The content services fall back to static data whenever a query fails, which is
correct when serving traffic: Neon suspends its compute after five minutes of
inactivity (AGENTS.md section 22) and a visitor should still get a page. During
static generation the same behaviour is a hazard, because the fallback is baked
into the deployed output and the build reports success.

Only genuine failures reach here. A query that succeeds and returns no rows is
not a failure and does not call this.

Non-production builds are unaffected, so local builds and CI runs without a
database continue to fall back as before.

## Parameters

### source

`string`

### cause

`unknown`

## Returns

`void`
