import type { MetadataRoute } from "next";
import { CaseStudyService } from "@/lib/services/case-study-service";
import { resolveBaseUrl } from "@/lib/domain";

export const revalidate = 86400;

export const STATIC_ROUTE_LAST_MODIFIED = new Date("2026-08-14T00:00:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolveBaseUrl();

  // Fetch all published case studies to dynamically generate sitemap URLs
  const studies = await CaseStudyService.getAllPublishedCaseStudies();

  const caseStudyUrls = studies.map((study) => ({
    url: `${baseUrl}/case-studies/${study.slug}`,
    lastModified: study.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arcade`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arcade/working-with-duck`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/laser-loon`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/quasi-puzzler`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/garmin-watch`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/clinical-chaos`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/retro-labyrinth`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arcade/meme-vault`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/proof`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/neuro`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/crf`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/simulator`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stack`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/schedule`,
      lastModified: STATIC_ROUTE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...caseStudyUrls,
  ];
}

