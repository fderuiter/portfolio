import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fderuiter-portfolio.vercel.app";

  // Fetch all published case studies to dynamically generate sitemap URLs
  let studies: { slug: string; updated_at: Date }[] = [];
  try {
    studies = await prisma.caseStudy.findMany({
      where: { published: true },
      select: { slug: true, updated_at: true }
    });
  } catch (err) {
    console.error("Sitemap generation database query failure:", err);
    const isProduction = process.env.VERCEL_ENV === "production";
    const isMockEnv = process.env.CI === "true" || process.env.PLAYWRIGHT_TEST === "true" || !isProduction;
    if (isMockEnv) {
      studies = [
        { slug: "schemaflow", updated_at: new Date() },
        { slug: "clinical-data-mapper", updated_at: new Date() },
      ];
    }
  }

  const caseStudyUrls = studies.map((study) => ({
    url: `${baseUrl}/case-studies/${study.slug}`,
    lastModified: study.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${baseUrl}/ui-sandbox`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3
    },
    ...caseStudyUrls
  ];
}
