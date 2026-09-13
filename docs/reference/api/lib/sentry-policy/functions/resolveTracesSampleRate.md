[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/sentry-policy](../README.md) / resolveTracesSampleRate

# Function: resolveTracesSampleRate()

> **resolveTracesSampleRate**(`isProduction?`): `number`

Resolves the trace sampling rate for the current deployment.

Production is decided by `isProductionEnvironment`, which reads the validated
`VERCEL_ENV`. That distinction matters: `NODE_ENV` is `"production"` for
preview builds as well, so branching on it would spend span quota on every
preview deployment. Anything that is not a production deployment, including
preview, development and test, samples nothing.

## Parameters

### isProduction?

`boolean` = `...`

Override for the deployment check, for tests.

## Returns

`number`

The sampling rate, either the production ceiling or zero.
