/**
 * Raw blog post data shape conforming to the BlogPost Prisma model.
 */
export interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string;
  pillar: string;
  tags: string;
  published: boolean;
  reading_time_minutes: number | null;
  hero_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Static safety net for the blog's Resilient Hybrid Fallback service.
 * Authored blog posts are persisted in the database via `/admin` and
 * served through `BlogPostService`.
 */
export const FALLBACK_BLOG_POSTS: BlogPostData[] = [];
