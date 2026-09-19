[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/env](../README.md) / isBuildPhase

# Function: isBuildPhase()

> **isBuildPhase**(): `boolean`

Reports whether the current process is a build rather than a running server.

Next sets NEXT_PHASE itself while prerendering and the end-to-end harness sets
PLAYWRIGHT_TEST, so together they identify every context where modules are
imported to generate output rather than to serve a request.

A production build has VERCEL_ENV set to "production", so a check for
production alone cannot distinguish static generation from serving traffic.
Callers that log only in production must combine the two, or a single build
emits one message per page per worker.

## Returns

`boolean`
