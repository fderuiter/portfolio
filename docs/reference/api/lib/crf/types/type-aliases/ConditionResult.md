[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/types](../README.md) / ConditionResult

# Type Alias: ConditionResult

> **ConditionResult** = `"true"` \| `"false"` \| `"missing"` \| `"incompatible"`

Four-valued discrepancy check result (#540): "incompatible" is distinct
from "missing" so a genuine authoring/import error (comparing a date
field to a number literal, an unrecognized operator from an import) is
never silently reported the same as a field that simply has no value yet.
