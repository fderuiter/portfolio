[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/welch-data](../README.md) / getDescentCommitIntervalMs

# Function: getDescentCommitIntervalMs()

> **getDescentCommitIntervalMs**(`isMobileViewport`): `number`

Minimum interval between React state commits for the trail descent
simulation, in milliseconds.

On mobile the descent is throttled so a preview run does not drive a 60fps
`setState` loop through the whole map render tree, per the mobile runtime
budgets in AGENTS.md section 16. Desktop returns 0, meaning "commit on every
animation frame".

## Parameters

### isMobileViewport

`boolean`

Whether the viewport matches `(max-width: 767px)`.

## Returns

`number`

Milliseconds to wait between commits; 0 for uncapped.
