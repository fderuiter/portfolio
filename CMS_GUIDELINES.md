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
  tags                    String   // Comma-separated string or a related Tag model
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

