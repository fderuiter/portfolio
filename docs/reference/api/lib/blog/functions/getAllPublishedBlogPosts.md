[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/blog](../README.md) / getAllPublishedBlogPosts

# Function: getAllPublishedBlogPosts()

> **getAllPublishedBlogPosts**(): `Promise`\<[`BlogPostSummary`](../types/interfaces/BlogPostSummary.md)[]\>

Returns every published post, newest first.

Stubbed until #760 (M3) lands `BlogPostService` with the real Resilient
Hybrid Fallback read path against Neon/Redis. Returning an empty array
here — rather than `app/blog/page.tsx` or `app/sitemap.ts` reaching for
a service that doesn't exist yet — is the integration point M3 replaces;
callers never change.

## Returns

`Promise`\<[`BlogPostSummary`](../types/interfaces/BlogPostSummary.md)[]\>
