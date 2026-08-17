import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";
import {
  getPersonSchema,
  getWebsiteSchema,
  getWebApplicationSchema,
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getSoftwareSourceCodeSchema,
  SITE_BASE_URL,
} from "@/lib/seo";
import { resolveBaseUrl } from "@/lib/domain";
import { ROUTE_METADATA_CONFIGS, buildRouteMetadata } from "@/lib/seo-metadata";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import manifest from "@/app/manifest";

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

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
      name: "Laser Loon: Quest for the State Flag",
      description: "Raycaster laser arcade game",
      url: "/arcade/laser-loon",
      applicationCategory: "GameApplication",
      genre: "Civic Arcade Shooter",
    });
    const parsed = JSON.parse(raw);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("WebApplication");
    expect(parsed.name).toBe("Laser Loon: Quest for the State Flag");
    expect(parsed.url).toBe(`${SITE_BASE_URL}/arcade/laser-loon`);
    expect(parsed.applicationCategory).toBe("GameApplication");
    expect(parsed.genre).toBe("Civic Arcade Shooter");
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
    expect(routeKeys.length).toBeGreaterThanOrEqual(10);

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

  it("robots configuration allows indexing and references sitemap in production", () => {
    const originalVercelEnv = process.env.VERCEL_ENV;
    try {
      process.env.VERCEL_ENV = "production";
      const result = robots();
      expect(result.rules).toBeDefined();
      expect(Array.isArray(result.rules) ? result.rules[0] : result.rules).toEqual({
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"]
      });
      expect(result.sitemap).toBe(`${resolveBaseUrl()}/sitemap.xml`);
    } finally {
      process.env.VERCEL_ENV = originalVercelEnv;
    }
  });

  it("robots configuration disallows indexing and hides sitemap in non-production", () => {
    const originalVercelEnv = process.env.VERCEL_ENV;
    try {
      process.env.VERCEL_ENV = "preview";
      const result = robots();
      expect(result.rules).toBeDefined();
      expect(Array.isArray(result.rules) ? result.rules[0] : result.rules).toEqual({
        userAgent: "*",
        disallow: "/"
      });
      expect(result.sitemap).toBeUndefined();
    } finally {
      process.env.VERCEL_ENV = originalVercelEnv;
    }
  });

  it("sitemap generator returns all first-class routes and dynamic case studies", async () => {
    const map = await sitemap();
    expect(Array.isArray(map)).toBe(true);

    const urls = map.map((entry) => entry.url);
    const expectedBase = resolveBaseUrl();
    expect(urls).toContain(expectedBase);
    expect(urls).toContain(`${expectedBase}/arcade`);
    expect(urls).toContain(`${expectedBase}/arcade/laser-loon`);
    expect(urls).toContain(`${expectedBase}/arcade/quasi-puzzler`);
    expect(urls).toContain(`${expectedBase}/arcade/garmin-watch`);
    expect(urls).toContain(`${expectedBase}/arcade/clinical-chaos`);
    expect(urls).toContain(`${expectedBase}/arcade/retro-labyrinth`);
    expect(urls).toContain(`${expectedBase}/arcade/working-with-duck`);
    expect(urls).toContain(`${expectedBase}/proof`);
    expect(urls).toContain(`${expectedBase}/simulator`);
    expect(urls).toContain(`${expectedBase}/schedule`);
  });

  it("root layout metadata configures SVG, ICO, Apple Touch, and web manifest", async () => {
    const { metadata } = await import("@/app/layout");
    expect(metadata.icons).toBeDefined();
    expect(metadata.icons).toEqual({
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/icon.svg",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    });
    expect(metadata.manifest).toBe("/manifest.webmanifest");
  });

  it("app/manifest.ts generates valid PWA Web App Manifest", () => {
    const data = manifest();
    expect(data.name).toContain("Frederick de Ruiter");
    expect(data.short_name).toBe("F. de Ruiter");
    expect(data.start_url).toBe("/");
    expect(data.display).toBe("standalone");
    expect(data.background_color).toBe("#090D16");
    expect(data.theme_color).toBe("#06B6D4");
    expect(data.icons).toBeDefined();
    expect(data.icons?.length).toBeGreaterThanOrEqual(4);
  });

  it("app/icon.svg and public/favicon.svg exist and contain valid SVG monogram architecture", () => {
    const appIconPath = path.resolve(process.cwd(), "app/icon.svg");
    const publicFaviconPath = path.resolve(process.cwd(), "public/favicon.svg");

    expect(fs.existsSync(appIconPath)).toBe(true);
    expect(fs.existsSync(publicFaviconPath)).toBe(true);

    const appIconContent = fs.readFileSync(appIconPath, "utf-8");
    const publicFaviconContent = fs.readFileSync(publicFaviconPath, "utf-8");

    for (const content of [appIconContent, publicFaviconContent]) {
      expect(content).toContain("<svg");
      expect(content).toContain("id=\"fd-grad\"");
      expect(content).toContain("glyph-stem");
      expect(content).toContain("telemetry-dot");
      expect(content).toContain("</svg>");
    }
  });

  it("custom branded favicon.ico, apple-touch-icon, and PWA icons exist as binary assets", () => {
    const appFaviconPath = path.resolve(process.cwd(), "app/favicon.ico");
    const publicFaviconPath = path.resolve(process.cwd(), "public/favicon.ico");
    const appleTouchPath = path.resolve(process.cwd(), "public/apple-touch-icon.png");
    const icon192Path = path.resolve(process.cwd(), "public/icon-192.png");
    const icon512Path = path.resolve(process.cwd(), "public/icon-512.png");

    for (const filePath of [appFaviconPath, publicFaviconPath, appleTouchPath, icon192Path, icon512Path]) {
      expect(fs.existsSync(filePath)).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(500);
    }

    // Ensure favicon.ico is not the 25KB+ default Next.js/Vercel placeholder
    const faviconStat = fs.statSync(appFaviconPath);
    expect(faviconStat.size).toBeLessThan(10000);
  });

  it("createSocialImageResponse generates valid ImageResponse with 1200x630 dimensions", async () => {
    const { createSocialImageResponse, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } = await import("@/lib/og-image");
    expect(OG_IMAGE_SIZE).toEqual({ width: 1200, height: 630 });
    expect(OG_IMAGE_CONTENT_TYPE).toBe("image/png");

    const res = createSocialImageResponse({
      title: "Test Social Preview",
      description: "Test description",
      badge: "TEST // MODE",
      tags: ["TypeScript", "Vitest"],
    });

    expect(res).toBeDefined();
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("root opengraph-image and twitter-image generators return valid responses", async () => {
    const { default: rootOgImage, size: ogSize } = await import("@/app/opengraph-image");
    const { default: rootTwitterImage, size: twitterSize } = await import("@/app/twitter-image");

    expect(ogSize).toEqual({ width: 1200, height: 630 });
    expect(twitterSize).toEqual({ width: 1200, height: 630 });

    const ogRes = rootOgImage();
    const twRes = rootTwitterImage();

    expect(ogRes).toBeDefined();
    expect(twRes).toBeDefined();
    expect(ogRes.headers.get("content-type")).toContain("image/png");
    expect(twRes.headers.get("content-type")).toContain("image/png");
  });

  it("interactive hub opengraph-image generators return valid responses", async () => {
    const { default: arcadeOg } = await import("@/app/arcade/opengraph-image");
    const { default: proofOg } = await import("@/app/proof/opengraph-image");
    const { default: simulatorOg } = await import("@/app/simulator/opengraph-image");
    const { default: stackOg } = await import("@/app/stack/opengraph-image");
    const { default: scheduleOg } = await import("@/app/schedule/opengraph-image");
    const { default: caseStudiesOg } = await import("@/app/case-studies/opengraph-image");

    for (const generator of [arcadeOg, proofOg, simulatorOg, stackOg, scheduleOg, caseStudiesOg]) {
      const res = generator();
      expect(res).toBeDefined();
      expect(res.headers.get("content-type")).toContain("image/png");
    }
  });
});




