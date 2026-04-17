# Project Plan / Requirements Specification

This living document outlines the roadmap and scope for remaining phases of the Portfolio Hub.

## Phase 1: Infrastructure and Repository Setup (Complete)
- [x] Bootstrapped Next.js 16 with App Router and Turbopack.
- [x] Configured Tailwind CSS v4 with a CSS-first approach.
- [x] Initialized Prisma ORM with SQLite as a local headless CMS.

## Future Phases

### Data Integration (GitHub API)
- Setup API endpoints or Server Components to fetch and cache dynamic statistics from the GitHub API.
- Pull commit history, repository metadata, and language statistics to augment the local CMS data.

### UI Layout & Interactions
- Implement advanced layout systems utilizing the `Pretext` library for typography and structural flow.
- Integrate UI and animation libraries such as **Aceternity** and **Magic UI** to build engaging, interactive elements and micro-interactions for case studies.

### Production Deployment
- Migrate the local SQLite Prisma provider to a serverless PostgreSQL instance (e.g., Vercel Postgres or Neon).
- Implement proper CI/CD pipelines and deploy the final application to Vercel.
