[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/blog](../README.md) / getAllPublishedBlogPosts

# Function: getAllPublishedBlogPosts()

> **getAllPublishedBlogPosts**(): `Promise`\<[`BlogPostSummary`](../types/interfaces/BlogPostSummary.md)[]\>

Returns every published post, newest first.

Backed by `BlogPostService`'s Resilient Hybrid Fallback (Neon, Redis
read-through cache, then the static `FALLBACK_BLOG_POSTS` safety net).
Guarantees valid date and pillar contracts and deterministic newest-first ordering.

## Returns

`Promise`\<[`BlogPostSummary`](../types/interfaces/BlogPostSummary.md)[]\>
