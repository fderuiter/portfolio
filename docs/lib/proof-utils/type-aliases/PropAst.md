[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / PropAst

# Type Alias: PropAst

> **PropAst** = \{ `name`: `string`; `type`: `"var"`; \} \| \{ `operand`: `PropAst`; `type`: `"not"`; \} \| \{ `left`: `PropAst`; `right`: `PropAst`; `type`: `"and"`; \} \| \{ `left`: `PropAst`; `right`: `PropAst`; `type`: `"or"`; \} \| \{ `left`: `PropAst`; `right`: `PropAst`; `type`: `"implies"`; \} \| \{ `left`: `PropAst`; `right`: `PropAst`; `type`: `"iff"`; \} \| \{ `type`: `"bottom"`; \}

Defined in: [lib/proof-utils.ts:126](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L126)
