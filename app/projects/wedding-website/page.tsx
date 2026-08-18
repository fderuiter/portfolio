import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Wedding3DHeartDemo } from "@/components/Wedding3DHeartDemo";
import { CaseStudyFeedbackSection } from "@/components/CaseStudyFeedbackSection";
import { NextPrevNav } from "@/components/ui/NextPrevNav";
import { RichNarrative } from "@/components/RichNarrative";
import { IconBrandGithub, IconExternalLink, IconShieldCheck, IconCpu, IconSparkles, IconStack2 } from "@tabler/icons-react";
import { buildRouteMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = buildRouteMetadata({
  title: "Wedding Website & Interactive Guest Platform | Case Study",
  description: "Detailed technical case study showcasing the full-stack architecture, custom 3D WebGL physics features, real-time registry scraper engine, and enterprise administrative CMS of the Wedding Website platform (fderuiter/wedding_website).",
  path: "/projects/wedding-website",
  keywords: ["Wedding Website", "Next.js", "TypeScript", "Three.js", "Prisma", "Tailwind CSS", "Playwright", "Docker", "Full-Stack", "WebGL"],
  ogType: "article",
});

export default function WeddingWebsiteProjectPage() {
  const tags = ["Full-Stack", "Next.js", "TypeScript", "Three.js", "Prisma", "Tailwind CSS", "Playwright", "Docker"];

  return (
    <PageLayout
      variant="standard"
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-950 text-foreground flex flex-col items-center relative overflow-hidden outline-none"
    >
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl space-y-12">
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "Case Studies", href: "/case-studies" },
            { label: "Wedding Website & Interactive Guest Platform" },
          ]}
        />

        {/* Hero Section */}
        <header className="space-y-6 border-b border-zinc-900 pb-10">
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-100 leading-tight">
            Wedding Website &amp; Interactive Guest Platform
          </h1>

          <p className="text-lg text-zinc-300 leading-relaxed font-sans">
            An enterprise-grade, feature-driven full-stack web application built using Next.js, TypeScript, React, Prisma ORM, and Three.js. Designed as both a personalized guest portal and a dynamic content management system, it integrates custom real-time gift registry tracking, an automated product metadata web scraper, interactive 3D WebGL canvas simulations, and an administrative control suite with database versioning and snapshot restoration.
          </p>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="https://github.com/fderuiter/wedding_website"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sm font-bold text-neutral-100 transition cursor-pointer"
            >
              <IconBrandGithub className="w-5 h-5 text-rose-400" />
              <span>GitHub Repository (fderuiter/wedding_website)</span>
              <IconExternalLink className="w-4 h-4 text-zinc-400" />
            </a>

            <Link
              href="/case-studies/wedding-website"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-sm font-bold text-rose-300 transition cursor-pointer"
            >
              <IconStack2 className="w-5 h-5" />
              <span>View In-Depth Architecture Analysis</span>
            </Link>
          </div>
        </header>

        {/* Project Screenshots Gallery */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-sans text-neutral-100 flex items-center gap-2">
            <IconSparkles className="w-6 h-6 text-rose-400" />
            Interface Screenshots &amp; Visual Design
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Screenshot 1 */}
            <div className="group rounded-2xl bg-zinc-900/80 border border-zinc-800/80 overflow-hidden shadow-xl hover:border-rose-500/40 transition-all duration-300">
              <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
                <Image
                  src="/projects/wedding-website/sunset-embrace.jpg"
                  alt="Sunset Embrace Theme Landing Page"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-neutral-100">Sunset Embrace Guest Portal</h3>
                <p className="text-xs text-zinc-400">
                  Custom responsive guest experience with multi-party RSVP passcode verification and venue directions.
                </p>
              </div>
            </div>

            {/* Screenshot 2 */}
            <div className="group rounded-2xl bg-zinc-900/80 border border-zinc-800/80 overflow-hidden shadow-xl hover:border-rose-500/40 transition-all duration-300">
              <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
                <Image
                  src="/projects/wedding-website/3d-heart-demo.jpg"
                  alt="3D WebGL Physics Canvas Simulation"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-neutral-100">3D WebGL Physics Canvas</h3>
                <p className="text-xs text-zinc-400">
                  Hardware-accelerated Three.js floating geometry with boundary spring kinematics and multi-touch tracking.
                </p>
              </div>
            </div>

            {/* Screenshot 3 */}
            <div className="group rounded-2xl bg-zinc-900/80 border border-zinc-800/80 overflow-hidden shadow-xl hover:border-rose-500/40 transition-all duration-300">
              <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
                <Image
                  src="/projects/wedding-website/admin-dashboard.jpg"
                  alt="Administrative CMS & Snapshot Versioning"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-neutral-100">Admin Control &amp; Rollback</h3>
                <p className="text-xs text-zinc-400">
                  Drag-and-drop layout manager, automated snapshot versioning, and real-time audit log telemetry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive 3D Physics Canvas Demo Component */}
        <section>
          <h2 className="text-2xl font-bold font-sans text-neutral-100 mb-2 flex items-center gap-2">
            <IconCpu className="w-6 h-6 text-rose-400" />
            Interactive 3D WebGL Canvas Physics Simulator
          </h2>
          <p className="text-xs font-mono text-zinc-400 mb-4">
            Test the live Hooke&apos;s Law spring kinetics and parametric 3D mesh rendering engine directly in your browser.
          </p>
          <Wedding3DHeartDemo />
        </section>

        {/* Architecture ASCII Diagram & Deep Dive */}
        <section className="space-y-8 border-t border-zinc-900 pt-10">
          <h2 className="text-2xl font-bold font-sans text-neutral-100">Full-Stack System Architecture</h2>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 font-mono text-xs overflow-x-auto text-rose-300/90 leading-relaxed shadow-inner">
            <pre>{`+-------------------------------------------------------------------------+
|                              Next.js Frontend                           |
|  +-------------------+  +--------------------+  +--------------------+  |
|  | Guest Experience  |  | 3D Physics Canvas  |  | Admin Dashboard    |  |
|  | (RSVP, Registry,  |  | (Three.js, Bounds, |  | (Site Manager, D&D |  |
|  |  Logistics, Maps) |  |  Spring Physics)   |  |  Version Restore)  |  |
|  +---------+---------+  +---------+----------+  +---------+----------+  |
+------------|----------------------|-----------------------|-------------+
             |                      |                       |
+------------v----------------------v-----------------------v-------------+
|                     Next.js API Routes & Middleware                     |
|  +-------------------------------------------------------------------+  |
|  | Validation Engine (Zod) | Auth Guards & JWT | Audit Logger        |  |
|  +-------------------------------------------------------------------+  |
|  | Rate Limiting Engine    | SSRF SafeFetch    | Image Optim Pipeline|  |
|  +-------------------------------------------------------------------+  |
+-----------------------------------+-------------------------------------+
                                    |
+-----------------------------------v-------------------------------------+
|                         Data & Persistence Tier                         |
|  +-------------------------------------------------------------------+  |
|  | Prisma ORM (Relational Models, Cascade Migrations, Snapshots)     |  |
|  +-------------------------------------------------------------------+  |
|  | File Storage / Media System  | External APIs (Weather / Scraper)  |  |
+-------------------------------------------------------------------------+`}</pre>
          </div>

          <div className="prose prose-invert max-w-none text-neutral-300 space-y-8">
            <RichNarrative
              html={`<h3>Key Architectural Pillars</h3>

<h4>1. Interactive 3D Canvas &amp; Physics Simulation</h4>
<p><strong>Three.js &amp; React Three Fiber Engine:</strong> Built an interactive physics simulation displaying real-time responsive 3D floating geometries with collision detection and boundary constraints (<code>Heart3D.tsx</code>, <code>useHeartPhysics.ts</code>).</p>
<p><strong>Unified Input &amp; Reduced Motion:</strong> Handled pointer tracking and multi-touch interactions normalized across device viewports with fallback rendering paths for accessibility and users preferring reduced motion (<code>useReducedMotion.ts</code>, <code>useUnified3DInput.ts</code>).</p>

<h4>2. Custom Gift Registry with Scraper &amp; Concurrency Control</h4>
<p><strong>Universal Metadata Scraper:</strong> Implemented an automated registry product scraper leveraging OpenGraph and JSON-LD parsing to dynamically import product details, images, and prices from external URLs.</p>
<p><strong>Transactional Contributions &amp; Masking:</strong> Built atomic multi-contributor transaction management to prevent race conditions during simultaneous cash and item pledges, complete with donor identity masking for public-facing privacy.</p>

<h4>3. Administrative CMS, Drag-and-Drop Layouts &amp; Versioning</h4>
<p><strong>Dynamic Site Layout Engine:</strong> Empowered full administration over landing page sections, wedding party ordering, and local attractions with direct drag-and-drop interface ordering (<code>DragDropContainer.tsx</code>).</p>
<p><strong>Snapshot Versioning &amp; Rollback:</strong> Integrated automated schema and entity snapshot generation on mutation, enabling one-click audit logging and historical state rollbacks (<code>admin/versions/[id]/restore</code>).</p>

<h4>4. Security Hardening &amp; Resilient Infrastructure</h4>
<p><strong>SSRF Defense:</strong> Implemented strict URL and IP sanitation (<code>ssrf.ts</code>) prohibiting loopback, link-local, and private RFC 1918 address resolutions during web scraping.</p>
<p><strong>Rate Limiting &amp; Secure Authentication:</strong> Added token-bucket rate limiting (<code>rateLimit.ts</code>) alongside HTTP-only secure cookie authentication and role verification middleware.</p>`}
            />
          </div>
        </section>

        {/* Technical Highlights Table */}
        <section className="space-y-4 border-t border-zinc-900 pt-10">
          <h2 className="text-2xl font-bold font-sans text-neutral-100 flex items-center gap-2">
            <IconShieldCheck className="w-6 h-6 text-rose-400" />
            Technical Specifications &amp; Quality Metrics
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left text-sm font-sans">
              <thead className="bg-zinc-900 text-zinc-300 font-mono text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 border-b border-zinc-800">Dimension</th>
                  <th className="p-4 border-b border-zinc-800">Implementation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                <tr className="hover:bg-zinc-900/40 transition">
                  <td className="p-4 font-bold text-neutral-100">Frontend Framework</td>
                  <td className="p-4 font-mono text-xs text-rose-300">Next.js (App Router), React, Tailwind CSS, Lucide Icons</td>
                </tr>
                <tr className="hover:bg-zinc-900/40 transition">
                  <td className="p-4 font-bold text-neutral-100">Graphics &amp; Animation</td>
                  <td className="p-4 font-mono text-xs text-sky-300">Three.js, React Three Fiber, Custom Springs &amp; Physics Hooks</td>
                </tr>
                <tr className="hover:bg-zinc-900/40 transition">
                  <td className="p-4 font-bold text-neutral-100">Database &amp; Schema</td>
                  <td className="p-4 font-mono text-xs text-emerald-300">Prisma ORM, Migration Tracking, Relational Schema Management</td>
                </tr>
                <tr className="hover:bg-zinc-900/40 transition">
                  <td className="p-4 font-bold text-neutral-100">Security &amp; Middleware</td>
                  <td className="p-4 font-mono text-xs text-amber-300">SSRF SafeFetch, Rate Limiting, Audit Logging, HTTP-Only Session Cookies</td>
                </tr>
                <tr className="hover:bg-zinc-900/40 transition">
                  <td className="p-4 font-bold text-neutral-100">Quality &amp; Testing</td>
                  <td className="p-4 font-mono text-xs text-purple-300">Jest, Playwright E2E Crawlers, Axe-Core A11y Verification, Custom ESLint Rules</td>
                </tr>
                <tr className="hover:bg-zinc-900/40 transition">
                  <td className="p-4 font-bold text-neutral-100">DevOps &amp; CI/CD</td>
                  <td className="p-4 font-mono text-xs text-indigo-300">Multi-stage Docker containerization, GitHub Actions Workflows, OpenAPI Generation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Structured Feedback Section */}
        <section className="border-t border-zinc-900 pt-10">
          <CaseStudyFeedbackSection slug="wedding-website" />
        </section>

        {/* Next / Prev Navigation */}
        <NextPrevNav
          prev={{
            title: "iMednet Python SDK: Clinical Trial Data Integration Client",
            href: "/case-studies/imednet-python-sdk",
            label: "Previous Case Study",
            tag: "Python",
          }}
          next={{
            title: "SchemaFlow: Reactive Node Engine for Schema Composition",
            href: "/case-studies/schemaflow",
            label: "Next Case Study",
            tag: "TypeScript",
          }}
          backToHub={{
            title: "View All Case Studies",
            href: "/case-studies",
          }}
        />
      </div>
    </PageLayout>
  );
}
