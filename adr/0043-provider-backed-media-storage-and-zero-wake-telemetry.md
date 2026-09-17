# ADR 0043: Provider-Backed Media Storage & Zero-Wake Engagement Telemetry

## Status

Accepted on 2026-09-17. Governs epics #327 (media asset management) and #757 (technical blog platform), and child tickets #638 and #765. Extends ADR 0036 (Free-Tier Offloading & Provider Quota Governance) and ADR 0041 (Blog Content Architecture).

## Context

As the platform expands to support administrator media uploads (project thumbnails, case study assets in #638 / #327) and reader engagement telemetry (blog post reactions in #765 / #757), naive implementations pose severe risks to stability, security, and provider free-tier limits:

1. **Serverless Ephemeral Storage Anti-Pattern**: An in-process memory `Map` (`globalMediaStorage`) loses assets whenever serverless functions spin down or cold-start, creating broken media URLs while database records still reference them.
2. **Database Bloat & Cold-Start Contention**: Storing binary images directly inside Neon Postgres (`bytea` columns) rapidly consumes the 0.5 GiB free-tier storage limit and triggers continuous compute wakeups.
3. **SVG Stored XSS Vulnerability**: Serving user-uploaded SVGs directly as `image/svg+xml` without full DOM purification allows malicious scripts and inline event handlers (`onload`, `onerror`) to execute same-origin in the administrator's or visitor's browser.
4. **Neon Compute Sleep Interruption**: Uncached public reads for blog reactions (or querying Postgres when Redis cache keys are cold) wake Neon serverless compute during normal browsing, violating the compute-shield invariant of ADR 0036.
5. **Non-Atomic Duplicate Submissions**: In multi-instance serverless runtimes, in-process rate limits fail to prevent duplicate reaction spam, and non-atomic read-then-write checks allow race conditions.

## Decision

### 1. Abstract `MediaStorageProvider` Architecture

To decouple media storage from ephemeral serverless memory and preserve Neon database quotas:

- **Service Interface**: Define `MediaStorageProvider` in `lib/services/media-storage.ts` with explicit contracts:
  - `upload(file: Buffer, filename: string, contentType: string): Promise<{ url: string; key: string }>`
  - `delete(key: string): Promise<void>`
  - `getUrl(key: string): string`
- **Cloud Provider (`VercelBlobStorageProvider`)**: In preview and production environments with `BLOB_READ_WRITE_TOKEN`, assets are stored in Vercel Blob (or S3/Cloudflare R2) with CDN caching and isolated public URLs.
- **Local Provider (`LocalStorageProvider`)**: In local development or automated test environments lacking external credentials, assets are written deterministically to `.media-storage/` on disk and served through `/api/media/[key]`.
- **Bounded Stream Ingestion**: The upload endpoint (`/api/admin/projects/[slug]/image`) enforces a hard 5 MB size limit during multipart streaming ingestion to prevent memory exhaustion.

### 2. SVG Defense-in-Depth

All SVG assets undergo server-side sanitization before persistence:

- **DOMPurify Sanitization**: Parsed through `isomorphic-dompurify` configured to strip `<script>` tags, external resource references (`xlink:href`, `<feImage>`), and all `on*` event handlers.
- **Content-Security-Policy**: When serving SVGs via the media proxy route (`/api/media/[key]`), enforce `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'` alongside `X-Content-Type-Options: nosniff`.

### 3. Zero-Neon-Wake Read Boundary for Reactions

To preserve Neon's 5-minute auto-suspend compute sleep:

- **Zero-Wake GET**: `GET /api/blog/reactions` reads strictly from Upstash Redis via `HGETALL`. If the Redis key is cold or uninitialized, the endpoint returns a zeroed reaction set (`{ insightful: 0, mind_blowing: 0, actionable: 0, thorough: 0 }`) without querying Postgres.
- **Authoritative Hydration**: Postgres is never queried on the read path. Redis reaction counters are populated during initial database seed or updated during scheduled maintenance.

### 4. Atomic Write Buffering & Duplicate Rejection

To guarantee reliable rate-limiting and data integrity across serverless instances:

- **Atomic Pipeline Mutation**: `POST /api/blog/reactions` computes a SHA-256 connection hash from `IP:User-Agent`. It executes an Upstash Redis pipeline checking set membership (`SISMEMBER`) and incrementing the reaction counter (`HINCRBY`).
- **HTTP 429 Semantics**: If the connection hash already exists in the post's 24-hour reaction set, the endpoint immediately returns `429 Too Many Requests`.
- **Fail-Safe Buffer Boundary**: If Redis is unreachable, mutations fail cleanly with an error envelope rather than falling back to unbuffered direct Postgres writes.

### 5. Scheduled Maintenance Flush & Schema Integrity

- **Database Model**: `BlogPostReaction` in `prisma/schema.prisma` enforces a compound uniqueness constraint `@@unique([blogPostSlug, reactionType, connectionHash])`.
- **Maintenance Integration**: Buffered Redis reactions and unique user reaction records are flushed to Neon Postgres exclusively during the consolidated daily maintenance cycle (`/api/cron/maintenance` via `flushBufferedReactionsToDatabase`), ensuring zero Neon wakeups from interactive clicking.

## Consequences

- **Free-Tier Integrity**: Neon Postgres remains asleep during public blog browsing; Upstash command usage stays safely bounded within the 10,000 commands/day limit.
- **Instance-Resilient Persistence**: Admin-uploaded project images persist across serverless redeployments without memory leaks or cold-start data loss.
- **Security Hardening**: Stored XSS vectors in SVG uploads are eliminated at both the ingestion boundary (DOMPurify) and the transport boundary (CSP headers).
- **Test Determinism**: Local test suites run hermetically without external cloud blob credentials using `LocalStorageProvider`.
