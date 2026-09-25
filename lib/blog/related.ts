import type { BlogPostSummary, ContentPillar } from "./types";
import type { CaseStudyData } from "@/lib/case-studies-data";

export type RelatedContentType = "dispatch" | "case-study";

export interface RelatedItem {
  id: string;
  type: RelatedContentType;
  slug: string;
  title: string;
  summary: string;
  href: string;
  pillar?: ContentPillar;
  primaryLanguage?: string;
  tags: string[];
  readingTimeMinutes?: number | null;
  score: number;
  matchedTags: string[];
}

/**
 * Domain-specific keyword mapping associating each content pillar with
 * related architectural, clinical, algorithmic, and engineering terms.
 */
export const PILLAR_KEYWORDS: Record<ContentPillar, string[]> = {
  "clinical-data-engineering": [
    "cdisc",
    "odm",
    "sdtm",
    "clinical",
    "trials",
    "hipaa",
    "adam",
    "edc",
    "biostatistics",
    "crm",
    "gxp",
    "usdm",
  ],
  "formal-verification": [
    "formal",
    "verification",
    "lean",
    "lean 4",
    "rust",
    "ast",
    "pde",
    "numerical",
    "compiler",
    "math",
    "algorithms",
  ],
  "accessibility-engineering": [
    "accessibility",
    "a11y",
    "wcag",
    "opendyslexic",
    "pretext",
    "cognitive",
    "typography",
    "canvas 2d",
    "canvas",
  ],
  "browser-graphics-engineering": [
    "graphics",
    "canvas",
    "webgl",
    "game",
    "vector",
    "illustration",
    "crt",
    "rendering",
  ],
  "agent-first-dx": [
    "agent",
    "dx",
    "prompt",
    "ast",
    "compiler",
    "schema",
    "inngest",
    "tooling",
    "eval",
  ],
  "field-notes": [
    "architecture",
    "refactoring",
    "monorepo",
    "clean-architecture",
    "systems",
  ],
};

/**
 * Normalizes a tag string by lowercasing and stripping non-alphanumeric characters,
 * allowing "Web Workers" and "web-workers" or "CDISC ODM" and "cdisc-odm" to match.
 */
export function normalizeTag(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export interface CalculateRelatedOptions {
  limit?: number;
  posts: BlogPostSummary[];
  caseStudies?: CaseStudyData[];
}

/**
 * Calculates contextually matched related dispatches and case studies
 * based on shared content pillar and overlapping normalized technical tags.
 *
 * Scoring model:
 * - Shared Pillar (dispatches): +10 points
 * - Domain Keyword Alignment (case studies): +6 points
 * - Exact / Normalized Tag Match: +4 points per matching tag
 *
 * Returns deterministically sorted top N items.
 */
export function calculateRelatedReading(
  current: {
    slug: string;
    pillar: ContentPillar;
    tags: string[];
  },
  options: CalculateRelatedOptions
): RelatedItem[] {
  const limit = options.limit ?? 3;
  const normalizedCurrentTags = current.tags.map(normalizeTag).filter(Boolean);
  const currentPillarKeywords = (PILLAR_KEYWORDS[current.pillar] || []).map(
    normalizeTag
  );

  const results: RelatedItem[] = [];

  // 1. Score candidate blog posts
  for (const post of options.posts) {
    if (post.slug === current.slug) {
      continue;
    }

    let score = 0;
    const matchedTags: string[] = [];

    if (post.pillar === current.pillar) {
      score += 10;
    }

    const postNormalizedTags = post.tags.map((t) => ({
      original: t,
      normalized: normalizeTag(t),
    }));

    for (const postTag of postNormalizedTags) {
      if (
        postTag.normalized &&
        normalizedCurrentTags.includes(postTag.normalized)
      ) {
        score += 4;
        if (!matchedTags.includes(postTag.original)) {
          matchedTags.push(postTag.original);
        }
      }
    }

    if (score > 0) {
      results.push({
        id: `blog-${post.slug}`,
        type: "dispatch",
        slug: post.slug,
        title: post.title,
        summary: post.dek,
        href: `/blog/${post.slug}`,
        pillar: post.pillar,
        tags: post.tags,
        readingTimeMinutes: post.readingTimeMinutes,
        score,
        matchedTags,
      });
    }
  }

  // 2. Score candidate case studies
  if (options.caseStudies && options.caseStudies.length > 0) {
    for (const cs of options.caseStudies) {
      if (cs.published === false) {
        continue;
      }

      let score = 0;
      const matchedTags: string[] = [];
      const csTags = (cs.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const csNormalizedTags = csTags.map((t) => ({
        original: t,
        normalized: normalizeTag(t),
      }));

      // Check tag matches with current post tags
      for (const csTag of csNormalizedTags) {
        if (
          csTag.normalized &&
          normalizedCurrentTags.includes(csTag.normalized)
        ) {
          score += 4;
          if (!matchedTags.includes(csTag.original)) {
            matchedTags.push(csTag.original);
          }
        }
      }

      // Match pillar keywords against whole title words, not substrings,
      // so short keywords like "ast" or "rust" don't hit "starting" or "trust"
      // (adjacent pairs and triples cover keywords like "clean-architecture")
      const titleWords = cs.title
        .split(/[^a-z0-9]+/i)
        .map((word) => normalizeTag(word))
        .filter(Boolean);
      const titleTokens = new Set<string>();
      titleWords.forEach((_, i) => {
        for (let n = 1; n <= 3 && i + n <= titleWords.length; n++) {
          titleTokens.add(titleWords.slice(i, i + n).join(""));
        }
      });

      // Check domain keyword match with post's content pillar
      const matchesPillar =
        csNormalizedTags.some((t) =>
          currentPillarKeywords.includes(t.normalized)
        ) || currentPillarKeywords.some((kw) => titleTokens.has(kw));

      if (matchesPillar) {
        score += 6;
      }

      if (score > 0) {
        results.push({
          id: `case-study-${cs.slug}`,
          type: "case-study",
          slug: cs.slug,
          title: cs.title,
          summary: cs.editorial_content,
          href: `/case-studies/${cs.slug}`,
          primaryLanguage: cs.primary_language,
          tags: csTags,
          score,
          matchedTags,
        });
      }
    }
  }

  // 3. Sort deterministically: highest score first; tiebreak by title
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.title.localeCompare(b.title);
  });

  return results.slice(0, limit);
}
