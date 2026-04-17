# Portfolio Hub

A bleeding-edge interactive portfolio designed to unify disparate Python, Rust, and TypeScript repositories into a single, cohesive experience.

## Project Goals

The core objective of this project is to create an interactive showcase that dynamically pulls real codebase statistics and updates from GitHub, while presenting rich editorial narratives and architectural breakdowns. It serves as a unified hub for all professional software engineering work.

## Tech Stack & Features

- **Framework:** Next.js 16 (App Router + Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first configuration)
- **CMS:** Prisma ORM with SQLite
- **Layout Engine:** `@chenglou/pretext` - A 15KB, zero-dependency pure JavaScript/TypeScript library used for high-performance text measurement.
- **Performance:** Utilizes DOM-free layout calculations to maintain 60FPS during complex animations.

## Prerequisites

To work on this repository, you will need:
- **Node.js** (v18+)
- **bun** as the strictly enforced package manager. You can install bun via `curl -fsSL https://bun.sh/install | bash` or `npm install -g bun`.

## Setup Instructions

1. **Install Dependencies**
   Run the following command using `bun`:
   ```bash
   bun install
   ```

2. **Initialize Local Database & Prisma**
   This project uses Prisma with SQLite as a local headless CMS for rapid development.
   Generate the Prisma client and apply the schema:
   ```bash
   bunx prisma generate
   bunx prisma db push
   ```

3. **Start the Development Server**
   Launch the Next.js 16 development environment with Turbopack enabled:
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
