[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / ScenarioExpectation

# Type Alias: ScenarioExpectation

> **ScenarioExpectation** = \{ `expected`: `boolean`; `fieldId`: `string`; `kind`: `"field_visible"`; \} \| \{ `expected`: `boolean`; `fieldId`: `string`; `kind`: `"field_required"`; \} \| \{ `expectedStatus`: [`CalculationStatus`](CalculationStatus.md); `expectedValue?`: `number` \| `null`; `fieldId`: `string`; `kind`: `"calculation"`; \} \| \{ `expected`: [`ConditionResult`](ConditionResult.md); `kind`: `"rule_result"`; `ruleId`: `string`; \}
