import { describe, it, expect } from "vitest";
import { designManifest, lightTheme, themes } from "@/lib/design-manifest";
import fs from "fs";
import path from "path";

describe("Backward-Compatible Multi-Theme Design Token Generator", () => {
  it("preserves top-level default root token exports for complete backward compatibility", () => {
    // Top-level colors
    expect(designManifest.colors).toBeDefined();
    expect(designManifest.colors.background).toBe("#0d0e11");
    expect(designManifest.colors.foreground).toBe("#f4f4f6");
    expect(designManifest.colors["brand-cyan"]).toBe("#06b6d4");

    // Top-level typography
    expect(designManifest.typography.fonts.sans).toContain("var(--font-inter)");
    expect(typeof designManifest.typography.sizes.sm.fontSize).toBe("number");
    expect(designManifest.typography.sizes.sm.fontSize).toBe(13);
    expect(typeof designManifest.typography.sizes.sm.lineHeight).toBe("number");
    expect(designManifest.typography.sizes.sm.lineHeight).toBe(18);

    // Top-level masonry
    expect(typeof designManifest.masonry.paddingWithStats).toBe("number");
    expect(designManifest.masonry.paddingWithStats).toBe(604);
    expect(typeof designManifest.masonry.paddingWithoutStats).toBe("number");
    expect(designManifest.masonry.paddingWithoutStats).toBe(254);

    // Top-level layout
    expect(typeof designManifest.layout.gap).toBe("number");
    expect(designManifest.layout.gap).toBe(16);
    expect(typeof designManifest.layout.cardPadding).toBe("number");
    expect(designManifest.layout.cardPadding).toBe(20);

    // Top-level breakpoints
    expect(typeof designManifest.breakpoints.sm).toBe("number");
    expect(designManifest.breakpoints.sm).toBe(640);
    expect(designManifest.breakpoints.lg).toBe(1024);

    // Top-level motion springs
    expect(designManifest.motion.springs.snappy).toBeDefined();
    expect(typeof designManifest.motion.springs.snappy.stiffness).toBe("number");
    expect(designManifest.motion.springs.snappy.stiffness).toBe(380);
    expect(typeof designManifest.motion.springs.snappy.damping).toBe("number");
    expect(designManifest.motion.springs.snappy.damping).toBe(30);
  });

  it("exports dedicated light theme dictionary under designManifest.themes.light and named lightTheme export", () => {
    expect(designManifest.themes).toBeDefined();
    expect(designManifest.themes.light).toBeDefined();

    // Verify named exports match designManifest.themes
    expect(themes).toBe(designManifest.themes);
    expect(lightTheme).toBe(designManifest.themes.light);

    // Light mode color variants extracted from [data-theme="light"]
    expect(lightTheme.colors.background).toBe("#f8fafc");
    expect(lightTheme.colors.foreground).toBe("#0f172a");
    expect(lightTheme.colors["brand-cyan"]).toBe("#0891b2");
    expect(lightTheme.colors["surface-1"]).toBe("rgba(255, 255, 255, 0.85)");

    // Inherited / parsed numeric properties in light theme dictionary
    expect(typeof lightTheme.layout.gap).toBe("number");
    expect(lightTheme.layout.gap).toBe(16);
    expect(typeof lightTheme.masonry.paddingWithStats).toBe("number");
    expect(lightTheme.masonry.paddingWithStats).toBe(604);
    expect(typeof lightTheme.motion.springs.snappy.stiffness).toBe("number");
    expect(lightTheme.motion.springs.snappy.stiffness).toBe(380);
    expect(typeof lightTheme.breakpoints.md).toBe("number");
    expect(lightTheme.breakpoints.md).toBe(768);
  });

  it("verifies global stylesheet app/globals.css contains default root and light mode token blocks", () => {
    const cssPath = path.resolve(process.cwd(), "app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    // Verify root selector exists
    expect(css).toMatch(/:root\s*\{/);

    // Verify light mode theme block exists
    expect(css).toMatch(/\[data-theme="light"\]|:root\[data-theme="light"\]/);
  });
});
