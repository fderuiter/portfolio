# Database & CMS Guidelines

This document outlines our strategy for utilizing Prisma ORM as a local headless CMS.

## Schema Design

We abstract editorial content, narratives, feedback, and user interactions away from the raw GitHub codebase using a serverless Neon PostgreSQL database, managed via Prisma.

### Core Content Schema (`CaseStudy`)

The primary schema mapping our portfolio projects is the `CaseStudy` model:

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
  commands_json           String?
  playback_json           String?
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt
}
```

This ensures we can dynamically inject rich text and architectural explanations into our UI components.

### Feedback & Interaction Schemas (`CaseStudyFeedback` & `CaseStudyReaction`)

User feedback and quick reaction badges attached to case studies are captured via two dedicated interaction models:

```prisma
model CaseStudyFeedback {
  id             String   @id @default(cuid())
  caseStudySlug  String
  takeaways      String
  comments       String
  connectionHash String
  createdAt      DateTime @default(now())

  @@index([caseStudySlug])
  @@index([connectionHash])
}

model CaseStudyReaction {
  id             String   @id @default(cuid())
  caseStudySlug  String
  reactionType   String
  connectionHash String
  createdAt      DateTime @default(now())

  @@index([caseStudySlug])
  @@index([caseStudySlug, reactionType])
  @@index([connectionHash])
}
```

### Schema Design Rules for Feedback & Reactions

1. **Relational Coupling via Slugs:**
   - Feedback and reaction records decouple relational key constraints by referencing `caseStudySlug` directly, matching `CaseStudy.slug`.
   - Single and compound indexes (`[caseStudySlug]` and `[caseStudySlug, reactionType]`) are placed on foreign slug queries for fast lookup and aggregation performance.

2. **Serialized Array Format for `takeaways`:**
   - The `takeaways` field in `CaseStudyFeedback` stores a JSON string representation of selected key takeaways (e.g., `["architectural_narrative", "telemetry"]`).
   - Validated at submission (minimum 1 item) and parsed back into string arrays when served via the API.

3. **Constructive Comment Bounds:**
   - The `comments` field holds free-form text feedback.
   - Enforces validation boundaries between 3 and 2000 characters.

4. **Strict Reaction Type Enums:**
   - The `reactionType` field in `CaseStudyReaction` only accepts valid reaction badge tokens: `"insightful"`, `"mind_blowing"`, `"actionable"`, or `"thorough"`.
   - Aggregated in database queries using Prisma `groupBy` operations.

5. **Privacy-Preserving Connection Hash (`connectionHash`):**
   - The `connectionHash` field stores a SHA-256 hash computed from client connection context (`IP:User-Agent`).
   - Prevents duplicate feedback submissions within a 1-hour sliding window (returning HTTP 429) and identifies active user reactions while guaranteeing zero raw IP address or PII retention.

## Prototyping Workflows

During development, we utilize a serverless Neon PostgreSQL datastore. This provides low-latency cloud data persistence.

**To create a tracked schema change on a disposable development database, run:**
```bash
npx prisma migrate dev --name <descriptive_name>
```

Review and commit the generated migration with `schema.prisma`. Do not run
`prisma db push` against production or a long-lived shared database because it
bypasses Prisma's migration ledger. See [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)
for the production runbook and CI guarantees.

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
  - **Permitted Inline Elements:** `<strong>`, `<em>`, `<a>`, `<span>`, `<abbr>` (with optional `class`, `href`, `target`, `rel`, `data-term`, `data-definition`, `data-key`, `role`, `tabindex`, `aria-label`, `aria-describedby`, `aria-hidden`, `aria-expanded`, and `aria-checked` attributes)
- **Forbidden Elements:** Prohibits `<script>`, `<iframe>`, `<img onerror="...">`, or custom inline inline-styles to maintain strict data integrity boundaries.

