[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/km](../README.md) / kaplanMeier

# Function: kaplanMeier()

> **kaplanMeier**(`records`): \[`number`, `number`\][]

The Kaplan–Meier product-limit estimate for one arm's records. At a time
with both events and censorings, the events are counted first, so a subject
censored at t is still at risk at t. Pure.

## Parameters

### records

readonly `object`[]

## Returns

\[`number`, `number`\][]
