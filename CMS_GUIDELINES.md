# Database & CMS Guidelines

This document outlines our strategy for utilizing Prisma ORM as a local headless CMS.

## Schema Design

We abstract editorial content and narratives away from the raw GitHub codebase using a local SQLite database, managed via Prisma. The primary schema mapping our portfolio projects is the `CaseStudy` model:

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

During development, we utilize a local SQLite database (`dev.db`). This allows for zero-infrastructure, rapid iteration of editorial features.

**To sync schema changes to the local database, developers should run:**
```bash
bunx prisma db push
```

This command pushes the state of the `schema.prisma` directly to the database. It is ideal for rapidly prototyping the schema without the overhead of creating formal migration files (`prisma migrate dev`), which are generally reserved for when we eventually deploy to a production PostgreSQL database.
