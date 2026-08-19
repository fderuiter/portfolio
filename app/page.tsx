import Link from "next/link";
import { CaseStudyService } from "@/lib/services/case-study-service";
import { ProjectTeaserGrid } from "@/components/ProjectTeaserGrid";
import { BaseCaseStudy } from "@/types/domain";
import { Hero } from "@/components/Hero";
import { getGitHubStats, parseGitHubUrl, GitHubStats, getSimulatedStats } from "@/lib/github";
import { TextReveal } from "@/components/TextReveal";
import dynamic from "next/dynamic";
import { DeferredHydration, SkillsGridSkeleton, TimelineSkeleton } from "@/components/DeferredHydration";
import { ContactForm } from "@/components/ContactForm";

const DynamicSkillsGrid = dynamic(
  () => import("@/components/SkillsGrid").then((mod) => mod.SkillsGrid),
  { ssr: true }
);

const DynamicTimeline = dynamic(
  () => import("@/components/Timeline").then((mod) => mod.Timeline),
  { ssr: true }
);
import { InteractiveHighlights } from "@/components/InteractiveHighlights";
import { PageLayout } from "@/components/PageLayout";
import { 
  IconMail, 
  IconCalendar, 
  IconBrandGithub, 
  IconBrandLinkedin
} from "@tabler/icons-react";

export const revalidate = 3600;

interface HydratedCaseStudy extends BaseCaseStudy {
  githubStats: GitHubStats | null;
}

