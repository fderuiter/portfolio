/**
 * Public type contracts for the blog deep module.
 *
 * The pillar taxonomy is closed per ADR 0041 §3 — `BlogPost.pillar` must be
 * one of `CONTENT_PILLARS`, never free text.
 */

export const CONTENT_PILLARS = [
  "clinical-data-engineering",
  "formal-verification",
  "accessibility-engineering",
  "browser-graphics-engineering",
  "agent-first-dx",
  "field-notes",
] as const;

export type ContentPillar = (typeof CONTENT_PILLARS)[number];

export interface BlogPostSummary {
  slug: string;
  title: string;
  dek: string;
  pillar: ContentPillar;
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
  readingTimeMinutes: number | null;
  heroImageUrl: string | null;
}

export interface BlogPost extends BlogPostSummary {
  /** Sanitized HTML — same allowlist as `CaseStudy.architectural_narrative` (ADR 0041 §4). */
  body: string;
}
