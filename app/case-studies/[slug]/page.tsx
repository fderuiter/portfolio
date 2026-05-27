import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SandboxTerminal } from "@/components/SandboxTerminal";
import { IconTerminal } from "@tabler/icons-react";

interface PageProps {
  params: Promise<{ slug: string }>;
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
    throw new Error("Unable to fetch case study records from serverless Neon database.");
  }

  if (!study) {
    notFound();
  }

  // Split tags by comma for badge rendering
  const tagsList = study.tags ? study.tags.split(",").map(t => t.trim()) : [];

  return (
    <main className="min-h-screen py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-950 text-foreground flex flex-col items-center relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-80 h-80 rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
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
          <span className="text-xs font-mono text-muted">
            Node ID: {study.id}
          </span>
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

          {/* Technical Deep Dive Narrative */}
          <div
            className="mt-12 space-y-6 text-sm md:text-base leading-relaxed text-muted-strong border-t border-zinc-900/50 pt-10"
            dangerouslySetInnerHTML={{ __html: study.architectural_narrative }}
          />
        </article>
      </div>
    </main>
  );
}
