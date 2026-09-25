/**
 * Utility to parse headings (h2, h3) from blog post HTML,
 * generate clean and unique anchor IDs, and inject IDs into the HTML tags.
 */

export interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Transforms a human-readable heading string into a URL-friendly anchor slug.
 */
export function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[^\w\s-]/g, "") // remove punctuation
    .trim()
    .replace(/\s+/g, "-") // replace whitespace with dashes
    .replace(/-+/g, "-"); // collapse duplicate dashes

  return slug || "section";
}

/**
 * Extracts h2 and h3 headings from an HTML string, generates unique slug IDs,
 * and ensures each heading tag carries an `id` attribute for anchor navigation.
 */
export function extractAndInjectHeadings(html: string): {
  html: string;
  headings: HeadingItem[];
} {
  if (!html || typeof html !== "string") {
    return { html: html || "", headings: [] };
  }

  const headings: HeadingItem[] = [];
  const usedIds = new Map<string, number>();

  // Regular expression targeting h2 and h3 headings
  const headingRegex = /<(h[23])(\b[^>]*)>([\s\S]*?)<\/\1>/gi;

  const modifiedHtml = html.replace(
    headingRegex,
    (_fullMatch, tag: string, attributes: string, innerContent: string) => {
      const level = tag.toLowerCase() === "h2" ? 2 : 3;

      // Strip inner tags to get plain text label for the TOC
      const cleanText = innerContent.replace(/<[^>]*>/g, "").trim();

      // Check if the heading already has an id attribute
      const idMatch = /\bid=(["'])(.*?)\1/i.exec(attributes);
      let id: string;

      if (idMatch && idMatch[2]) {
        id = idMatch[2];
      } else {
        const baseSlug = slugifyHeading(cleanText);
        const count = usedIds.get(baseSlug) ?? 0;
        usedIds.set(baseSlug, count + 1);

        id = count === 0 ? baseSlug : `${baseSlug}-${count}`;
      }

      headings.push({
        id,
        text: cleanText,
        level,
      });

      // If id is already present, keep attributes as-is
      if (idMatch) {
        return `<${tag}${attributes}>${innerContent}</${tag}>`;
      }

      // Inject the id attribute
      return `<${tag} id="${id}"${attributes}>${innerContent}</${tag}>`;
    }
  );

  return {
    html: modifiedHtml,
    headings,
  };
}
