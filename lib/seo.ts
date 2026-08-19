import { BaseCaseStudy } from "@/types/domain";
import { GitHubStats } from "@/lib/github";
import { resolveBaseUrl } from "./domain";

export const SITE_BASE_URL = resolveBaseUrl();

export const PERSON_NODE_ID = `${SITE_BASE_URL}/#person`;
export const WEBSITE_NODE_ID = `${SITE_BASE_URL}/#website`;

/**
 * Returns the canonical Person Schema.org entity node with #person @id.
 */
export function getPersonNode(): Record<string, unknown> {
  return {
    "@type": "Person",
    "@id": PERSON_NODE_ID,
    "name": "Frederick de Ruiter",
    "url": SITE_BASE_URL,
    "image": `${SITE_BASE_URL}/favicon.ico`,
    "jobTitle": "Principal Systems Engineer & Designer",
    "sameAs": [
      "https://github.com/fderuiter",
      "https://www.linkedin.com/in/frederick-de-ruiter-88012467/"
    ],
    "knowsAbout": [
      "Systems Architecture",
      "CDISC CDASH & ODM-XML",
      "Formal Verification",
      "Embedded Systems",
      "Next.js 16 & React 19",
      "TypeScript & Rust"
    ]
  };
}

/**
 * Returns the canonical WebSite Schema.org entity node with `#website` `@id` and Sitelinks SearchAction.
 */
export function getWebsiteNode(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_NODE_ID,
    "name": "Frederick de Ruiter Portfolio",
    "url": SITE_BASE_URL,
    "description": "High-performance systems engineering showcase, canvas physics engines, and CDISC data engines by Frederick de Ruiter.",
    "publisher": {
      "@type": "Person",
      "@id": PERSON_NODE_ID,
      "name": "Frederick de Ruiter"
    },
    "author": {
      "@type": "Person",
      "@id": PERSON_NODE_ID,
      "name": "Frederick de Ruiter"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_BASE_URL}/?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export interface WebPageNodeOptions {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * Returns a canonical WebPage entity node linked to the root WebSite and Person.
 */
export function getWebPageNode(options: WebPageNodeOptions): Record<string, unknown> {
  const fullUrl = options.url.startsWith("http") ? options.url : `${SITE_BASE_URL}${options.url.startsWith("/") ? options.url : "/" + options.url}`;
  return {
    "@type": "WebPage",
    "@id": `${fullUrl}/#webpage`,
    "url": fullUrl,
    "name": options.name,
    "description": options.description,
    "isPartOf": {
      "@id": WEBSITE_NODE_ID
    },
    "author": {
      "@id": PERSON_NODE_ID
    },
    ...(options.breadcrumbs ? { "breadcrumb": { "@id": `${fullUrl}/#breadcrumb` } } : {})
  };
}

/**
 * Returns a normalized BreadcrumbList entity node with explicit #breadcrumb @id.
 */
export function getBreadcrumbNode(items: BreadcrumbItem[], pageUrl: string): Record<string, unknown> {
  const normalized = normalizeBreadcrumbs(items);
  const fullPageUrl = pageUrl.startsWith("http") ? pageUrl : `${SITE_BASE_URL}${pageUrl.startsWith("/") ? pageUrl : "/" + pageUrl}`;
  return {
    "@type": "BreadcrumbList",
    "@id": `${fullPageUrl}/#breadcrumb`,
    "itemListElement": normalized.map((item, index) => {
      const formattedUrl = item.url.startsWith("http")
        ? item.url
        : `${SITE_BASE_URL}${item.url.startsWith("/") ? item.url : "/" + item.url}`;
      return {
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": formattedUrl,
      };
    }),
  };
}

export interface VisualArtworkSchemaOptions {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  formats?: string[];
  license?: string;
  creator?: string;
}

/**
 * Returns a specialized VisualArtwork & MediaObject Schema.org representation for open graphic design assets (e.g. Laser Loon).
 */
export function getVisualArtworkSchema(options: VisualArtworkSchemaOptions): string {
  const fullUrl = options.url.startsWith("http") ? options.url : `${SITE_BASE_URL}${options.url.startsWith("/") ? options.url : "/" + options.url}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "@id": `${fullUrl}/#artwork`,
    "name": options.name,
    "description": options.description,
    "url": fullUrl,
    "image": options.imageUrl || `${SITE_BASE_URL}/images/laser-loon-preview.png`,
    "encodingFormat": options.formats || ["image/svg+xml", "application/illustrator", "application/pdf", "image/png"],
    "license": options.license || "https://creativecommons.org/licenses/by/4.0/",
    "creator": {
      "@type": "Person",
      "@id": PERSON_NODE_ID,
      "name": options.creator || "Frederick de Ruiter"
    }
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/**
 * Returns an interconnected Schema.org `@graph` linking all provided entity nodes into a single structured payload.
 */
export function getUnifiedGraphSchema(nodes: (Record<string, unknown> | null | undefined)[]): string {
  const filteredNodes = nodes.filter((n): n is Record<string, unknown> => Boolean(n));
  const schema = {
    "@context": "https://schema.org",
    "@graph": filteredNodes,
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/**
 * Returns the canonical Person schema representing Frederick de Ruiter.
 * Securely escapes angle brackets to neutralize potential XSS script injections.
 */
export function getPersonSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    ...getPersonNode(),
  };

  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/**
 * Returns the root WebSite schema.
 */
export function getWebsiteSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    ...getWebsiteNode(),
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
 * Normalizes breadcrumb items to enforce a single root location entry across all routes and schemas.
 * Strips any initial or duplicate root entries (links to "/", empty string, SITE_BASE_URL, or named "Home")
 * and prepends exactly one root location entry ({ name: "Home", url: "/" }).
 */
export function normalizeBreadcrumbs(items: BreadcrumbItem[]): BreadcrumbItem[] {
  const isRootItem = (item: BreadcrumbItem) => {
    const nameLower = (item.name || "").trim().toLowerCase();
    const urlTrim = (item.url || "").trim();
    return (
      nameLower === "home" ||
      (item.url !== undefined && (urlTrim === "/" || urlTrim === SITE_BASE_URL || urlTrim === `${SITE_BASE_URL}/`))
    );
  };

  const filtered = (items || []).filter((item) => !isRootItem(item));
  return [{ name: "Home", url: "/" }, ...filtered];
}

/**
 * Returns a Schema.org BreadcrumbList for hierarchical page navigation.
 * Enforces a single root location entry and securely sanitizes angle brackets against script injection.
 */
export function getBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const normalized = normalizeBreadcrumbs(items);
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": normalized.map((item, index) => {
      const formattedUrl = item.url.startsWith("http")
        ? item.url
        : `${SITE_BASE_URL}${item.url.startsWith("/") ? item.url : "/" + item.url}`;
      return {
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": formattedUrl,
      };
    }),
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

