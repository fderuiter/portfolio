# Portfolio Hub

A bleeding-edge interactive portfolio designed to unify disparate Python, Rust, and TypeScript repositories into a single, cohesive experience.

## Project Goals

The core objective of this project is to create an interactive showcase that dynamically pulls real codebase statistics and updates from GitHub, while presenting rich editorial narratives and architectural breakdowns. It serves as a unified hub for all professional software engineering work.

## Tech Stack & Features

- **Framework:** Next.js 16 (App Router + Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first configuration)
- **Visual Ecosystem:** Aceternity UI, Magic UI, Framer Motion
- **CMS:** Prisma ORM with Neon Serverless PostgreSQL
- **Layout Engine:** `@chenglou/pretext` - A 15KB, zero-dependency pure JavaScript/TypeScript library used for high-performance text measurement.
- **Performance:** Utilizes DOM-free layout calculations to maintain 60FPS during complex animations.

## Visual Architecture

The portfolio utilizes a "Design Engineering" approach, combining lightweight libraries like Aceternity UI and Magic UI with Framer Motion. This approach handles complex micro-interactions, hardware-accelerated physics, and typographic animations to provide a premium interactive experience without heavy, monolithic component libraries.

## Prerequisites

To work on this repository, you will need:
- **Node.js** (v20+)
- **npm** as the standard package manager.

## Setup Instructions

1. **Install Dependencies**
   Run the following command:
   ```bash
   npm install
   ```

2. **Initialize Database & Prisma Client**
   This project uses Prisma integrated with serverless Neon PostgreSQL. Set your `DATABASE_URL` in a `.env.local` file, then run:
   ```bash
   npx prisma generate
   ```

3. **Seed Database**
   To seed the database with dynamic clinical trials and schema engine case studies:
   ```bash
   npx prisma db seed
   ```

4. **Start the Development Server**
   Launch the Next.js 16 development environment with Turbopack and concurrent TypeScript compiler checks:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
