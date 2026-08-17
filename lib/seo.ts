import { BaseCaseStudy } from "@/types/domain";
import { GitHubStats } from "@/lib/github";
import { env } from "@/lib/env";

export const SITE_BASE_URL = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

/**
 * Returns the canonical Person schema representing Frederick de Ruiter.
 * Securely escapes angle brackets to neutralize potential XSS script injections.
 */
export function getPersonSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Frederick de Ruiter",
    "url": SITE_BASE_URL,
    "image": `${SITE_BASE_URL}/favicon.ico`,
    "jobTitle": "Principal Systems Engineer & Designer",
    "email": "fpderuiter@gmail.com",
    "sameAs": [
      "https://github.com/fderuiter",
      "https://www.linkedin.com/in/frederick-de-ruiter-88012467/"
    ]
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/**
 * Returns the root WebSite schema.
 */
export function getWebsiteSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Frederick de Ruiter Portfolio",
    "url": SITE_BASE_URL,
    "description": "High-performance systems engineering showcase, canvas physics engines, and CDISC data engines by Frederick de Ruiter.",
    "author": {
      "@type": "Person",
      "name": "Frederick de Ruiter"
    }
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export interface WebApplicationSchemaOptions {
  name: string;
  description: string;
  url: string;
  applicationCategory: "GameApplication" | "DeveloperApplication" | "EducationalApplication" | "MultimediaApplication";
  operatingSystem?: string;
  genre?: string;
  browserRequirements?: string;
}

/**
 * Returns a specialized WebApplication schema for interactive games, proof tools, and simulators.
 */
export function getWebApplicationSchema(options: WebApplicationSchemaOptions): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": options.name,
    "description": options.description,
    "url": options.url.startsWith("http") ? options.url : `${SITE_BASE_URL}${options.url}`,
    "applicationCategory": options.applicationCategory,
    "operatingSystem": options.operatingSystem || "Any modern web browser (HTML5, Canvas 2D, Web Audio API)",
    "browserRequirements": options.browserRequirements || "Requires JavaScript. Requires HTML5 Canvas support.",
    ...(options.genre ? { "genre": options.genre } : {}),
    "author": {
      "@type": "Person",
      "name": "Frederick de Ruiter"
    }
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Returns a Schema.org BreadcrumbList for hierarchical page navigation.
 */
export function getBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${SITE_BASE_URL}${item.url}`
    }))
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export interface CollectionItem {
  name: string;
  url: string;
  description?: string;
}

/**
 * Returns a Schema.org CollectionPage schema for hub and directory views.
 */
export function getCollectionPageSchema(
  name: string,
  description: string,
  url: string,
  items: CollectionItem[]
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url.startsWith("http") ? url : `${SITE_BASE_URL}${url}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "url": item.url.startsWith("http") ? item.url : `${SITE_BASE_URL}${item.url}`,
        ...(item.description ? { "description": item.description } : {})
      }))
    },
    "author": {
      "@type": "Person",
      "name": "Frederick de Ruiter"
    }
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/**
 * Returns a specialized SoftwareSourceCode schema for dynamic Case Studies.
 * Integrates database case study records with cached live GitHub telemetry statistics.
 */
export function getSoftwareSourceCodeSchema(
  study: BaseCaseStudy,
  stats: Partial<GitHubStats> | null
): string {
  // Strip formatting markdown markers for description fields
  const cleanDescription = study.editorial_content
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\*/g, "");

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "name": study.title,
    "description": cleanDescription,
    "codeRepository": study.github_url || undefined,
    "programmingLanguage": study.primary_language,
    "author": {
      "@type": "Person",
      "name": "Frederick de Ruiter"
    },
    // Incorporate telemetry API stats directly into the structured metadata
    "interactionStatistic": (stats && typeof stats.stars === "number" && typeof stats.forks === "number") ? [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": stats.stars
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ForkAction",
        "userInteractionCount": stats.forks
      }
    ] : undefined
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
