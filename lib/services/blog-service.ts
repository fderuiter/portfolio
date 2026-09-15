import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { FALLBACK_BLOG_POSTS, BlogPostData } from "@/lib/fallback-blog-posts";
import { redis, getScopedRedisKey, isRedisConfigured } from "@/lib/redis";
import { CONTENT_PILLARS, type ContentPillar } from "@/lib/blog/types";
import { sanitizeContentHtml } from "@/lib/content-sanitizer";

export type { BlogPostData };

export interface CreateBlogDraftInput {
  title: string;
  slug: string;
  dek: string;
  body: string;
  pillar: ContentPillar;
  tags: string;
  hero_image_url: string | null;
}

export interface UpdateBlogDraftInput {
  title?: string;
  slug?: string;
  dek?: string;
  body?: string;
  pillar?: ContentPillar;
  tags?: string[];
  heroImageUrl?: string | null;
  published?: boolean;
}

export interface BlogDraftPagination {
  page: number;
  pageSize: number;
}

/**
 * Validates whether a pillar identifier matches the closed ContentPillar taxonomy.
 */
export function isValidPillar(pillar: unknown): pillar is ContentPillar {
  return (
    typeof pillar === "string" &&
    (CONTENT_PILLARS as readonly string[]).includes(pillar)
  );
}

/**
 * Safely parses and validates a date value into a concrete Date instance.
 * Rejects NaN dates, unparsable strings, and out-of-range timestamps.
 */
