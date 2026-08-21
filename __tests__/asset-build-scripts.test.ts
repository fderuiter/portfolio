import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { generateBrandIcons } from "../scripts/generate-brand-icons";
import { designManifest } from "../lib/design-manifest";

describe("Standardized Asset Build Scripts & Design System Tokens", () => {
  const rootDir = process.cwd();

  beforeAll(async () => {
    // Generate icons to guarantee current state
    await generateBrandIcons(rootDir);
  });

  describe("1. Multi-Resolution Brand Icon Generation", () => {
    it("generates vector SVG favicons", () => {
      const appIconSvg = path.join(rootDir, "app/icon.svg");
      const publicFaviconSvg = path.join(rootDir, "public/favicon.svg");

      expect(fs.existsSync(appIconSvg)).toBe(true);
      expect(fs.existsSync(publicFaviconSvg)).toBe(true);

      const appSvgContent = fs.readFileSync(appIconSvg, "utf-8");
      const publicSvgContent = fs.readFileSync(publicFaviconSvg, "utf-8");

      expect(appSvgContent).toContain("<svg");
      expect(publicSvgContent).toContain("<svg");
    });

    it("generates multi-resolution binary ICO container files with correct ICO header", () => {
      const appFaviconIco = path.join(rootDir, "app/favicon.ico");
      const publicFaviconIco = path.join(rootDir, "public/favicon.ico");

      expect(fs.existsSync(appFaviconIco)).toBe(true);
      expect(fs.existsSync(publicFaviconIco)).toBe(true);

      const icoBuf = fs.readFileSync(publicFaviconIco);
      expect(icoBuf.length).toBeGreaterThan(100);

      // Check Windows ICO magic bytes: Reserved=0, Type=1 (ICO), ImageCount=3
      expect(icoBuf.readUInt16LE(0)).toBe(0);
      expect(icoBuf.readUInt16LE(2)).toBe(1);
      expect(icoBuf.readUInt16LE(4)).toBe(3);
    });

    it("generates multi-resolution PNG graphics (Apple Touch Icon & Web App Manifest)", () => {
      const pngTargets = [
        path.join(rootDir, "public/apple-touch-icon.png"),
        path.join(rootDir, "public/icon-192.png"),
        path.join(rootDir, "public/icon-512.png"),
      ];

      for (const target of pngTargets) {
        expect(fs.existsSync(target)).toBe(true);
        const buf = fs.readFileSync(target);
        expect(buf.length).toBeGreaterThan(100);

        // PNG Header magic bytes: 0x89 'P' 'N' 'G'
        expect(buf[0]).toBe(0x89);
        expect(buf[1]).toBe(0x50);
        expect(buf[2]).toBe(0x4e);
        expect(buf[3]).toBe(0x47);
      }
    });
  });

  describe("2. Design Token Manifest Compilation", () => {
    it("exports strongly-typed designManifest runtime constants", () => {
      expect(designManifest).toBeDefined();
      expect(typeof designManifest).toBe("object");

      // Verify colors token category
      expect(designManifest.colors).toBeDefined();
      expect(designManifest.colors.background).toBeDefined();
      expect(designManifest.colors.foreground).toBeDefined();

      // Verify typography token category
      expect(designManifest.typography).toBeDefined();
      expect(designManifest.typography.fonts.sans).toContain("var(--font-inter)");
      expect(designManifest.typography.fonts.mono).toContain("var(--font-geist-mono)");

      // Verify masonry, layout, breakpoints, and motion categories
      expect(designManifest.masonry).toBeDefined();
      expect(designManifest.layout).toBeDefined();
      expect(designManifest.breakpoints).toBeDefined();
      expect(designManifest.motion).toBeDefined();
      expect(designManifest.motion.springs).toBeDefined();
    });
  });

  describe("3. Package Configuration Script Targets", () => {
    it("registers build:icons, build:theme, generate:icons, and generate:theme in package.json", () => {
      const pkgJsonPath = path.join(rootDir, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));

      expect(pkg.scripts["build:icons"]).toBe("npx tsx scripts/generate-brand-icons.ts");
      expect(pkg.scripts["build:theme"]).toBe("npx tsx scripts/generate-theme.ts");
      expect(pkg.scripts["generate:icons"]).toBe("npx tsx scripts/generate-brand-icons.ts");
      expect(pkg.scripts["generate:theme"]).toBe("npx tsx scripts/generate-theme.ts");
    });
  });
});
