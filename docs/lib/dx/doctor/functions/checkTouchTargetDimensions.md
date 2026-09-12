[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/doctor](../README.md) / checkTouchTargetDimensions

# Function: checkTouchTargetDimensions()

> **checkTouchTargetDimensions**(`root`, `fix?`): [`DiagnosticCheckResult`](../interfaces/DiagnosticCheckResult.md)

Check Minimum Touch Target Dimensions Guard (ADR-0003 & ADR-0019)

IMPORTANT: this is a static source-text heuristic only. It scans JSX for
className tokens that are *known* to render at a particular pixel size;
it never renders anything and cannot see the real, computed box a
control occupies (content-driven padding, inherited styles, responsive
overrides, etc. are all invisible to it). A "pass" here means "no
obviously undersized class name was found in source" — it is NOT proof
that every interactive control satisfies the 48px standard on real
rendered output. Rendered-dimension proof comes from the real-browser
assertions in `__tests__/e2e/touch-controls.spec.ts`
("Real rendered touch-target dimensions" suite), which measure actual
`getBoundingClientRect()` output across viewports.

## Parameters

### root

`string`

### fix?

`boolean` = `false`

## Returns

[`DiagnosticCheckResult`](../interfaces/DiagnosticCheckResult.md)