export function parseValidDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;

  if (
    value instanceof Date ||
    Object.prototype.toString.call(value) === "[object Date]"
  ) {
    const d = value as Date;
    const time = d.getTime();
    if (Number.isNaN(time)) return null;
    const year = d.getUTCFullYear();
    if (year < 1970 || year > 9999) return null;
    try {
      d.toISOString();
      return new Date(time);
    } catch {
      return null;
    }
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    const time = d.getTime();
    if (Number.isNaN(time)) return null;
    const year = d.getUTCFullYear();
    if (year < 1970 || year > 9999) return null;
    try {
      d.toISOString();
      return new Date(time);
    } catch {
      return null;
    }
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    if (value < 0 || value > 253402300799999) return null;
    const d = new Date(value);
    const time = d.getTime();
    if (Number.isNaN(time)) return null;
    const year = d.getUTCFullYear();
    if (year < 1970 || year > 9999) return null;
    try {
      d.toISOString();
      return new Date(time);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Asserts whether an unknown item satisfies the BlogPostData contract with
 * validated dates, non-empty identity fields, and closed pillar taxonomy.
 */
export function isValidBlogPost(item: unknown): item is BlogPostData {
  if (!item || typeof item !== "object") return false;
  const p = item as Record<string, unknown>;
  if (
    typeof p.id !== "string" ||
    !p.id.trim() ||
    typeof p.slug !== "string" ||
    !p.slug.trim() ||
    typeof p.title !== "string" ||
    !p.title.trim() ||
    typeof p.dek !== "string" ||
    typeof p.body !== "string" ||
    !isValidPillar(p.pillar) ||
    typeof p.tags !== "string" ||
    p.published !== true
  ) {
    return false;
  }

  if (
    p.reading_time_minutes !== null &&
    p.reading_time_minutes !== undefined &&
    (typeof p.reading_time_minutes !== "number" ||
      !Number.isFinite(p.reading_time_minutes) ||
      p.reading_time_minutes < 0)
  ) {
    return false;
  }

  if (
    p.hero_image_url !== null &&
    p.hero_image_url !== undefined &&
    typeof p.hero_image_url !== "string"
  ) {
    return false;
  }

  const createdAt = parseValidDate(p.created_at);
  const updatedAt = parseValidDate(p.updated_at);
  if (!createdAt || !updatedAt) {
    return false;
  }

  return true;
}

/**
 * Coerces created_at and updated_at on a BlogPostData record into validated Date instances.
 * Throws a TypeError if either date is invalid.
 */
export function parseBlogPostDates(post: BlogPostData): BlogPostData {
  const createdAt = parseValidDate(post.created_at);
  const updatedAt = parseValidDate(post.updated_at);
  if (!createdAt || !updatedAt) {
    throw new TypeError(
      `parseBlogPostDates: Invalid date contract for blog post "${post?.slug ?? "unknown"}"`
    );
  }
  return {
    ...post,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

/**
 * Deterministic newest-first sort comparator for blog post items.
 * Uses created_at descending with slug ascending as a tie-breaker.
 * Handles invalid or missing dates safely without returning NaN.
 */
export function compareBlogPostsNewestFirst<
  T extends { created_at: Date; slug: string },
>(a: T, b: T): number {
  const timeA =
    a.created_at instanceof Date
      ? a.created_at.getTime()
      : new Date(a.created_at).getTime();
  const timeB =
    b.created_at instanceof Date
      ? b.created_at.getTime()
      : new Date(b.created_at).getTime();

  const validA = !Number.isNaN(timeA);
  const validB = !Number.isNaN(timeB);

  if (validA && validB) {
    const timeDiff = timeB - timeA;
    if (timeDiff !== 0) {
      return timeDiff;
    }
  } else if (validA && !validB) {
    return -1;
  } else if (!validA && validB) {
    return 1;
  }

  const slugA = typeof a.slug === "string" ? a.slug : "";
  const slugB = typeof b.slug === "string" ? b.slug : "";
  return slugA.localeCompare(slugB);
}

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

async function safeRevalidatePath(
  path: string,
  type?: "layout" | "page"
): Promise<void> {
  try {
    const { revalidatePath } = await import("next/cache");
    if (typeof revalidatePath === "function") {
      revalidatePath(path, type);
    }
  } catch (err) {
    if (env.VERCEL_ENV === "production") {
      console.warn(
        `BlogPostService.safeRevalidatePath: Path revalidation failed for "${path}":`,
        err
      );
    }
  }
}

async function safeRevalidateTag(tag: string): Promise<void> {
  try {
    const { revalidateTag } = await import("next/cache");
    if (typeof revalidateTag === "function") {
      revalidateTag(tag, "max");
    }
  } catch (err) {
    if (env.VERCEL_ENV === "production") {
      console.warn(
        `BlogPostService.safeRevalidateTag: Tag revalidation failed for "${tag}":`,
        err
      );
    }
  }
}

export class BlogPostService {
  /**
   * Retrieves only persisted unpublished drafts for the authenticated admin
   * collection. This intentionally never consults the public fallback data.
   */
  static async getDraftBlogPosts({ page, pageSize }: BlogDraftPagination) {
    const skip = (page - 1) * pageSize;
    const [drafts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { published: false },
        orderBy: [{ updated_at: "desc" }, { id: "asc" }],
        skip,
        take: pageSize,
      }),
      prisma.blogPost.count({ where: { published: false } }),
    ]);

    return { drafts, total };
  }

  /**
   * Persists an unpublished blog draft using server-owned publication state.
   * The existing public cache is evicted only after Prisma confirms creation.
   */
  static async createDraftBlogPost(input: CreateBlogDraftInput) {
    const sanitizedBody = sanitizeContentHtml(input.body);
    const wordCount = sanitizedBody
      .replace(/<[^>]*>/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    const created = await prisma.blogPost.create({
      data: {
        title: input.title,
        slug: input.slug,
        dek: input.dek,
        body: sanitizedBody,
        pillar: input.pillar,
        tags: input.tags,
        hero_image_url: input.hero_image_url,
        reading_time_minutes: Math.max(1, Math.ceil(wordCount / 200)),
        published: false,
      },
    });

    await BlogPostService.evictBlogPostCache(input.slug);
    return created;
  }

  /**
   * Retrieves a persisted blog post by ID (published or draft) for admin inspection.
   */
  static async getBlogPostById(id: string) {
    return prisma.blogPost.findUnique({
      where: { id },
    });
  }

  /**
   * Retrieves a persisted unpublished draft for an authorized admin item read.
   * Static public fallbacks are deliberately excluded from this private workflow.
   */
  static async getDraftBlogPostById(id: string) {
    return prisma.blogPost.findFirst({
      where: { id, published: false },
    });
  }

  /**
   * Applies a partial edit to a blog post or draft. Handles publishing state transitions.
   * Cache eviction runs only after persistence returns the updated record.
   */
  static async updateDraftBlogPost(id: string, input: UpdateBlogDraftInput) {
    let existing = await BlogPostService.getDraftBlogPostById(id);
    if (!existing) {
      existing = await BlogPostService.getBlogPostById(id);
    }
    if (!existing) {
      return null;
    }

    const data: {
      title?: string;
      slug?: string;
      dek?: string;
      body?: string;
      pillar?: ContentPillar;
      tags?: string;
      hero_image_url?: string | null;
      reading_time_minutes?: number;
      published?: boolean;
    } = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.dek !== undefined) data.dek = input.dek;
    if (input.pillar !== undefined) data.pillar = input.pillar;
    if (input.tags !== undefined) data.tags = input.tags.join(", ");
    if (input.published !== undefined) data.published = input.published;
    if (input.heroImageUrl !== undefined) {
      data.hero_image_url = input.heroImageUrl;
    }
    if (input.body !== undefined) {
      const sanitizedBody = sanitizeContentHtml(input.body);
      const wordCount = sanitizedBody
        .replace(/<[^>]*>/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      data.body = sanitizedBody;
      data.reading_time_minutes = Math.max(1, Math.ceil(wordCount / 200));
    }

    let updated: typeof existing | undefined;
    if (!existing.published) {
      const [res] = await prisma.blogPost.updateManyAndReturn({
        where: { id, published: false },
        data,
      });
      updated = res;
    }
    if (!updated) {
      const [res] = await prisma.blogPost.updateManyAndReturn({
        where: { id },
        data,
      });
      updated = res;
    }

    if (!updated) {
      return null;
    }

    const slugs = new Set([existing.slug, updated.slug]);
    await Promise.all(
      [...slugs].map((slug) => BlogPostService.evictBlogPostCache(slug))
    );
    return updated;
  }

  /**
   * Deletes a persisted blog post or draft by ID and evicts associated caches.
   */
  static async deleteBlogPost(id: string) {
    const existing = await prisma.blogPost.findUnique({
      where: { id },
    });
    if (!existing) {
      return null;
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    await BlogPostService.evictBlogPostCache(existing.slug);
    return existing;
  }

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
          const valid = cached.filter(isValidBlogPost).map(parseBlogPostDates);
          if (valid.length > 0) {
            valid.sort(compareBlogPostsNewestFirst);
            return valid;
          }
          // If cached had entries but NONE were valid, the cached array is malformed.
          // Fall through to DB query to heal and serve fresh data.
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
          const rawItem = {
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
          if (isValidBlogPost(rawItem)) {
            dbPosts.push(parseBlogPostDates(rawItem));
          }
        }
      }
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.warn(
          "BlogPostService.getAllPublishedBlogPosts: Database query failed, using static fallbacks:",
          err
        );
      }
      return FALLBACK_BLOG_POSTS.filter(
        (p) => p.published && isValidBlogPost(p)
      )
        .map(parseBlogPostDates)
        .sort(compareBlogPostsNewestFirst);
    }

    const merged: BlogPostData[] = [...dbPosts];

    for (const fallback of FALLBACK_BLOG_POSTS) {
      if (
        fallback.published &&
        !dbSlugs.has(fallback.slug) &&
        isValidBlogPost(fallback)
      ) {
        merged.push(parseBlogPostDates(fallback));
        dbSlugs.add(fallback.slug);
      }
    }

    merged.sort(compareBlogPostsNewestFirst);

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
    const trimmedSlug = typeof slug === "string" ? slug.trim() : "";
    if (!trimmedSlug) {
      return null;
    }

    const cacheKey = getScopedRedisKey(`blog:slug:${trimmedSlug}`);

    try {
      if (isRedisConfigured()) {
        const cached = await withTimeout(
          redis.get<unknown>(cacheKey),
          1500,
          "Redis cache read timeout"
        );

        if (
          isValidBlogPost(cached) &&
          cached.slug === trimmedSlug &&
          cached.published === true
        ) {
          return parseBlogPostDates(cached);
        }
      }
    } catch (cacheErr) {
      if (env.VERCEL_ENV === "production") {
        console.warn(
          `BlogPostService.getBlogPostBySlug: Redis cache read failed for "${trimmedSlug}", falling back:`,
          cacheErr
        );
      }
    }

    let dbRecordFound = false;
    let dbResult: BlogPostData | null = null;

    try {
      const r = await prisma.blogPost.findUnique({
        where: { slug: trimmedSlug },
      });
      if (r) {
        dbRecordFound = true;
        if (r.published) {
          const rawItem = {
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
          if (isValidBlogPost(rawItem)) {
            dbResult = parseBlogPostDates(rawItem);
          }
        }
      }
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.warn(
          `BlogPostService.getBlogPostBySlug: DB query failed for slug "${trimmedSlug}", falling back:`,
          err
        );
      }
      const fallback = FALLBACK_BLOG_POSTS.find(
        (p) =>
          p.slug === trimmedSlug && p.published === true && isValidBlogPost(p)
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
      (p) =>
        p.slug === trimmedSlug && p.published === true && isValidBlogPost(p)
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
   * and dispatches on-demand Next.js ISR path revalidations for rendered routes
   * (`/blog`, `/blog/[slug]`) and associated cache tags.
   *
   * Admin draft creation and editing invoke this after confirmed persistence.
   *
   * @param slug - The unique URL slug of the blog post to evict.
   * @returns True if the Redis cache keys were successfully deleted; false if Redis
   *          was unconfigured, timed out, or encountered a deletion error.
   */
  static async evictBlogPostCache(slug: string): Promise<boolean> {
    const trimmedSlug = typeof slug === "string" ? slug.trim() : "";
    if (!trimmedSlug) {
      return false;
    }

    const cacheKey = getScopedRedisKey(`blog:slug:${trimmedSlug}`);
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
            `BlogPostService.evictBlogPostCache: Redis eviction failed for "${trimmedSlug}":`,
            err
          );
        }
      }
    }

    await safeRevalidatePath(`/blog/${trimmedSlug}`);
    await safeRevalidatePath("/blog");
    await safeRevalidatePath("/sitemap.xml");
    await safeRevalidateTag(`blog-post-${trimmedSlug}`);
    await safeRevalidateTag("blog-posts");

    return evicted;
  }
}
