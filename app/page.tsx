import { prisma } from "@/lib/db";
import { CaseStudyCard } from "@/components/ui/CaseStudyCard";
import { BaseCaseStudy } from "@/types/domain";
import { Hero } from "@/components/Hero";

export default async function WalkingSkeletonPage() {
  let caseStudies: BaseCaseStudy[] = [];
  let errorMsg = "";

  try {
    // Query case studies from Neon database via Prisma
    const data = await prisma.caseStudy.findMany({
      where: { published: true },
      orderBy: { created_at: "desc" },
      take: 3,
    });
    // Map dates to JS Date objects matching our interface
    caseStudies = data.map(d => ({
      ...d,
      created_at: new Date(d.created_at),
      updated_at: new Date(d.updated_at),
    }));
  } catch (err) {
    console.error("Database query exception:", err);
    errorMsg = err instanceof Error ? err.message : "Failed to establish a connection to the serverless database.";
  }

  return (
    <div className="bg-brand-dark min-h-screen text-foreground overflow-x-hidden flex flex-col">
      {/* Premium Staggered Living Grid Hero */}
      <Hero />

      {/* Database walking skeleton / Case studies grid */}
      <main id="case-studies" className="relative min-h-screen py-24 px-6 md:px-16 flex flex-col items-center border-t border-neutral-900/50 bg-neutral-950/20">
        {/* Decorative Blur Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-blue/5 blur-[150px] pointer-events-none" />

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
          {/* Title Block */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-blue to-neutral-200 tracking-tight text-center mb-4">
            Unified Engineering Showcase
          </h2>
          <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-12">
            Verifiable Serverless Postgres Architecture
          </p>

          {/* Database Status Alerts */}
          {errorMsg ? (
            <div className="w-full p-6 bg-red-950/20 border border-red-900/60 rounded-2xl mb-8">
              <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Database Connection Failed
              </h3>
              <p className="text-xs font-mono text-red-500 leading-relaxed break-words">
                {errorMsg}
              </p>
            </div>
          ) : (
            <div className="w-full p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl flex items-center mb-12">
              <span className="relative flex h-2 w-2 mr-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-mono text-emerald-400">
                Centralized serverless Neon Postgres instance successfully connected and active.
              </p>
            </div>
          )}

          {/* Feed Columns */}
          <div className="w-full space-y-6">
            {caseStudies.length === 0 ? (
              <div className="text-center p-12 bg-neutral-900/10 border border-neutral-900/60 border-dashed rounded-2xl">
                <p className="text-sm text-neutral-500 italic mb-2">
                  Connection established, but no published case studies were found in the database.
                </p>
                <p className="text-xs text-neutral-600 font-mono">
                  Initialize seeding pipeline via Issue #10 to import clinical trial narratives.
                </p>
              </div>
            ) : (
              caseStudies.map((study) => (
                <CaseStudyCard key={study.id} study={study} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
