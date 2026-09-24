[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/trial-and-error/scenarios](../README.md) / DEMOGRAPHICS\_SCENARIO

# Variable: DEMOGRAPHICS\_SCENARIO

> `const` **DEMOGRAPHICS\_SCENARIO**: [`Scenario`](../../types/type-aliases/Scenario.md)

Small Blind. The SAP population is ITT (N=12). FAS (N=11) is a distinct
population here: the SAP declares no alias, so a percentage divided by the
FAS N is a fatal denominator error. Rounding is half-to-even at one decimal
place, and the Total mean age is exactly 45.25, so the convention decides
between 45.2 and 45.3.
