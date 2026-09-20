[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/sentry-policy](../README.md) / isReportableEnvironment

# Function: isReportableEnvironment()

> **isReportableEnvironment**(`isProduction?`): `boolean`

Reports whether captured events belong in Sentry at all.

Span sampling alone does not bound the error budget: `beforeSend` runs for
every captured exception regardless of `tracesSampleRate`, so a developer
running `next dev` against the production DSN spends the 5k monthly error
allowance on hot-reload aborts and local timeouts. Only a production
deployment produces errors anyone can act on, so only production reports.

## Parameters

### isProduction?

`boolean` = `...`

Override for the deployment check, for tests.

## Returns

`boolean`

True when the event should be transmitted.
