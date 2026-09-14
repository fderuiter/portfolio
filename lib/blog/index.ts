export * from "./types";
export * from "./presets";

import type { BlogPost, BlogPostSummary } from "./types";

/**
 * Returns every published post, newest first.
 *
 * Stubbed until #760 (M3) lands `BlogPostService` with the real Resilient
 * Hybrid Fallback read path against Neon/Redis. Returning an empty array
 * here — rather than `app/blog/page.tsx` or `app/sitemap.ts` reaching for
 * a service that doesn't exist yet — is the integration point M3 replaces;
 * callers never change.
 */
export async function getAllPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  return [];
}

/**
 * Returns one published post by slug, or `null` if it doesn't exist or
 * isn't published. Stubbed until #760 (M3) — see `getAllPublishedBlogPosts`.
 */
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  void slug;
  return null;
}
