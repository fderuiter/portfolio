[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/blog-service](../README.md) / BlogPostService

# Class: BlogPostService

## Constructors

### Constructor

> **new BlogPostService**(): `BlogPostService`

#### Returns

`BlogPostService`

## Methods

### evictBlogPostCache()

> `static` **evictBlogPostCache**(`slug`): `Promise`\<`boolean`\>

Explicitly evicts a blog post from the Upstash Redis read-through cache
and dispatches on-demand Next.js ISR tag revalidations. Called by the
`/admin` publish flow (#761 / M4).

#### Parameters

##### slug

`string`

#### Returns

`Promise`\<`boolean`\>

***

### getAllPublishedBlogPosts()

> `static` **getAllPublishedBlogPosts**(): `Promise`\<[`BlogPostData`](../../../fallback-blog-posts/interfaces/BlogPostData.md)[]\>

Retrieves all published blog posts combining database records with
static fallbacks. Employs the Two-Tier Cache Shield (ADR 0036, ADR 0041):
Redis read-through cache first, then Neon, then the static `FALLBACK_BLOG_POSTS`
safety net so a database outage never breaks the `/blog` index or the sitemap.

Guarantees:
- Empty lists are cached with bounded TTL to avoid repeated database reads.
- Unpublished drafts in DB or cache are never exposed.
- DB draft records take precedence over same-slug fallbacks.
- Resulting list is strictly ordered newest-first by creation timestamp.

#### Returns

`Promise`\<[`BlogPostData`](../../../fallback-blog-posts/interfaces/BlogPostData.md)[]\>

***

### getBlogPostBySlug()

> `static` **getBlogPostBySlug**(`slug`): `Promise`\<[`BlogPostData`](../../../fallback-blog-posts/interfaces/BlogPostData.md) \| `null`\>

Retrieves a single published blog post by slug.
Employs the Two-Tier Cache Shield (ADR 0036):
- Check Upstash Redis read-through cache first (`blog:slug:[slug]`, 3600s TTL).
- On cache miss or Redis error, query Prisma and populate cache.
- Fall back to the static `FALLBACK_BLOG_POSTS` dataset only if absent from DB.
- If a record exists in DB with `published === false`, returns `null` (draft precedence).

#### Parameters

##### slug

`string`

#### Returns

`Promise`\<[`BlogPostData`](../../../fallback-blog-posts/interfaces/BlogPostData.md) \| `null`\>
