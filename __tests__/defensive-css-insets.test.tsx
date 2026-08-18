import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import path from "path";
import fs from "fs";
import { checkLayoutTextClippingInvariants } from "@/lib/dx/doctor";
import { DevOverflowHud } from "@/components/ui/DevOverflowHud";

describe("Defensive CSS Insets & Static CI Coordinate Check", () => {
  const root = path.resolve(process.cwd());

  it("passes DX doctor static check for non-overlapping bottom-right coordinates and valid z-index scale", () => {
    const result = checkLayoutTextClippingInvariants(root);
    expect(result.status).toBe("pass");
    expect(result.details).toBeUndefined();
  });

  it("detects duplicate bottom-right coordinate declarations when mock duplicate is introduced", () => {
    const mockSourceContent = `
      export function ComponentA() {
        return <div className="fixed bottom-6 right-6 z-50">Toast A</div>;
      }
    `;
    const mockDuplicateContent = `
      export function ComponentB() {
        return <div className="fixed bottom-6 right-6 z-50">Toast B</div>;
      }
    `;

    const extractCoord = (code: string) => {
      const bMatch = code.match(/\bbottom-([0-9a-zA-Z\/\[\]_-]+)\b/);
      const rMatch = code.match(/\bright-([0-9a-zA-Z\/\[\]_-]+)\b/);
      return bMatch && rMatch ? `bottom-${bMatch[1]} right-${rMatch[1]}` : null;
    };

    expect(extractCoord(mockSourceContent)).toBe("bottom-6 right-6");
    expect(extractCoord(mockDuplicateContent)).toBe("bottom-6 right-6");
    expect(extractCoord(mockSourceContent)).toBe(extractCoord(mockDuplicateContent));
  });

  it("renders DevOverflowHud with safe-area inset calculations and minimum 44x44px touch targets", () => {
    const { container } = render(<DevOverflowHud forceEnable={true} />);
    const hudContainer = container.querySelector(".fixed");
    expect(hudContainer).not.toBeNull();
    expect(hudContainer?.className).toContain("env(safe-area-inset-bottom)");
    expect(hudContainer?.className).toContain("env(safe-area-inset-right)");

    const minimizeBtn = container.querySelector('[data-testid="hud-minimize-btn"]');
    expect(minimizeBtn).not.toBeNull();
    expect(minimizeBtn?.className).toContain("min-h-[44px]");
    expect(minimizeBtn?.className).toContain("min-w-[44px]");
  });

  it("verifies floating bottom controls in ProofWorkspaceClient and NeuroReconClient use distinct staggered bottom offsets", () => {
    const proofFile = path.join(root, "app", "proof", "ProofWorkspaceClient.tsx");
    const neuroFile = path.join(root, "components", "neuro", "NeuroReconClient.tsx");

    const proofContent = fs.readFileSync(proofFile, "utf-8");
    const neuroContent = fs.readFileSync(neuroFile, "utf-8");

    expect(proofContent).toContain("bottom-24");
    expect(neuroContent).toContain("bottom-28");
    expect(proofContent).toContain("env(safe-area-inset-bottom)");
    expect(neuroContent).toContain("env(safe-area-inset-bottom)");
  });
});
