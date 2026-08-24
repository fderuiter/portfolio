export interface ArcadeRegistryEntry {
  caseStudySlug: string;
  gameId: string;
  gameSlug: string;
  simulatorRoute: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  caseStudyTitle?: string;
  caseStudyRoute: string;
}

/**
 * Strongly-typed bidirectional registry mapping case study slugs to arcade game/simulator metadata.
 */
export const ARCADE_REGISTRY: Record<string, ArcadeRegistryEntry> = {
  "laser-loon": {
    caseStudySlug: "laser-loon",
    gameId: "laser-loon",
    gameSlug: "laser-loon",
    simulatorRoute: "/arcade/laser-loon",
    title: "Laser Loon: Quest for the State Flag",
    subtitle: "Civic Arcade & Physics Raycast Campaign",
    ctaLabel: "Launch Simulator",
    caseStudyTitle:
      "The Laser Loon: Vector Illustration, Cultural Branding & Open Asset Distribution",
    caseStudyRoute: "/case-studies/laser-loon",
  },
  "clinical-data-mapper": {
    caseStudySlug: "clinical-data-mapper",
    gameId: "clinical-chaos",
    gameSlug: "clinical-chaos",
    simulatorRoute: "/arcade/clinical-chaos",
    title: "Clinical Trial Chaos: CDISC Compliance",
    subtitle: "FDA 21 CFR Part 11 & SDTM Arcade",
    ctaLabel: "Launch Simulator",
    caseStudyTitle:
      "Clinical Data Standards Engine: CDISC ODM and SDTM Integration",
    caseStudyRoute: "/case-studies/clinical-data-mapper",
  },
  "polyglot-tsp": {
    caseStudySlug: "polyglot-tsp",
    gameId: "retro-labyrinth",
    gameSlug: "retro-labyrinth",
    simulatorRoute: "/arcade/retro-labyrinth",
    title: "Retro Labyrinth: Graveyard Roguelike",
    subtitle: "Dungeon Crawler & CRT Phosphor Engine",
    ctaLabel: "Launch Simulator",
    caseStudyTitle:
      "Polyglot-TSP: Cross-Paradigm Combinatorial Optimization Across 50+ Languages",
    caseStudyRoute: "/case-studies/polyglot-tsp",
  },
  ualbf: {
    caseStudySlug: "ualbf",
    gameId: "quasi-puzzler",
    gameSlug: "quasi-puzzler",
    simulatorRoute: "/arcade/quasi-puzzler",
    title: "Quasi-Perfect Puzzler",
    subtitle: "Formal Verification & Lean 4 AST Logic",
    ctaLabel: "Launch Simulator",
    caseStudyTitle:
      "UALBF: Verified Computational Proof Engine & Search Architecture",
    caseStudyRoute: "/case-studies/ualbf",
  },
  duckdeploy: {
    caseStudySlug: "duckdeploy",
    gameId: "working-with-duck",
    gameSlug: "working-with-duck",
    simulatorRoute: "/arcade/working-with-duck",
    title: "Working With Duck",
    subtitle: "Pet Simulation & Multitasking Arcade",
    ctaLabel: "Launch Simulator",
    caseStudyTitle:
      "DuckDeploy: Schema-Driven Dynamic UI Engine & Manifest Compiler",
    caseStudyRoute: "/case-studies/duckdeploy",
  },
  "crf-xl": {
    caseStudySlug: "crf-xl",
    gameId: "crf-studio",
    gameSlug: "simulator",
    simulatorRoute: "/simulator",
    title: "CRF Studio",
    subtitle: "21 CFR Part 11 EDC Studio",
    ctaLabel: "Launch Simulator",
    caseStudyTitle:
      "CRF.xl: Office.js Taskpane Engine, DAG Rule Solver & CDISC ODM-XML Compiler",
    caseStudyRoute: "/case-studies/crf-xl",
  },
  "inbody-qr-decoder": {
    caseStudySlug: "inbody-qr-decoder",
    gameId: "garmin-watch",
    gameSlug: "garmin-watch",
    simulatorRoute: "/arcade/garmin-watch",
    title: "Monkey C Mayhem: Garmin Schvitz App",
    subtitle: "Embedded Systems & Garmin Schvitz App Simulator",
    ctaLabel: "Launch Simulator",
    caseStudyTitle:
      "InBody QR Data Decoder & Analyzer: BIA Reverse Engineering",
    caseStudyRoute: "/case-studies/inbody-qr-decoder",
  },
};

