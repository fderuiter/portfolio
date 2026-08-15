[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/proof-utils](../README.md) / generateTruthTable

# Function: generateTruthTable()

> **generateTruthTable**(`premises`, `conclusion`): `object`

Defined in: [lib/proof-utils.ts:564](https://github.com/fderuiter/portfolio/blob/main/lib/proof-utils.ts#L564)

Dynamically synthesizes all combinatorial truth table valuations for a set of premises and a conclusion.

## Parameters

### premises

`object`[]

### conclusion

#### ast

[`PropAst`](../type-aliases/PropAst.md)

#### label

`string`

## Returns

`object`

### counterexampleValuation?

> `optional` **counterexampleValuation?**: `Record`\<`string`, `boolean`\>

### truthTable

> **truthTable**: [`TruthTableRow`](../interfaces/TruthTableRow.md)[]

### variables

> **variables**: `string`[]
