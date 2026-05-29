"use client";

import { useEffect } from "react";

interface CaseStudy {
  slug: string;
  title: string;
  primary_language: string;
  editorial_content: string;
  architectural_narrative: string;
  tags: string;
  id: string;
  github_url: string | null;
}

export function OfflineNarrativeTracker({ study }: { study: CaseStudy }) {
  useEffect(() => {
    try {
      const cacheKey = "offline_narrative_cache";
      const cached = localStorage.getItem(cacheKey);
      const cache = cached ? JSON.parse(cached) : {};

      // Only save text-based narrative data, exclude any large assets.
      cache[study.slug] = {
        slug: study.slug,
        title: study.title,
        primary_language: study.primary_language,
        editorial_content: study.editorial_content,
        architectural_narrative: study.architectural_narrative,
        tags: study.tags,
        id: study.id,
        github_url: study.github_url,
      };

      // Ensure cache does not exceed 5MB approx (stringified length < 5,000,000)
      let serialized = JSON.stringify(cache);
      while (serialized.length > 4500000) {
        const keys = Object.keys(cache);
        if (keys.length === 0) break;
        // remove the first key (oldest if we assume insertion order)
        delete cache[keys[0]];
        serialized = JSON.stringify(cache);
      }

      localStorage.setItem(cacheKey, serialized);
    } catch (err) {
      console.warn("Failed to cache case study narrative:", err);
    }
  }, [study]);

  return null;
}
