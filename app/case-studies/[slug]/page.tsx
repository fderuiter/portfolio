import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SandboxTerminal } from "@/components/SandboxTerminal";
import { IconTerminal } from "@tabler/icons-react";
import { TracingBeam } from "@/components/ui/TracingBeam";
import { RichNarrative } from "@/components/RichNarrative";
import { Tooltip } from "@/components/ui/Tooltip";
import { getGitHubStats, parseGitHubUrl, getSimulatedStats } from "@/lib/github";
import { getSoftwareSourceCodeSchema } from "@/lib/seo";
import { TelemetryTracker } from "@/components/TelemetryTracker";
import { TerminologyToggle } from "@/components/TerminologyToggle";
import SchemaFlowWorkspaceWrapper from "@/components/SchemaFlowWorkspaceWrapper";

import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const studies = await prisma.caseStudy.findMany({
      where: { published: true },
      select: { slug: true },
    });
    
    return studies.map((study) => ({
      slug: study.slug,
    }));
  } catch (error) {
    console.error("Failed to fetch case studies for static params:", error);
    const isProduction = process.env.VERCEL_ENV === "production";
    const isMockEnv = process.env.CI === "true" || process.env.PLAYWRIGHT_TEST === "true" || !isProduction;
    if (isMockEnv) {
      return [{ slug: "schemaflow" }, { slug: "clinical-data-mapper" }];
    }
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  let study;
  try {
    study = await prisma.caseStudy.findUnique({
      where: { slug },
    });
  } catch (err) {
    console.error("Metadata generation DB query exception:", err);
    const isProduction = process.env.VERCEL_ENV === "production";
    const isMockEnv = process.env.CI === "true" || process.env.PLAYWRIGHT_TEST === "true" || !isProduction;
    if (isMockEnv) {
      const mockStudies = [
        {
          id: "mock-1",
          slug: "schemaflow",
          title: "SchemaFlow: Reactive Node Engine",
          primary_language: "TypeScript",
          github_url: "https://github.com/fderuiter/SchemaFlow",
          published: true,
          simulated_telemetry: false,
          tags: "TypeScript, React, Flow",
          editorial_content: "A reactive, visual graph editor built in TypeScript.",
          architectural_narrative: "<p>Mock architectural narrative for SchemaFlow.</p>",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "mock-2",
          slug: "clinical-data-mapper",
          title: "Clinical Data Standards Engine",
          primary_language: "Python",
          github_url: "https://github.com/fderuiter/clinical-data-mapper",
          published: true,
          simulated_telemetry: false,
          tags: "Python, SDTM, Pipeline",
          editorial_content: "An enterprise-grade mapping pipeline.",
          architectural_narrative: "<p>Mock architectural narrative for Clinical Data Standards Engine.</p>",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "mock-3",
          slug: "aura-haskell",
          title: "Aura: Language-Tailored Haskell Type Flow Analyzer",
          primary_language: "Haskell",
          github_url: "https://github.com/fderuiter/aura-haskell",
          published: true,
          simulated_telemetry: true,
          tags: "Haskell, GHC, Compiler, AST, Static Analysis",
          editorial_content: "An advanced Haskell static analyzer and type inference engine.",
          architectural_narrative: "<h3>The Challenge</h3><p>Haskell codebases are robust, but tracing complex monadic types or locating space leaks can be incredibly slow and taxing.</p>",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      study = mockStudies.find((s) => s.slug === slug);
    }
  }

  if (!study) {
    return {
      title: "Not Found",
      description: "The requested case study was not found.",
    };
  }

  // Strip Markdown tokens from editorial content for plain text meta descriptions
  const cleanDescription = study.editorial_content
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\*/g, "")
    .slice(0, 160);

  return {
    title: study.title,
    description: cleanDescription,
    alternates: {
      canonical: `/case-studies/${slug}`,
    },
    openGraph: {
      title: `${study.title} | Case Study`,
      description: cleanDescription,
      type: "article",
      url: `https://fderuiter-portfolio.vercel.app/case-studies/${slug}`,
      publishedTime: study.created_at.toISOString(),
      modifiedTime: study.updated_at.toISOString(),
      tags: study.tags.split(",").map((t) => t.trim()),
    },
    twitter: {
      card: "summary_large_image",
      title: `${study.title} | Case Study`,
      description: cleanDescription,
      creator: "@laser_loon",
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;

  let study;
  try {
    study = await prisma.caseStudy.findUnique({
      where: { slug },
    });
  } catch (err) {
    console.error("Case study fetch exception:", err);
    const isProduction = process.env.VERCEL_ENV === "production";
    const isMockEnv = process.env.CI === "true" || process.env.PLAYWRIGHT_TEST === "true" || !isProduction;
    if (isMockEnv) {
      const mockStudies = [
        {
          id: "mock-1",
          slug: "schemaflow",
          title: "SchemaFlow: Reactive Node Engine",
          primary_language: "TypeScript",
          github_url: "https://github.com/fderuiter/SchemaFlow",
          published: true,
          simulated_telemetry: false,
          tags: "TypeScript, React, Flow",
          editorial_content: "A reactive, visual graph editor built in TypeScript.",
          architectural_narrative: "<p>Mock architectural narrative for SchemaFlow.</p>",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "mock-2",
          slug: "clinical-data-mapper",
          title: "Clinical Data Standards Engine",
          primary_language: "Python",
          github_url: "https://github.com/fderuiter/clinical-data-mapper",
          published: true,
          simulated_telemetry: false,
          tags: "Python, SDTM, Pipeline",
          editorial_content: "An enterprise-grade mapping pipeline.",
          architectural_narrative: "<p>Mock architectural narrative for Clinical Data Standards Engine.</p>",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "mock-3",
          slug: "aura-haskell",
          title: "Aura: Language-Tailored Haskell Type Flow Analyzer",
          primary_language: "Haskell",
          github_url: "https://github.com/fderuiter/aura-haskell",
          published: true,
          simulated_telemetry: true,
          tags: "Haskell, GHC, Compiler, AST, Static Analysis",
          editorial_content: "An advanced Haskell static analyzer and type inference engine.",
          architectural_narrative: "<h3>The Challenge</h3><p>Haskell codebases are robust, but tracing complex monadic types or locating space leaks can be incredibly slow and taxing.</p>",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      study = mockStudies.find((s) => s.slug === slug);
    }
    if (!study) {
      throw new Error("Unable to fetch case study records from serverless Neon database.");
    }
  }

  if (!study) {
    notFound();
  }

  // Fetch dynamic GitHub cached statistics to hydrate the JSON-LD schemas
  let stats = null;
  if (study.simulated_telemetry) {
    stats = getSimulatedStats(study.primary_language);
  } else if (study.github_url) {
    const parsed = parseGitHubUrl(study.github_url);
    if (parsed) {
      stats = await getGitHubStats(parsed.owner, parsed.repo);
    }
  }

  // Split tags by comma for badge rendering
  const tagsList = study.tags ? study.tags.split(",").map(t => t.trim()) : [];

  return (
    <main className="min-h-screen py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-950 text-foreground flex flex-col items-center relative overflow-hidden">
      <TelemetryTracker slug={slug} />
      {/* Dynamic JSON-LD SoftwareSourceCode Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getSoftwareSourceCodeSchema(study, stats),
        }}
      />
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-80 h-80 rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        <TracingBeam>
          {/* Back Link */}
          <Link
            href="/"
            className="text-xs font-mono font-bold text-brand-cyan hover:text-brand-cyan/80 transition-colors mb-10 inline-flex items-center gap-2 cursor-pointer group"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Core Feed
          </Link>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-100 mb-4 leading-tight">
            {study.title}
          </h1>

          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-10 border-b border-zinc-900 pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 text-xs font-mono font-bold bg-brand-cyan/5 border border-brand-cyan/20 text-brand-cyan rounded-md">
                {study.primary_language}
              </span>
              <span className="text-xs font-mono text-muted">
                Node ID: {study.id}
              </span>
            </div>
            <TerminologyToggle />
          </div>

          {/* Long-form Article Narrative */}
          <article className="prose prose-invert max-w-none text-neutral-300 leading-relaxed space-y-8">
            {/* Editorial Content Highlight block */}
            <div className="text-lg text-muted-strong font-medium border-l-2 border-brand-cyan/60 pl-6 py-2 italic bg-zinc-900/10 rounded-r-xl">
              {study.editorial_content}
            </div>

            {/* Tags list row */}
            <div className="flex flex-wrap gap-2 pt-4">
              {tagsList.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-xs font-mono font-medium bg-zinc-900/60 border border-zinc-800/80 text-muted-strong rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Interactive Sandbox Terminal Shell (Issue #42) */}
            {slug === "imednet-python-sdk" && (
              <div className="mt-12 border-t border-zinc-900/50 pt-10">
                <h2 className="text-xl font-bold font-sans text-neutral-100 mb-3 flex items-center gap-2">
                  <IconTerminal className="w-5 h-5 text-brand-cyan" />
                  Interactive CLI Developer Sandbox
                </h2>
                <p className="text-xs font-mono text-zinc-500 mb-6 leading-relaxed">
                  Test clinical trial EDC operations and view structured telemetry outputs directly inside the browser. Use the interactive badges or type &apos;help&apos; inside the prompt.
                </p>
                <SandboxTerminal />
              </div>
            )}

            {/* Interactive Proof Tactic Canvas & Telemetry Gauge */}
            {slug === "schemaflow" && (
              <div className="mt-12 border-t border-zinc-900/50 pt-10">
                <h2 className="text-xl font-bold font-sans text-neutral-100 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Interactive Mathematical Proof Tree & Telemetry
                </h2>
                <p className="text-xs font-mono text-zinc-500 mb-6 leading-relaxed">
                  Apply logical tactics to branch and navigate the mathematical proof tree. Click nodes to connect/disconnect, track real-time telemetry, and run/rollback proof states.
                </p>
                <SchemaFlowWorkspaceWrapper />
              </div>
            )}

            {/* Technical Deep Dive Narrative */}
            <div className="mt-12 border-t border-zinc-900/50 pt-10">
              <h2 className="text-xl font-bold font-sans text-neutral-100 mb-3">
                <Tooltip text="The human story behind the code—why this was built and who it helps.">
                  Architectural Narratives
                </Tooltip>
              </h2>
              <RichNarrative
                html={study.architectural_narrative}
                className="space-y-6 text-sm md:text-base leading-relaxed text-muted-strong"
              />
            </div>
          </article>
        </TracingBeam>
      </div>
    </main>
  );
}
