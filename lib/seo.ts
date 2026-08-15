import { BaseCaseStudy } from "@/types/domain";
import { GitHubStats } from "@/lib/github";

/**
 * Returns the canonical Person schema representing Frederick de Ruiter.
 * Securely escapes '<' brackets to neutralize potential XSS script injections.
 */
export function getPersonSchema(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Frederick de Ruiter",
    "url": "https://fderuiter-portfolio.vercel.app",
    "image": "https://fderuiter-portfolio.vercel.app/favicon.ico",
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
 * Returns a specialized SoftwareSourceCode schema for dynamic Case Studies.
 * Integrates database case study records with cached live GitHub telemetry statistics.
 */
export function getSoftwareSourceCodeSchema(
  study: BaseCaseStudy,
  stats: GitHubStats | null
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
    "interactionStatistic": stats ? [
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
