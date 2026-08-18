import { ROUTE_METADATA_CONFIGS } from "@/lib/seo-metadata";

/**
 * Known succinct title overrides for primary routes.
 */
const KNOWN_ROUTE_TITLES: Record<string, string> = {
  "/": "Homepage",
  "/case-studies": "Engineering Case Studies",
  "/arcade": "Arcade Hub",
  "/arcade/laser-loon": "Laser Loon",
  "/arcade/quasi-puzzler": "Quasi-Perfect Puzzler",
  "/arcade/garmin-watch": "Garmin 32KB Runner",
  "/arcade/clinical-chaos": "Clinical Trial Chaos",
  "/arcade/retro-labyrinth": "Retro Labyrinth",
  "/arcade/working-with-duck": "Working With Duck",
  "/arcade/meme-vault": "Secret Meme Vault",
  "/stack": "Under the Hood (Stack)",
  "/crf": "CRF Studio",
  "/proof": "Proof Workspace",
  "/neuro": "NeuroRecon Studio",
  "/simulator": "Incident Simulator",
  "/schedule": "Office Hours & Schedule",
};

/**
 * Resolves a human-friendly page title for accessibility announcements and UI feedback.
 *
 * @param href - The destination path or hash link
 * @returns Clean, readable page title string
 */
export function getRouteTitle(href: string): string {
  if (!href) return "Destination Page";

  const cleanPath = href.split("?")[0].split("#")[0] || "/";
  if (KNOWN_ROUTE_TITLES[cleanPath]) {
    return KNOWN_ROUTE_TITLES[cleanPath];
  }

  // Match against ROUTE_METADATA_CONFIGS
  for (const config of Object.values(ROUTE_METADATA_CONFIGS)) {
    if (config.path === cleanPath) {
      const shortTitle = config.title.split(":")[0].split("|")[0].trim();
      return shortTitle;
    }
  }

  // Fallback: convert path segments to Title Case
  const segments = cleanPath.split("/").filter(Boolean);
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    return last
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }

  return "Destination Page";
}

/**
 * Determines whether a given href is a same-page anchor target relative to current pathname.
 */
export function isSamePageAnchor(href: string, currentPathname: string): boolean {
  if (!href) return false;
  if (href.startsWith("#")) return true;
  if (href.startsWith("/#") && currentPathname === "/") return true;

  const [basePath, hash] = href.split("#");
  if (hash && (basePath === currentPathname || (basePath === "/" && currentPathname === "/"))) {
    return true;
  }
  return false;
}
