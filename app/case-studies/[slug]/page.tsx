import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

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

  return (
    <main className="min-h-screen py-24 px-6 md:px-16 bg-brand-dark text-foreground flex flex-col items-center">
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        <Link
          href="/"
          className="text-xs font-mono font-bold text-brand-cyan hover:text-brand-cyan/80 transition-colors mb-8 inline-flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Core Feed
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-100 mb-2">
          {study.title}
        </h1>

        <div className="flex items-center gap-3 mb-8">
          <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-brand-blue rounded-md">
            {study.primary_language}
          </span>
          <span className="text-xs font-mono text-neutral-500">
            Node ID: {study.id}
          </span>
        </div>

        <article className="prose prose-invert max-w-none text-neutral-300 leading-relaxed space-y-6">
          <p className="text-lg text-neutral-400 font-medium border-l-2 border-brand-cyan/40 pl-4 py-1 italic">
            {study.editorial_content}
          </p>
          <div
            className="mt-8 space-y-4"
            dangerouslySetInnerHTML={{ __html: study.architectural_narrative }}
          />
        </article>
      </div>
    </main>
  );
}
