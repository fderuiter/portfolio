[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/github](../README.md) / GITHUB\_REQUEST\_BUDGET\_MS

# Variable: GITHUB\_REQUEST\_BUDGET\_MS

> `const` **GITHUB\_REQUEST\_BUDGET\_MS**: `8000` = `8000`

Total wall-clock budget, in milliseconds, for all upstream GitHub calls made
while assembling one repository's statistics. The calls share a single
deadline, so an outage or a throttled endpoint cannot stack four slow
requests into an unbounded page render.
