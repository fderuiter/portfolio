import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { FALLBACK_BLOG_POSTS, BlogPostData } from "@/lib/fallback-blog-posts";
import { redis, getScopedRedisKey, isRedisConfigured } from "@/lib/redis";

export type { BlogPostData };

/**
 * Executes a promise with an upper timeout bound, always clearing the underlying
 * timer resource upon completion to prevent timer leaks in event loops.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutErrorMsg: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutErrorMsg));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

async function safeRevalidateTag(tag: string): Promise<void> {
  try {
    const { revalidateTag } = await import("next/cache");
    if (typeof revalidateTag === "function") {
      revalidateTag(tag, "max");
    }
  } catch {
    // Tolerated outside of Next.js server runtime (e.g. unit tests)
  }
}

function isValidBlogPost(item: unknown): item is BlogPostData {
  if (!item || typeof item !== "object") return false;
  const p = item as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.slug === "string" &&
    typeof p.title === "string" &&
    typeof p.dek === "string" &&
    typeof p.body === "string" &&
    typeof p.pillar === "string" &&
    typeof p.tags === "string" &&
    p.published === true &&
    (p.created_at instanceof Date ||
      typeof p.created_at === "string" ||
      typeof p.created_at === "number") &&
    (p.updated_at instanceof Date ||
      typeof p.updated_at === "string" ||
      typeof p.updated_at === "number")
  );
}

function parseBlogPostDates(post: BlogPostData): BlogPostData {
  return {
    ...post,
    created_at: new Date(post.created_at),
    updated_at: new Date(post.updated_at),
  };
}

export class BlogPostService {
  /**
   * Retrieves all published blog posts combining database records with
   * static fallbacks. Employs the Two-Tier Cache Shield (ADR 0036, ADR 0041):
   * Redis read-through cache first, then Neon, then the static `FALLBACK_BLOG_POSTS`
   * safety net so a database outage never breaks the `/blog` index or the sitemap.
   *
   * Guarantees:
   * - Empty lists are cached with bounded TTL to avoid repeated database reads.
   * - Unpublished drafts in DB or cache are never exposed.
   * - DB draft records take precedence over same-slug fallbacks.
   * - Resulting list is strictly ordered newest-first by creation timestamp.
   */
  static async getAllPublishedBlogPosts(): Promise<BlogPostData[]> {
    const cacheKey = getScopedRedisKey("blog:all_published");

    try {
      if (isRedisConfigured()) {
        const cached = await withTimeout(
          redis.get<unknown>(cacheKey),
          1500,
          "Redis getAllPublishedBlogPosts timeout"
        );

        if (Array.isArray(cached)) {
          if (cached.length === 0) {
            return [];
          }
          return cached.filter(isValidBlogPost).map(parseBlogPostDates);
        }
      }
    } catch {
      // Tolerated, fall through to DB query
    }

    const dbPosts: BlogPostData[] = [];
    const dbSlugs = new Set<string>();

    try {
      const records = await prisma.blogPost.findMany({
        orderBy: { created_at: "desc" },
      });

      for (const r of records) {
        dbSlugs.add(r.slug);
        if (r.published) {
          dbPosts.push({
            id: r.id,
            slug: r.slug,
            title: r.title,
            dek: r.dek,
            body: r.body,
            pillar: r.pillar,
            tags: r.tags,
            published: r.published,
            reading_time_minutes: r.reading_time_minutes,
            hero_image_url: r.hero_image_url,
            created_at: new Date(r.created_at),
            updated_at: new Date(r.updated_at),
          });
        }
      }
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.warn(
          "BlogPostService.getAllPublishedBlogPosts: Database query failed, using static fallbacks:",
          err
        );
      }
      return FALLBACK_BLOG_POSTS.filter((p) => p.published)
        .map(parseBlogPostDates)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    const merged: BlogPostData[] = [...dbPosts];

    for (const fallback of FALLBACK_BLOG_POSTS) {
      if (fallback.published && !dbSlugs.has(fallback.slug)) {
        merged.push(parseBlogPostDates(fallback));
        dbSlugs.add(fallback.slug);
      }
    }

    merged.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (isRedisConfigured()) {
      try {
        await withTimeout(
          redis.set(cacheKey, merged, { ex: 3600 }),
          1500,
          "Redis cache write timeout"
        );
      } catch {
        // Tolerated
      }
    }

    return merged;
  }

  /**
   * Retrieves a single published blog post by slug.
   * Employs the Two-Tier Cache Shield (ADR 0036):
   * - Check Upstash Redis read-through cache first (`blog:slug:[slug]`, 3600s TTL).
   * - On cache miss or Redis error, query Prisma and populate cache.
   * - Fall back to the static `FALLBACK_BLOG_POSTS` dataset only if absent from DB.
   * - If a record exists in DB with `published === false`, returns `null` (draft precedence).
   */
  static async getBlogPostBySlug(slug: string): Promise<BlogPostData | null> {
    const cacheKey = getScopedRedisKey(`blog:slug:${slug}`);

    try {
      if (isRedisConfigured()) {
        const cached = await withTimeout(
          redis.get<unknown>(cacheKey),
          1500,
          "Redis cache read timeout"
        );

        if (
          isValidBlogPost(cached) &&
          cached.slug === slug &&
          cached.published === true
        ) {
          return parseBlogPostDates(cached);
        }
      }
    } catch (cacheErr) {
      if (env.VERCEL_ENV === "production") {
        console.warn(
          `BlogPostService.getBlogPostBySlug: Redis cache read failed for "${slug}", falling back:`,
          cacheErr
        );
      }
    }

    let dbRecordFound = false;
    let dbResult: BlogPostData | null = null;

    try {
      const r = await prisma.blogPost.findUnique({ where: { slug } });
      if (r) {
        dbRecordFound = true;
        if (r.published) {
          dbResult = {
            id: r.id,
            slug: r.slug,
            title: r.title,
            dek: r.dek,
            body: r.body,
            pillar: r.pillar,
            tags: r.tags,
            published: r.published,
            reading_time_minutes: r.reading_time_minutes,
            hero_image_url: r.hero_image_url,
            created_at: new Date(r.created_at),
            updated_at: new Date(r.updated_at),
          };
        }
      }
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.warn(
          `BlogPostService.getBlogPostBySlug: DB query failed for slug "${slug}", falling back:`,
          err
        );
      }
      const fallback = FALLBACK_BLOG_POSTS.find(
        (p) => p.slug === slug && p.published === true
      );
      return fallback ? parseBlogPostDates(fallback) : null;
    }

    if (dbRecordFound) {
      if (!dbResult) {
        return null;
      }
      if (isRedisConfigured()) {
        try {
          await withTimeout(
            redis.set(cacheKey, dbResult, { ex: 3600 }),
            1500,
            "Redis cache write timeout"
          );
        } catch {
          // Tolerated
        }
      }
      return dbResult;
    }

    const fallback = FALLBACK_BLOG_POSTS.find(
      (p) => p.slug === slug && p.published === true
    );
    const finalResult = fallback ? parseBlogPostDates(fallback) : null;

    if (finalResult && isRedisConfigured()) {
      try {
        await withTimeout(
          redis.set(cacheKey, finalResult, { ex: 3600 }),
          1500,
          "Redis cache write timeout"
        );
      } catch {
        // Tolerated
      }
    }

    return finalResult;
  }

  /**
   * Explicitly evicts a blog post from the Upstash Redis read-through cache
   * and dispatches on-demand Next.js ISR tag revalidations. Called by the
   * `/admin` publish flow (#761 / M4).
   */
  static async evictBlogPostCache(slug: string): Promise<boolean> {
    const cacheKey = getScopedRedisKey(`blog:slug:${slug}`);
    const allPublishedKey = getScopedRedisKey("blog:all_published");

    let evicted = false;
    if (isRedisConfigured()) {
      try {
        await withTimeout(
          redis.del(cacheKey, allPublishedKey),
          1500,
          "Redis cache eviction timeout"
        );
        evicted = true;
      } catch (err) {
        if (env.VERCEL_ENV === "production") {
          console.warn(
            `BlogPostService.evictBlogPostCache: Redis eviction failed for "${slug}":`,
            err
          );
        }
      }
    }

    await safeRevalidateTag(`blog-post-${slug}`);
    await safeRevalidateTag("blog-posts");

    return evicted;
  }
}
