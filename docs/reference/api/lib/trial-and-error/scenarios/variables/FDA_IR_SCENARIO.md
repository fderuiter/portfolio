[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/scenarios](../README.md) / FDA\_IR\_SCENARIO

# Variable: FDA\_IR\_SCENARIO

> `const` **FDA\_IR\_SCENARIO**: [`Scenario`](../../types/type-aliases/Scenario.md) & `object`

Boss Blind: the FDA's End-of-Phase-2 Information Request, the questions
that gate the move to Phase III and the only place the game has a clock.
The response is due in 48 hours and must go in at most 2 hands; every move
takes hours, and the clock running out first is a Clinical Hold, which
ends the run. Each targeted question names the output that answers it. It
is played on its own until Act II's boss pool draws it (#1084). It reads
Act I's fictional study data.

## Type Declaration

### encounter

> **encounter**: [`FdaIr`](../../types/type-aliases/FdaIr.md)
