import { describe, it, expect } from "vitest";
import {
  getPersonSchema,
  getWebsiteSchema,
  getWebApplicationSchema,
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getSoftwareSourceCodeSchema,
  SITE_BASE_URL,
} from "@/lib/seo";
import { ROUTE_METADATA_CONFIGS, buildRouteMetadata } from "@/lib/seo-metadata";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("SEO Architecture & JSON-LD Schemas", () => {
  it("getPersonSchema generates valid, parseable Schema.org Person with XSS sanitization", () => {
    const raw = getPersonSchema();
    expect(raw).not.toContain("<script");
    const parsed = JSON.parse(raw);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("Person");
    expect(parsed.name).toBe("Frederick de Ruiter");
    expect(parsed.jobTitle).toContain("Principal Systems Engineer");
    expect(parsed.sameAs).toHaveLength(2);
  });

  it("getWebsiteSchema generates valid WebSite schema", () => {
    const raw = getWebsiteSchema();
    const parsed = JSON.parse(raw);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("WebSite");
    expect(parsed.url).toBe(SITE_BASE_URL);
    expect(parsed.author["@type"]).toBe("Person");
  });

  it("getWebApplicationSchema generates valid WebApplication schema for games", () => {
    const raw = getWebApplicationSchema({
      name: "Laser Loon: Cryo Bug Hunter",
      description: "Raycaster laser arcade game",
      url: "/arcade/laser-loon",
      applicationCategory: "GameApplication",
      genre: "Physics Arcade",
    });
    const parsed = JSON.parse(raw);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("WebApplication");
    expect(parsed.name).toBe("Laser Loon: Cryo Bug Hunter");
    expect(parsed.url).toBe(`${SITE_BASE_URL}/arcade/laser-loon`);
    expect(parsed.applicationCategory).toBe("GameApplication");
    expect(parsed.genre).toBe("Physics Arcade");
  });

  it("getBreadcrumbSchema generates structured BreadcrumbList", () => {
    const raw = getBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Arcade Hub", url: "/arcade" },
      { name: "Laser Loon", url: "/arcade/laser-loon" },
    ]);
    const parsed = JSON.parse(raw);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("BreadcrumbList");
    expect(parsed.itemListElement).toHaveLength(3);
    expect(parsed.itemListElement[0].position).toBe(1);
    expect(parsed.itemListElement[0].name).toBe("Home");
    expect(parsed.itemListElement[2].item).toBe(`${SITE_BASE_URL}/arcade/laser-loon`);
  });

  it("getCollectionPageSchema generates structured CollectionPage with item list", () => {
    const raw = getCollectionPageSchema(
      "Arcade Hub",
      "Interactive games",
      "/arcade",
      [
        { name: "Laser Loon", url: "/arcade/laser-loon", description: "Bug shooter" },
        { name: "Quasi-Puzzler", url: "/arcade/quasi-puzzler" },
      ]
    );
    const parsed = JSON.parse(raw);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("CollectionPage");
    expect(parsed.mainEntity["@type"]).toBe("ItemList");
    expect(parsed.mainEntity.itemListElement).toHaveLength(2);
  });

  it("getSoftwareSourceCodeSchema formats case studies with telemetry", () => {
    const mockStudy = {
      id: "cs-1",
      slug: "schemaflow",
      title: "SchemaFlow Engine",
      primary_language: "TypeScript",
      github_url: "https://github.com/fderuiter/schemaflow",
      published: true,
      simulated_telemetry: false,
      tags: "TypeScript, AST",
      editorial_content: "An **interactive** proof engine.",
      architectural_narrative: "<p>Narrative</p>",
      created_at: new Date("2026-01-01"),
      updated_at: new Date("2026-02-01"),
    };

    const raw = getSoftwareSourceCodeSchema(mockStudy, { stars: 42, forks: 7 });
    const parsed = JSON.parse(raw);
    expect(parsed["@type"]).toBe("SoftwareSourceCode");
    expect(parsed.name).toBe("SchemaFlow Engine");
    expect(parsed.programmingLanguage).toBe("TypeScript");
    expect(parsed.description).toBe("An interactive proof engine.");
    expect(parsed.interactionStatistic).toHaveLength(2);
  });

  it("buildRouteMetadata generates complete Next.js metadata objects for all registered routes", () => {
    const routeKeys = Object.keys(ROUTE_METADATA_CONFIGS);
    expect(routeKeys.length).toBeGreaterThanOrEqual(11);

    for (const key of routeKeys) {
      const config = ROUTE_METADATA_CONFIGS[key];
      const meta = buildRouteMetadata(config);

      expect(meta.title).toBe(config.title);
      expect(meta.description).toBe(config.description);
      expect(meta.alternates?.canonical).toBe(config.path);
      expect(meta.openGraph?.title).toContain(config.title);
      expect(meta.openGraph?.description).toBe(config.description);
      expect(meta.twitter?.title).toContain(config.title);
    }
  });

  it("robots configuration allows indexing and references sitemap", () => {
    const result = robots();
    expect(result.rules).toBeDefined();
    expect(result.sitemap).toBe(`${SITE_BASE_URL}/sitemap.xml`);
  });

  it("sitemap generator returns all first-class routes and dynamic case studies", async () => {
    const map = await sitemap();
    expect(Array.isArray(map)).toBe(true);

    const urls = map.map((entry) => entry.url);
    expect(urls).toContain(SITE_BASE_URL);
    expect(urls).toContain(`${SITE_BASE_URL}/arcade`);
    expect(urls).toContain(`${SITE_BASE_URL}/arcade/laser-loon`);
    expect(urls).toContain(`${SITE_BASE_URL}/arcade/quasi-puzzler`);
    expect(urls).toContain(`${SITE_BASE_URL}/arcade/garmin-watch`);
    expect(urls).toContain(`${SITE_BASE_URL}/arcade/clinical-chaos`);
    expect(urls).toContain(`${SITE_BASE_URL}/arcade/retro-labyrinth`);
    expect(urls).toContain(`${SITE_BASE_URL}/arcade/working-with-duck`);
    expect(urls).toContain(`${SITE_BASE_URL}/proof`);
    expect(urls).toContain(`${SITE_BASE_URL}/simulator`);
    expect(urls).toContain(`${SITE_BASE_URL}/transparency`);
    expect(urls).toContain(`${SITE_BASE_URL}/schedule`);
  });
});
