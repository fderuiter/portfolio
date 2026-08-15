import Link from "next/link";
import { prisma } from "@/lib/db";
import { CaseStudyShowcase } from "@/components/CaseStudyShowcase";
import { BaseCaseStudy } from "@/types/domain";
import { Hero } from "@/components/Hero";
import { getGitHubStats, parseGitHubUrl, GitHubStats, getSimulatedStats } from "@/lib/github";
import { TextReveal } from "@/components/TextReveal";
import { SkillsGrid } from "@/components/SkillsGrid";
import { Timeline } from "@/components/Timeline";
import { Tooltip } from "@/components/ui/Tooltip";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";

interface HydratedCaseStudy extends BaseCaseStudy {
  githubStats: GitHubStats | null;
}

export default async function PortfolioHomePage() {
  let caseStudies: HydratedCaseStudy[] = [];
  let errorMsg = "";

  try {
    // Query case studies from Neon database via Prisma
    const data = await prisma.caseStudy.findMany({
      where: { published: true },
      orderBy: { created_at: "desc" },
    });
    
    // Aggregated server-side hydration for each case study
    caseStudies = await Promise.all(
      data.map(async (d) => {
        let stats: GitHubStats | null = null;
        if (d.simulated_telemetry) {
          stats = getSimulatedStats(d.primary_language);
        } else if (d.github_url) {
          const parsed = parseGitHubUrl(d.github_url);
          if (parsed) {
            stats = await getGitHubStats(parsed.owner, parsed.repo);
          }
        }
        return {
          ...d,
          created_at: new Date(d.created_at),
          updated_at: new Date(d.updated_at),
          githubStats: stats,
        };
      })
    );
  } catch (err) {
    console.error("Database query exception:", err);
    errorMsg = err instanceof Error ? err.message : "Failed to establish a connection to the serverless database.";
    
    // Fallback for CI/Playwright/Preview or other non-production environments to ensure components can be visually tested and load properly when database is offline
    const isProduction = process.env.VERCEL_ENV === "production";
    if (process.env.CI === "true" || process.env.PLAYWRIGHT_TEST === "true" || !isProduction) {
      errorMsg = ""; // Clear error to render the showcase
      caseStudies = FALLBACK_CASE_STUDIES.map((study) => ({
        ...study,
        githubStats: getSimulatedStats(study.primary_language),
      }));
    }
  }

  // Aggregate language profiles from fetched case study stats
  const languagesMap: Record<string, number> = {};
  caseStudies.forEach((study) => {
    if (study.githubStats?.languages) {
      study.githubStats.languages.forEach((lang) => {
        languagesMap[lang.name] = (languagesMap[lang.name] || 0) + lang.percentage;
      });
    }
  });

  const totalLangWeights = Object.values(languagesMap).reduce((a, b) => a + b, 0);
  const aggregatedLanguages = Object.entries(languagesMap)
    .map(([name, weight]) => ({
      name,
      percentage: totalLangWeights > 0 ? Math.round((weight / totalLangWeights) * 100) : 0,
    }))
    .filter((l) => l.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const fallbackLanguages = [
    { name: "TypeScript", percentage: 45 },
    { name: "Python", percentage: 25 },
    { name: "React", percentage: 15 },
    { name: "Prisma", percentage: 10 },
    { name: "PostgreSQL", percentage: 5 }
  ];
  const languagesList = aggregatedLanguages.length > 0 ? aggregatedLanguages.slice(0, 5) : fallbackLanguages;

  return (
    <div className="bg-zinc-950 min-h-screen text-foreground overflow-x-hidden flex flex-col">
      {/* Premium Staggered Living Grid Hero */}
      <Hero />

      {/* Case studies showcase section */}
      <main id="main-content" tabIndex={-1} className="relative min-h-screen py-24 md:py-32 px-6 md:px-12 lg:px-24 flex flex-col items-center border-t border-zinc-900/60 bg-zinc-950 outline-none">
        <section id="case-studies" className="w-full flex flex-col items-center">
          {/* Decorative Blur Elements */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-blue/5 blur-[150px] pointer-events-none" />

          {/* Main Container */}
          <div className="relative z-10 w-full max-w-7xl flex flex-col items-center">
            {/* Title Block */}
            <h2 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-white text-center mb-2">
              Unified Systems &amp; Design Showcase
            </h2>
            <p className="text-xs font-mono text-zinc-400 tracking-widest uppercase mb-8">
              High-Compliance Clinical Architectures &amp; Interactive Web Craft
            </p>

            {/* Ambient Live System Status Chip */}
            {errorMsg ? (
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono mb-10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Telemetry Degraded: Database Offline</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-emerald-400 text-xs font-mono mb-10 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Operational · Serverless Neon Postgres Active</span>
              </div>
            )}

            {/* Personal Highlights Section */}
            <div className="w-full mb-12 p-6 sm:p-8 tool-shell relative overflow-hidden group hover:border-brand-cyan/40 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-brand-cyan/10 transition-colors" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-mono text-white mb-2 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-brand-cyan"></span>
                    Interactive Physics &amp; UI Experiments
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl font-sans">
                    Beyond standard systems engineering, explore playable canvas arcade games, real-time laser raycasting physics, 32KB embedded simulators, and formal logic tactic puzzles.
                  </p>
                </div>
                <a
                  href="/arcade"
                  className="self-start sm:self-center shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-brand-cyan text-black font-mono text-xs font-bold rounded-xl hover:bg-white transition-all shadow-sm"
                >
                  <span>Enter Arcade Hub</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Dynamic Bento Showcase */}
            {caseStudies.length === 0 ? (
              <div className="text-center p-12 bg-zinc-900/10 border border-zinc-900/40 border-dashed rounded-2xl w-full">
                <p className="text-sm text-zinc-400 italic mb-2">
                  Connection established, but no published case studies were found in the database.
                </p>
                <p className="text-xs text-zinc-400 font-mono">
                  Initialize seeding pipeline via Issue #10 to import clinical trial narratives.
                </p>
              </div>
            ) : (
              <CaseStudyShowcase caseStudies={caseStudies} />
            )}
          </div>
        </section>
      </main>

      {/* 2. Philosophy TextReveal Highlight */}
      <div className="bg-zinc-950 border-t border-zinc-900/50">
        <TextReveal>I engineer high-craft digital experiences and resilient data systems, bridging clinical data rigor with creative UI physics, bespoke web applications, and meaningful civic impact.</TextReveal>
      </div>

      {/* 3. About Section */}
      <section id="about" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24 flex flex-col items-center border-t border-zinc-900/50 bg-zinc-950/40 overflow-hidden">
        {/* Decorative Blurs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold font-mono text-white tracking-tight text-center mb-2">
            Creative Developer &amp; Systems Architect
          </h2>
          <p className="text-xs font-mono text-zinc-400 tracking-widest uppercase mb-16 text-center">
            Bridging Healthcare Data Rigor, UI Physics, and Civic Leadership
          </p>
          
          {/* Dynamic Bento Skills Grid Card Layout */}
          <div className="w-full mb-24">
            <SkillsGrid languages={languagesList} />
          </div>

          <h3 className="text-2xl font-extrabold font-mono text-white tracking-tight text-center mb-2">
            Professional Experience &amp; Operational Journey
          </h3>
          <p className="text-xs font-mono text-zinc-400 tracking-widest uppercase mb-16 text-center">
            A Chronological Evolution of{" "}
            <Tooltip text="Ensuring reliability for users so the platform never goes down when they need it most.">
              Systems Rigor &amp; Real-World Impact
            </Tooltip>
          </p>

          {/* Interactive Staggered Timeline Component */}
          <div className="w-full">
            <Timeline />
          </div>
        </div>
      </section>

      {/* 4. Contact Section */}
      <section id="contact" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24 flex flex-col items-center border-t border-zinc-900/50 bg-zinc-950">
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-extrabold font-mono text-white tracking-tight text-center mb-2">
            Get In Touch
          </h2>
          <p className="text-xs font-mono text-zinc-400 tracking-widest uppercase mb-16 text-center">
            Let&apos;s Collaborate on Systems &amp; Design Engineering Projects
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl justify-center items-stretch">
            {/* Direct Email */}
            <a
              href="mailto:fpderuiter@gmail.com"
              aria-label="Send an email to Frederick de Ruiter at fpderuiter@gmail.com"
              className="group flex flex-col items-center justify-center p-6 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl transition-all duration-300 hover:border-brand-cyan/40 hover:bg-zinc-900/40 text-center cursor-pointer"
            >
              <span className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-zinc-400 group-hover:text-brand-cyan group-hover:border-brand-cyan/30 transition-colors mb-3">
                ✉
              </span>
              <span className="text-xs font-mono font-bold text-neutral-200 mb-1">Direct Email</span>
              <span className="text-xs font-mono text-zinc-400">fpderuiter@gmail.com</span>
            </a>

            {/* Schedule 1:1 */}
            <Link
              href="/schedule"
              aria-label="Schedule a 1:1 meeting with Frederick de Ruiter on Google Calendar"
              className="group flex flex-col items-center justify-center p-6 bg-brand-cyan/[0.04] border border-brand-cyan/30 rounded-2xl transition-all duration-300 hover:border-brand-cyan hover:bg-brand-cyan/[0.09] hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] text-center cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-brand-cyan/20 border border-brand-cyan/40 rounded text-[9px] font-mono text-brand-cyan uppercase tracking-wider">
                Book
              </div>
              <span className="w-9 h-9 rounded-xl bg-zinc-950 border border-brand-cyan/40 flex items-center justify-center font-mono text-brand-cyan group-hover:scale-110 transition-transform mb-3">
                📅
              </span>
              <span className="text-xs font-mono font-bold text-white mb-1">Schedule 1:1</span>
              <span className="text-xs font-mono text-brand-cyan">Google Calendar ↗</span>
            </Link>
            
            {/* GitHub Portal */}
            <a
              href="https://github.com/fderuiter"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Frederick de Ruiter's GitHub profile externally"
              className="group flex flex-col items-center justify-center p-6 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl transition-all duration-300 hover:border-brand-cyan/40 hover:bg-zinc-900/40 text-center cursor-pointer"
            >
              <span className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-zinc-400 group-hover:text-brand-cyan group-hover:border-brand-cyan/30 transition-colors mb-3">
                🐙
              </span>
              <span className="text-xs font-mono font-bold text-neutral-200 mb-1">GitHub Repos</span>
              <span className="text-xs font-mono text-zinc-400">github.com/fderuiter</span>
            </a>

            {/* LinkedIn Connection */}
            <a
              href="https://www.linkedin.com/in/frederick-de-ruiter-88012467/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Frederick de Ruiter's LinkedIn profile externally"
              className="group flex flex-col items-center justify-center p-6 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl transition-all duration-300 hover:border-brand-cyan/40 hover:bg-zinc-900/40 text-center cursor-pointer"
            >
              <span className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-zinc-400 group-hover:text-brand-cyan group-hover:border-brand-cyan/30 transition-colors mb-3">
                in
              </span>
              <span className="text-xs font-mono font-bold text-neutral-200 mb-1">LinkedIn Network</span>
              <span className="text-xs font-mono text-zinc-400">Connect on LinkedIn ↗</span>
            </a>
          </div>
          
          <div className="mt-24 text-xs font-mono text-zinc-500 tracking-[0.2em] text-center select-none">
            DESIGNED &amp; DEVELOPED BY FREDERICK DE RUITER
          </div>
        </div>
      </section>
    </div>
  );
}