/**
 * Secondary alias mappings for gameId/gameSlug -> caseStudySlug to ensure robust bidirectional lookup.
 */
const GAME_TO_CASE_STUDY_MAP: Record<string, string> = {
  "laser-loon": "laser-loon",
  "clinical-chaos": "clinical-data-mapper",
  "retro-labyrinth": "polyglot-tsp",
  "quasi-puzzler": "ualbf",
  "working-with-duck": "duckdeploy",
  "garmin-watch": "inbody-qr-decoder",
  "crf-studio": "crf-xl",
  simulator: "crf-xl",
  // direct slug aliases
  duckdeploy: "duckdeploy",
  "clinical-data-mapper": "clinical-data-mapper",
  "polyglot-tsp": "polyglot-tsp",
  ualbf: "ualbf",
  "crf-xl": "crf-xl",
  "inbody-qr-decoder": "inbody-qr-decoder",
};

/**
 * Resolves the simulator registry entry for a given case study slug.
 */
export function getSimulatorForCaseStudy(
  caseStudySlug?: string | null
): ArcadeRegistryEntry | null {
  if (!caseStudySlug) return null;
  const normalized = caseStudySlug.trim().toLowerCase();

  if (ARCADE_REGISTRY[normalized]) {
    return ARCADE_REGISTRY[normalized];
  }

  const mappedSlug = GAME_TO_CASE_STUDY_MAP[normalized];
  if (mappedSlug && ARCADE_REGISTRY[mappedSlug]) {
    return ARCADE_REGISTRY[mappedSlug];
  }

  return null;
}

/**
 * Resolves the case study registry entry for a given arcade game ID or game slug.
 */
export function getCaseStudyForGame(
  gameIdOrSlug?: string | null
): ArcadeRegistryEntry | null {
  if (!gameIdOrSlug) return null;
  const normalized = gameIdOrSlug.trim().toLowerCase();

  const caseStudySlug = GAME_TO_CASE_STUDY_MAP[normalized];
  if (caseStudySlug && ARCADE_REGISTRY[caseStudySlug]) {
    return ARCADE_REGISTRY[caseStudySlug];
  }

  // Fallback search across entries
  for (const entry of Object.values(ARCADE_REGISTRY)) {
    if (
      entry.gameId.toLowerCase() === normalized ||
      entry.gameSlug.toLowerCase() === normalized ||
      entry.simulatorRoute.toLowerCase() === normalized
    ) {
      return entry;
    }
  }

  return null;
}

/**
 * Validates all registered paths and bidirectional mappings.
 */
export function validateRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, entry] of Object.entries(ARCADE_REGISTRY)) {
    if (!entry.caseStudySlug || entry.caseStudySlug !== key) {
      errors.push(
        `Registry key '${key}' mismatch with caseStudySlug '${entry.caseStudySlug}'`
      );
    }
    if (!entry.simulatorRoute || !entry.simulatorRoute.startsWith("/")) {
      errors.push(
        `Invalid simulatorRoute '${entry.simulatorRoute}' for case study '${key}'`
      );
    }
    if (!entry.caseStudyRoute || !entry.caseStudyRoute.startsWith("/")) {
      errors.push(
        `Invalid caseStudyRoute '${entry.caseStudyRoute}' for case study '${key}'`
      );
    }
    if (!entry.ctaLabel) {
      errors.push(`Missing ctaLabel for case study '${key}'`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
