import { CRFField } from "./types";

/**
 * Interface representing a partitioned row in a 12-column grid layout
 */
export interface RowInfo {
  rowIndex: number;
  fields: CRFField[];
  startIndex: number; // Flat array start index
  endIndex: number;   // Flat array end index (inclusive)
  totalSpan: number;  // Sum of column spans in this row
  columnOffsets: number[]; // Starting column offset (0..12) for each field in row
}

/**
 * Clamps a column span to the valid 1..12 range
 */
export function clampColumnSpan(span: number | undefined | null): number {
  if (span === undefined || span === null || Number.isNaN(span)) {
    return 12;
  }
  return Math.min(12, Math.max(1, Math.round(span)));
}

/**
 * Ensures all fields in an array have valid columnSpan values between 1 and 12
 */
export function sanitizeFieldColumnSpans(fields: CRFField[]): CRFField[] {
  return fields.map((field) => ({
    ...field,
    columnSpan: clampColumnSpan(field.columnSpan),
  }));
}

/**
 * Calculates row boundaries for a flat array of fields in a 12-column CSS grid.
 */
export function calculateRowBoundaries(
  fields: CRFField[],
  maxColumns = 12
): RowInfo[] {
  if (!fields || fields.length === 0) {
    return [];
  }

  const rows: RowInfo[] = [];
  let currentRowFields: CRFField[] = [];
  let currentRowSpan = 0;
  let rowStartIndex = 0;
  let rowOffsets: number[] = [];

  for (let i = 0; i < fields.length; i++) {
    const rawField = fields[i];
    const span = clampColumnSpan(rawField.columnSpan);
    const field = { ...rawField, columnSpan: span };

    if (currentRowSpan + span > maxColumns && currentRowFields.length > 0) {
      // Complete previous row
      rows.push({
        rowIndex: rows.length,
        fields: currentRowFields,
        startIndex: rowStartIndex,
        endIndex: i - 1,
        totalSpan: currentRowSpan,
        columnOffsets: rowOffsets,
      });

      // Start new row
      currentRowFields = [field];
      currentRowSpan = span;
      rowStartIndex = i;
      rowOffsets = [0];
    } else {
      rowOffsets.push(currentRowSpan);
      currentRowFields.push(field);
      currentRowSpan += span;
    }
  }

  if (currentRowFields.length > 0) {
    rows.push({
      rowIndex: rows.length,
      fields: currentRowFields,
      startIndex: rowStartIndex,
      endIndex: fields.length - 1,
      totalSpan: currentRowSpan,
      columnOffsets: rowOffsets,
    });
  }

  return rows;
}

/**
 * Finds the row and position of a field within calculated row boundaries
 */
export function findFieldRow(
  rows: RowInfo[],
  fieldIndex: number
): { row: RowInfo; fieldInRowIndex: number } | null {
  for (const row of rows) {
    if (fieldIndex >= row.startIndex && fieldIndex <= row.endIndex) {
      return {
        row,
        fieldInRowIndex: fieldIndex - row.startIndex,
      };
    }
  }
  return null;
}

/**
 * Calculates target flat array index for moving a field up or down across cumulative row boundaries.
 */
export function calculateRowRelativeMoveIndex(
  fields: CRFField[],
  fieldIndex: number,
  direction: "up" | "down",
  maxColumns = 12
): number {
  if (!fields || fields.length <= 1 || fieldIndex < 0 || fieldIndex >= fields.length) {
    return fieldIndex;
  }

  const sanitized = sanitizeFieldColumnSpans(fields);
  const rows = calculateRowBoundaries(sanitized, maxColumns);
  const fieldRowLocation = findFieldRow(rows, fieldIndex);

  if (!fieldRowLocation) {
    return fieldIndex;
  }

  const { row, fieldInRowIndex } = fieldRowLocation;
  const targetRowIndex = direction === "up" ? row.rowIndex - 1 : row.rowIndex + 1;

  // Boundary check: if already in first row moving up or last row moving down
  if (targetRowIndex < 0) {
    return Math.max(0, fieldIndex - 1);
  }
  if (targetRowIndex >= rows.length) {
    return Math.min(sanitized.length - 1, fieldIndex + 1);
  }

  const movingField = sanitized[fieldIndex];
  const currentColStart = row.columnOffsets[fieldInRowIndex];
  const currentColCenter = currentColStart + movingField.columnSpan / 2;

  const targetRow = rows[targetRowIndex];

  let bestIndexInTargetRow = 0;
  for (let k = 0; k < targetRow.fields.length; k++) {
    const tf = targetRow.fields[k];
    const tfStart = targetRow.columnOffsets[k];
    const tfCenter = tfStart + tf.columnSpan / 2;

    if (currentColCenter >= tfCenter) {
      bestIndexInTargetRow = k + 1;
    }
  }

  let targetFlatIndex = targetRow.startIndex + bestIndexInTargetRow;

  if (direction === "up" && targetFlatIndex > row.startIndex - 1) {
    targetFlatIndex = Math.max(0, row.startIndex - 1);
  } else if (direction === "down" && targetFlatIndex <= row.endIndex) {
    targetFlatIndex = Math.min(sanitized.length, row.endIndex + 1);
  }

  return targetFlatIndex;
}

/**
 * Reorders a field within a single section's flat field array using row-boundary splice math.
 */
export function reorderFieldWithRowSplice(
  fields: CRFField[],
  sourceIndex: number,
  targetIndex: number,
  _maxColumns = 12
): CRFField[] {
  if (!fields || fields.length === 0) return [];
  if (sourceIndex < 0 || sourceIndex >= fields.length) return sanitizeFieldColumnSpans(fields);

  const sanitized = sanitizeFieldColumnSpans(fields);
  const clampTarget = Math.max(0, Math.min(fields.length - 1, targetIndex));

  if (sourceIndex === clampTarget) {
    return sanitized;
  }

  const result = [...sanitized];
  const [moved] = result.splice(sourceIndex, 1);
  result.splice(clampTarget, 0, moved);

  return sanitizeFieldColumnSpans(result);
}

/**
 * Splices a dragged field into a target section at a computed index, respecting row fill capacities.
 */
export function spliceFieldIntoSection(
  sourceFields: CRFField[],
  targetFields: CRFField[],
  sourceIndex: number,
  targetIndex: number,
  isSameSection: boolean,
  maxColumns = 12
): { updatedSourceFields: CRFField[]; updatedTargetFields: CRFField[] } {
  if (isSameSection) {
    const reordered = reorderFieldWithRowSplice(sourceFields, sourceIndex, targetIndex, maxColumns);
    return {
      updatedSourceFields: reordered,
      updatedTargetFields: reordered,
    };
  }

  const cleanSource = sanitizeFieldColumnSpans(sourceFields);
  const cleanTarget = sanitizeFieldColumnSpans(targetFields);

  if (sourceIndex < 0 || sourceIndex >= cleanSource.length) {
    return { updatedSourceFields: cleanSource, updatedTargetFields: cleanTarget };
  }

  const sourceCopy = [...cleanSource];
  const [draggedField] = sourceCopy.splice(sourceIndex, 1);
  draggedField.columnSpan = clampColumnSpan(draggedField.columnSpan);

  const targetCopy = [...cleanTarget];
  const clampedTargetIdx = Math.max(0, Math.min(targetCopy.length, targetIndex));
  targetCopy.splice(clampedTargetIdx, 0, draggedField);

  return {
    updatedSourceFields: sourceCopy,
    updatedTargetFields: sanitizeFieldColumnSpans(targetCopy),
  };
}