export default async function PortfolioHomePage() {
  const data = await CaseStudyService.getAllPublishedCaseStudies();
  
  // Aggregated server-side hydration for each case study
  const caseStudies: HydratedCaseStudy[] = await Promise.all(
    data.map(async (d) => {
      let stats: GitHubStats | null = null;
      if (d.simulated_telemetry) {
        stats = getSimulatedStats(d.primary_language);
      } else if (d.github_url) {
        const parsed = parseGitHubUrl(d.github_url);
        if (parsed) {
          stats = await getGitHubStats(parsed.owner, parsed.repo, d.primary_language);
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
    { name: "TypeScript", percentage: 55 },
    { name: "Python", percentage: 25 },
    { name: "Rust", percentage: 15 },
    { name: "PostgreSQL", percentage: 5 }
  ];
  const languagesList = aggregatedLanguages.length > 0 ? aggregatedLanguages.slice(0, 5) : fallbackLanguages;

  return (
    <PageLayout variant="full" className="bg-[#0d0e11]">
      {/* Interactive Live Engineering Console Hero */}
      <Hero />

      {/* 1. Architectural Systems Dossiers */}
      <div className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col items-center border-t border-white/10 bg-[#0d0e11] outline-none">
        <section id="case-studies" className="w-full flex flex-col items-center">
          {/* Main Container */}
          <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
            {/* Section Index Marker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/[0.04] border border-white/10 text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
              <span>SECTION 01 // SELECTED PROJECTS</span>
            </div>

            {/* Title Block */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white text-center mb-2 heading-editorial">
              Interactive Systems &amp; Real-World Tools
            </h2>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 mb-8 sm:mb-12 text-center max-w-xl">
              From medical trial platforms and deductive logic assistants to 60FPS canvas games and smartwatch emulators.
            </p>

            {/* Interactive Systems Highlights Section */}
            <InteractiveHighlights />

            {/* Streamlined Lightweight Project Teaser */}
            {caseStudies.length === 0 ? (
              <div className="text-center p-8 sm:p-12 bg-white/[0.02] border border-white/10 border-dashed rounded-2xl w-full">
                <p className="text-sm text-zinc-400 italic mb-2">
                  No published case studies currently available in the active environment.
                </p>
                <p className="text-xs text-zinc-400 font-mono">
                  Refer to canonical project specifications in the repository documentation.
                </p>
              </div>
            ) : (
              <ProjectTeaserGrid caseStudies={caseStudies} />
            )}
          </div>
        </section>
      </div>

      {/* 2. Philosophy TextReveal Highlight */}
      <div className="bg-[#0d0e11] border-t border-white/10">
        <TextReveal>I like taking complicated, scary-sounding systems and turning them into clean code and software that is actually fun to use.</TextReveal>
      </div>

      {/* 3. About & Architecture Foundations Section */}
      <section id="about" className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col items-center border-t border-white/10 bg-[#101217] overflow-hidden">
        <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/[0.04] border border-white/10 text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
            <span>SECTION 02 // TOOLKIT &amp; DOMAINS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white text-center mb-2 heading-editorial">
            The Problem-Solving Toolkit
          </h2>
          <p className="text-xs sm:text-sm font-mono text-zinc-400 mb-8 sm:mb-12 text-center max-w-md">
            Mayo Clinic clinical operations, low-level canvas graphics, civic open-source projects, and emergency triage.
          </p>
          
          {/* Dynamic Bento Skills Grid Card Layout */}
          <div className="w-full mb-12 sm:mb-16">
            <DeferredHydration fallback={<SkillsGridSkeleton />}>
              <DynamicSkillsGrid languages={languagesList} />
            </DeferredHydration>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/[0.04] border border-white/10 text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
            <span>SECTION 03 // ORIGIN STORY</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white text-center mb-2 heading-editorial">
            Career Trajectory &amp; Track Record
          </h3>
          <p className="text-xs sm:text-sm font-mono text-zinc-400 mb-8 sm:mb-12 text-center max-w-md">
            From Minnesota Vikings NFL camp logistics and Mankato campus advocacy to Mayo Clinic operations and modern web systems.
          </p>

          {/* Interactive Staggered Timeline Component */}
          <div className="w-full">
            <DeferredHydration fallback={<TimelineSkeleton />}>
              <DynamicTimeline />
            </DeferredHydration>
          </div>
        </div>
      </section>

      {/* 4. Contact Section */}
      <section id="contact" className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col items-center border-t border-white/10 bg-[#0d0e11]">
        <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/[0.04] border border-white/10 text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
            <span>SECTION 04 // SAY HELLO</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white text-center mb-2 heading-editorial">
            Let&#39;s Build Something Great
          </h2>
          <p className="text-xs sm:text-sm font-mono text-zinc-400 mb-8 sm:mb-12 text-center max-w-md">
            Whether it&#39;s a fast web app, a complex technical challenge, or just geeking out over interactive physics—drop me a line.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-6xl justify-center items-stretch">
            {/* Direct Email */}
            <a
              href="mailto:fpderuiter@gmail.com"
              aria-label="Send an email to Frederick de Ruiter at fpderuiter@gmail.com"
              className="group flex flex-col items-center justify-center p-5 sm:p-6 bg-[#13151a]/80 border border-white/10 rounded-2xl transition-all duration-200 hover:border-amber-500/40 hover:bg-[#181b22] active:scale-[0.98] text-center cursor-pointer min-h-[110px] shadow-lg"
            >
              <span className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors mb-3 shrink-0">
                <IconMail className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold text-zinc-200 mb-1">Direct Email</span>
              <span className="text-xs font-mono text-zinc-400">fpderuiter@gmail.com</span>
            </a>

            {/* Schedule 1:1 */}
            <Link
              href="/schedule"
              aria-label="Schedule a 1:1 meeting with Frederick de Ruiter on Google Calendar"
              className="group flex flex-col items-center justify-center p-5 sm:p-6 bg-amber-500/5 border border-amber-500/30 rounded-2xl transition-all duration-200 hover:border-amber-400 hover:bg-amber-500/10 active:scale-[0.98] text-center cursor-pointer relative overflow-hidden min-h-[110px] shadow-lg"
            >
              <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-[9px] font-mono text-amber-300 uppercase tracking-wider">
                30 Min
              </div>
              <span className="w-10 h-10 rounded-xl bg-black/50 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mb-3 shrink-0">
                <IconCalendar className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold text-white mb-1">Quick 30-Min Chat</span>
              <span className="text-xs font-mono text-amber-300">Book on Calendar ↗</span>
            </Link>
            
            {/* GitHub Portal */}
            <a
              href="https://github.com/fderuiter"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Frederick de Ruiter's GitHub profile externally"
              className="group flex flex-col items-center justify-center p-5 sm:p-6 bg-[#13151a]/80 border border-white/10 rounded-2xl transition-all duration-200 hover:border-amber-500/40 hover:bg-[#181b22] active:scale-[0.98] text-center cursor-pointer min-h-[110px] shadow-lg"
            >
              <span className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors mb-3 shrink-0">
                <IconBrandGithub className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold text-zinc-200 mb-1">Open Source Code</span>
              <span className="text-xs font-mono text-zinc-400">github.com/fderuiter</span>
            </a>

            {/* LinkedIn Connection */}
            <a
              href="https://www.linkedin.com/in/frederick-de-ruiter-88012467/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Frederick de Ruiter's LinkedIn profile externally"
              className="group flex flex-col items-center justify-center p-5 sm:p-6 bg-[#13151a]/80 border border-white/10 rounded-2xl transition-all duration-200 hover:border-amber-500/40 hover:bg-[#181b22] active:scale-[0.98] text-center cursor-pointer min-h-[110px] shadow-lg"
            >
              <span className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors mb-3 shrink-0">
                <IconBrandLinkedin className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold text-zinc-200 mb-1">LinkedIn Network</span>
              <span className="text-xs font-mono text-zinc-400">Connect on LinkedIn ↗</span>
            </a>
          </div>

          {/* Integrated Direct Contact Inquiry Form */}
          <div className="w-full max-w-3xl mt-12">
            <div className="text-center mb-6">
              <h3 className="text-lg sm:text-xl font-mono font-bold text-white mb-1.5">
                Send a Direct Message
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                Delivered instantly to my inbox via encrypted transactional relay.
              </p>
            </div>
            <ContactForm />
          </div>
          
          <div className="mt-12 sm:mt-16 text-xs font-mono text-zinc-500 tracking-[0.2em] text-center select-none">
            CRAFTED &amp; DEVELOPED BY FREDERICK DE RUITER
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
