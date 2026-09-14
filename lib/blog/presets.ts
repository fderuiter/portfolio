import type { ContentPillar } from "./types";

/**
 * The content-pillar catalog defined in ADR 0041 §3, mapping each pillar to
 * its Target Search Intent Hierarchy tier (`CONTEXT.md` → Search Engine
 * Optimization & Discovery Architecture).
 */
export interface ContentPillarDefinition {
  id: ContentPillar;
  label: string;
  searchIntentTiers: number[];
}

export const CONTENT_PILLAR_CATALOG: Record<
  ContentPillar,
  ContentPillarDefinition
> = {
  "clinical-data-engineering": {
    id: "clinical-data-engineering",
    label: "Clinical Data Engineering & CDISC Standards",
    searchIntentTiers: [1],
  },
  "formal-verification": {
    id: "formal-verification",
    label: "Formal Verification & AST/Compiler Theory",
    searchIntentTiers: [1],
  },
  "accessibility-engineering": {
    id: "accessibility-engineering",
    label: "Accessibility & Cognitive-Reading Engineering",
    searchIntentTiers: [1, 3],
  },
  "browser-graphics-engineering": {
    id: "browser-graphics-engineering",
    label: "Browser Graphics, Canvas & Game Engineering",
    searchIntentTiers: [3],
  },
  "agent-first-dx": {
    id: "agent-first-dx",
    label: "Agent-First DX & Tooling",
    searchIntentTiers: [1],
  },
  "field-notes": {
    id: "field-notes",
    label: "Field Notes: Make Things Better",
    searchIntentTiers: [1],
  },
};
