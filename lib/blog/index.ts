export * from "./types";
export * from "./presets";

import { BlogPostService } from "@/lib/services/blog-service";
import type { BlogPostData } from "@/lib/fallback-blog-posts";
import type { BlogPost, BlogPostSummary, ContentPillar } from "./types";

function toBlogPostSummary(data: BlogPostData): BlogPostSummary {
  return {
    slug: data.slug,
    title: data.title,
    dek: data.dek,
    pillar: data.pillar as ContentPillar,
    tags: data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    publishedAt: data.created_at,
    updatedAt: data.updated_at,
    readingTimeMinutes: data.reading_time_minutes,
    heroImageUrl: data.hero_image_url,
  };
}

/**
 * Returns every published post, newest first.
 *
 * Backed by `BlogPostService`'s Resilient Hybrid Fallback (Neon, Redis
 * read-through cache, then the static `FALLBACK_BLOG_POSTS` safety net).
 */
export async function getAllPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const posts = await BlogPostService.getAllPublishedBlogPosts();
  return posts.map(toBlogPostSummary);
}

/**
 * Returns one published post by slug, or `null` if it doesn't exist or
 * isn't published.
 */
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const post = await BlogPostService.getBlogPostBySlug(slug);
  if (!post) {
    return null;
  }
  return {
    ...toBlogPostSummary(post),
    body: post.body,
  };
}
