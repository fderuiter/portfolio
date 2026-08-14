# Database & CMS Guidelines

This document outlines our strategy for utilizing Prisma ORM as a local headless CMS.

## Schema Design

We abstract editorial content and narratives away from the raw GitHub codebase using a serverless Neon PostgreSQL database, managed via Prisma. The primary schema mapping our portfolio projects is the `CaseStudy` model:

```prisma
model CaseStudy {
  id                      String   @id @default(cuid())
  slug                    String   @unique
  title                   String
  primary_language        String
  github_url              String?
  editorial_content       String   // Stores general descriptions
  architectural_narrative String   // Stores deep-dive technical explanations
  published               Boolean  @default(false)
  simulated_telemetry     Boolean  @default(false)
  tags                    String   // Comma-separated string or a related Tag model
  classification          String   @default("MAINSTREAM")
  the_pitch               String?
  the_reality             String?
  lessons_learned         String?
  summary_html            String?
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt
}
```

This ensures we can dynamically inject rich text and architectural explanations into our UI components.

## Prototyping Workflows

During development, we utilize a serverless Neon PostgreSQL datastore. This provides low-latency cloud data persistence.

**To sync schema changes to the Neon database, developers should run:**
```bash
npx prisma db push
```

This command pushes the state of the `schema.prisma` directly to the active cloud datastore. It is ideal for rapidly prototyping the schema without the overhead of creating formal migration files, which are generally reserved for production promotion cycles.

---

## Content Markup Guidelines

To ensure the portfolio displays narratives with high aesthetic quality and robust security, editors contributing to the Prisma dynamic `CaseStudy` fields must conform to strict content formatting guidelines.

### 1. `editorial_content` Field
- **Purpose:** Brief introductory summaries or thesis highlights shown on primary feed grids.
- **Formatting:** Markdown strings are permitted (e.g., `**bold**`, `*italic*`, `` `inline code` ``). These tags are automatically stripped during SEO parsing but are parsed inside UI showcases via `@chenglou/pretext`.

### 2. `architectural_narrative` Field
- **Purpose:** Long-form technical explanation layout blocks.
- **Formatting:** Safe, pre-formatted HTML elements are permitted. To prevent Stored XSS vectors and maintain styling uniformity, the rendering pipeline sanitizes inputs against a strict element allowlist:
  - **Permitted Headers:** `<h2>`, `<h3>`, `<h4>` (e.g., `<h3>The Challenge</h3>`)
  - **Permitted Layout Elements:** `<p>`, `<ul>`, `<ol>`, `<li>`
  - **Permitted Code Layouts:** `<pre>`, `<code>` (e.g., `<pre><code class="language-typescript">// code</code></pre>`)
  - **Permitted Inline Elements:** `<strong>`, `<em>`, `<a>`, `<span>`, `<abbr>` (with optional `class`, `href`, `target`, `rel`, `data-term`, `data-definition`, and `data-key` attributes)
- **Forbidden Elements:** Prohibits `<script>`, `<iframe>`, `<img onerror="...">`, or custom inline inline-styles to maintain strict data integrity boundaries.


