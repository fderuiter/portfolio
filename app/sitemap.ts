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
        { slug: "clinical-data-mapper", updated_at: new Date() },
        { slug: "cadence-clinical", updated_at: new Date() },
        { slug: "imednet-python-sdk", updated_at: new Date() },
        { slug: "wedding-website", updated_at: new Date() },
        { slug: "schemaflow", updated_at: new Date() },
      ];
    }
  }

  const caseStudyUrls = studies.map((study) => ({
    url: `${baseUrl}/case-studies/${study.slug}`,
    lastModified: study.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/arcade`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arcade/working-with-duck`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/laser-loon`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/quasi-puzzler`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/garmin-watch`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/clinical-chaos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/retro-labyrinth`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/proof`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/simulator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/schedule`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...caseStudyUrls,
  ];
}
