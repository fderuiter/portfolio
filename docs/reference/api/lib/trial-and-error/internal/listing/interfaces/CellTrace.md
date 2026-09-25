[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/listing](../README.md) / CellTrace

# Interface: CellTrace

The patient Listing behind one summary table cell: every subject in the
SAP population, filtered on the snapshot that produced the table, and the
subjects the cell actually counts.

## Properties

### matchedSubjectIds

> **matchedSubjectIds**: `string`[]

The subjects the cell counts, in listing order.

***

### rows

> **rows**: [`ListingRow`](ListingRow.md)[]

Every subject in the SAP population on that snapshot, by USUBJID.

***

### snapshotId

> **snapshotId**: `string`

The population snapshot the rows were filtered on: the table's own.
