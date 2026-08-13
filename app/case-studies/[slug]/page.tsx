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
          pitch: "Build a drag-and-drop reactive interface that generates complex, production-ready schemas dynamically with zero coding.",
          implementation_reality: "While the visual nodes worked beautifully, deep schema nesting caused recursive render loops. We had to introduce strict memoization and delegate the heavy AST compilation to Web Workers to maintain a 60fps UI.",
          lessons_learned: "Always isolate CPU-intensive operations (like schema validation/compilation) from the main thread. Web Workers are essential for high-performance visual graph editors.",
          graveyard: false,
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
          pitch: "A completely automated clinical trial data mapping pipeline that transforms raw EDC XML directly into regulatory-compliant CDISC SDTM datasets.",
          implementation_reality: "Clinical files are massive (often >2GB) and highly nested. In-memory XML parsing was a blocker. We had to rewrite the parser using SAX stream events and process tables in sqlite temporary files to keep RAM under 50MB.",
          lessons_learned: "DOM parsing is a non-starter for enterprise clinical payloads. Streaming, event-driven pipelines are the only reliable way to handle multi-gigabyte regulatory datasets under strict environment memory constraints.",
          graveyard: false,
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
          pitch: "Build a drag-and-drop reactive interface that generates complex, production-ready schemas dynamically with zero coding.",
          implementation_reality: "While the visual nodes worked beautifully, deep schema nesting caused recursive render loops. We had to introduce strict memoization and delegate the heavy AST compilation to Web Workers to maintain a 60fps UI.",
          lessons_learned: "Always isolate CPU-intensive operations (like schema validation/compilation) from the main thread. Web Workers are essential for high-performance visual graph editors.",
          graveyard: false,
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
          pitch: "A completely automated clinical trial data mapping pipeline that transforms raw EDC XML directly into regulatory-compliant CDISC SDTM datasets.",
          implementation_reality: "Clinical files are massive (often >2GB) and highly nested. In-memory XML parsing was a blocker. We had to rewrite the parser using SAX stream events and process tables in sqlite temporary files to keep RAM under 50MB.",
          lessons_learned: "DOM parsing is a non-starter for enterprise clinical payloads. Streaming, event-driven pipelines are the only reliable way to handle multi-gigabyte regulatory datasets under strict environment memory constraints.",
          graveyard: false,
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
          <div className="flex flex-wrap items-center gap-3 mb-10 border-b border-zinc-900 pb-8">
            <span className="px-3 py-1 text-xs font-mono font-bold bg-brand-cyan/5 border border-brand-cyan/20 text-brand-cyan rounded-md">
              {study.primary_language}
            </span>
            {study.graveyard && (
              <span className="px-3 py-1 text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-md animate-pulse">
                Retired Experiment
              </span>
            )}
            <span className="text-xs font-mono text-muted">
              Node ID: {study.id}
            </span>
          </div>

          {study.graveyard && (
            <div className="mb-10 p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200">
              <div className="flex items-center gap-2 mb-2 font-mono font-black text-amber-500 text-sm tracking-wide">
                <span>⚠️ PROJECT RETIRED (GRAVEYARD STATUS)</span>
              </div>
              <p className="text-sm text-amber-200/80 leading-relaxed font-sans">
                This initiative is retired. Below is a post-mortem detailing the technical constraints, outcomes, and crucial lessons learned during its lifecycle.
              </p>
            </div>
          )}

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

            {/* Self-Reflection Section */}
            {(study.pitch || study.implementation_reality || study.lessons_learned) && (
              <div className="mt-8 p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm space-y-6">
                <h3 className="text-lg font-bold font-sans text-neutral-100 flex items-center gap-2 border-b border-zinc-900 pb-3">
                  <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Project Self-Reflection
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {study.pitch && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold tracking-wider text-brand-cyan/80 uppercase">
                        The Original Pitch
                      </span>
                      <p className="text-sm text-neutral-300 leading-relaxed font-sans bg-brand-cyan/[0.02] border-l-2 border-brand-cyan/40 p-3 rounded-r-lg">
                        {study.pitch}
                      </p>
                    </div>
                  )}

                  {study.implementation_reality && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold tracking-wider text-brand-blue/80 uppercase">
                        Implementation Reality
                      </span>
                      <p className="text-sm text-neutral-300 leading-relaxed font-sans bg-brand-blue/[0.02] border-l-2 border-brand-blue/40 p-3 rounded-r-lg">
                        {study.implementation_reality}
                      </p>
                    </div>
                  )}
                </div>

                {study.lessons_learned && (
                  <div className="pt-4 border-t border-zinc-900/50 space-y-2">
                    <span className="text-xs font-mono font-bold tracking-wider text-amber-500/80 uppercase flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {study.graveyard ? "Post-Mortem: Key Lessons Learned" : "Key Lessons Learned"}
                    </span>
                    <p className="text-sm text-neutral-300 leading-relaxed font-sans bg-amber-500/[0.01] border-l-2 border-amber-500/40 p-3 rounded-r-lg">
                      {study.lessons_learned}
                    </p>
                  </div>
                )}
              </div>
            )}

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
