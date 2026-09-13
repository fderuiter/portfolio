[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/sentry-policy](../README.md) / isBenignClientNoise

# Function: isBenignClientNoise()

> **isBenignClientNoise**(`error`, `stack?`): `boolean`

Reports whether a captured exception is benign client noise that should never
consume error quota.

Covers aborted fetches, the two benign `ResizeObserver` notifications, faults
originating in browser extensions, and the simulated game engine exceptions
the arcade raises deliberately.

## Parameters

### error

`unknown`

The original exception from the Sentry hint.

### stack?

`string`

Optional stack or source URL to test for an extension origin.

## Returns

`boolean`

True when the event should be discarded.
