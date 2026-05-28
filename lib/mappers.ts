import { BaseCaseStudy } from "@/types/domain";
import { GitHubStats } from "@/lib/github";
import { CaseStudy } from "@/app/generated/prisma/client";

/**
 * Centralized mapping utility to convert a raw persistence object (from database)
 * into a standardized BaseCaseStudy domain entity.
 * Handles parsing, date normalization, and external stats hydration.
 */
export function mapToCaseStudy(raw: CaseStudy, stats: GitHubStats | null = null): BaseCaseStudy {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    primary_language: raw.primary_language,
    github_url: raw.github_url ?? null,
    editorial_content: raw.editorial_content,
    architectural_narrative: raw.architectural_narrative,
    published: Boolean(raw.published),
    tags: typeof raw.tags === "string" && raw.tags 
      ? raw.tags.split(",").map((t: string) => t.trim()) 
      : [],
    created_at: raw.created_at instanceof Date 
      ? raw.created_at.toISOString() 
      : String(raw.created_at),
    updated_at: raw.updated_at instanceof Date 
      ? raw.updated_at.toISOString() 
      : String(raw.updated_at),
    githubStats: stats,
  };
}