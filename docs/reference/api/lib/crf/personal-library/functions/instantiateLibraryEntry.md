[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/crf/personal-library](../README.md) / instantiateLibraryEntry

# Function: instantiateLibraryEntry()

> **instantiateLibraryEntry**(`entry`, `options?`, `now?`): [`InstantiatedLibraryEntry`](../interfaces/InstantiatedLibraryEntry.md)

Produces an independent copy of a library entry, ready to insert.

Every identity is freshly allocated and every internal reference remapped -
rule targets, trigger lists, condition operands including grouped and
field-to-field comparisons, calculation formulas and codelist references -
so the copy shares nothing with the library entry or with any previous
insertion of it.

## Parameters

### entry

[`PersonalLibraryEntry`](../interfaces/PersonalLibraryEntry.md)

### options?

[`InstantiateLibraryEntryOptions`](../interfaces/InstantiateLibraryEntryOptions.md)

### now?

`Date`

## Returns

[`InstantiatedLibraryEntry`](../interfaces/InstantiatedLibraryEntry.md)
