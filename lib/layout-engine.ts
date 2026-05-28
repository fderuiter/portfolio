export interface SizedItem {
  id?: string;
  height: number;
  [key: string]: unknown;
}

export function distributeGreedyLPT<T extends SizedItem>(
  items: T[],
  colCount: number,
  gap: number = 0
): { columns: T[][], columnHeights: number[] } {
  const columns: T[][] = Array.from({ length: colCount }, () => []);
  const columnHeights = Array(colCount).fill(0);

  // Sorting descending by height for LPT (Longest Processing Time)
  const sortedItems = [...items].sort((a, b) => b.height - a.height);

  for (const item of sortedItems) {
    let minColIdx = 0;
    let minHeight = columnHeights[0];
    for (let i = 1; i < colCount; i++) {
      if (columnHeights[i] < minHeight) {
        minHeight = columnHeights[i];
        minColIdx = i;
      }
    }

    columns[minColIdx].push(item);
    columnHeights[minColIdx] += item.height + gap;
  }

  return { columns, columnHeights };
}
