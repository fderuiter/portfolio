import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CaseStudyShowcase } from "@/components/CaseStudyShowcase";
import { BaseCaseStudy } from "@/types/domain";
import { getGitHubStats, parseGitHubUrl, GitHubStats, getSimulatedStats } from "@/lib/github";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageLayout } from "@/components/PageLayout";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Engineering Case Studies | Frederick de Ruiter",
  description: "Deep-dive architectural breakdowns, clinical data systems, CDISC standards pipelines, and full-stack systems engineering.",
  alternates: {
    canonical: "/case-studies",
  },
  openGraph: {
    title: "Engineering Case Studies | Frederick de Ruiter",
    description: "Deep-dive architectural breakdowns, clinical data systems, CDISC standards pipelines, and full-stack systems engineering.",
    type: "website",
    url: "https://fderuiter-portfolio.vercel.app/case-studies",
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Case Studies | Frederick de Ruiter",
    description: "Deep-dive architectural breakdowns, clinical data systems, and full-stack engineering.",
  },
};

interface HydratedCaseStudy extends BaseCaseStudy {
  githubStats: GitHubStats | null;
}

export default async function CaseStudiesPage() {
  let caseStudies: HydratedCaseStudy[] = [];

  try {
    const data = await prisma.caseStudy.findMany({
      where: { published: true },
      orderBy: { created_at: "desc" },
    });

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
  } catch (error) {
    console.warn("Failed to load case studies from database. Falling back to local data:", error);
    caseStudies = FALLBACK_CASE_STUDIES.map((cs) => ({
      ...cs,
      githubStats: getSimulatedStats(cs.primary_language),
    }));
  }

  return (
    <PageLayout
      variant="standard"
      className="relative bg-zinc-950 text-foreground outline-none"
    >
      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-60 left-1/3 w-80 h-80 rounded-full bg-brand-blue/5 blur-[160px] pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Navigation Breadcrumb */}
        <div className="w-full mb-6 sm:mb-8 flex justify-start">
          <Breadcrumbs items={[{ label: "Case Studies" }]} />
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-mono tracking-tight text-white mb-3">
            Engineering Case Studies
          </h1>
          <p className="text-xs sm:text-sm font-mono text-zinc-400 tracking-wider uppercase">
            Clinical data engines, CDISC validation pipelines, and full-stack systems
          </p>
        </div>

        {/* Dynamic Bento Showcase */}
        {caseStudies.length === 0 ? (
          <div className="text-center p-8 sm:p-12 bg-zinc-900/10 border border-zinc-900/40 border-dashed rounded-2xl w-full">
            <p className="text-sm text-zinc-400 italic mb-2">
              No published case studies currently available in the active environment.
            </p>
            <p className="text-xs text-zinc-500 font-mono">
              Refer to canonical project specifications in the repository documentation.
            </p>
          </div>
        ) : (
          <CaseStudyShowcase caseStudies={caseStudies} />
        )}
      </div>
    </PageLayout>
  );
}
