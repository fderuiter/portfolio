export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
}

export function filterFuzzySearch<T extends SearchItem>(
  query: string,
  items: T[]
): T[] {
  if (!query) return items;
  const cleanQuery = query.toLowerCase().trim();
  
  if (!cleanQuery) return items;

  return items.filter((item) => {
    // Normalize strings: handle special characters, empty fields
    const titleNorm = (item.title || "").toLowerCase();
    const subtitleNorm = (item.subtitle || "").toLowerCase();
    
    return titleNorm.includes(cleanQuery) || subtitleNorm.includes(cleanQuery);
  });
}
