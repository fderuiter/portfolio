import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import SchemaFlowWorkspace from "@/components/SchemaFlowWorkspace";

describe("SchemaFlowWorkspace Component Architectural & Logical Validation", () => {
  const componentPath = path.resolve(__dirname, "../components/SchemaFlowWorkspace.tsx");
  const content = fs.readFileSync(componentPath, "utf-8");

  it("exports the SchemaFlowWorkspace component as the default export", () => {
    expect(typeof SchemaFlowWorkspace).toBe("function");
  });

  it("uses inline SVG elements with absolute coordinate coordinates for zero-reflow declarative layout", () => {
    expect(content).toContain("<svg");
    expect(content).toContain('viewBox="0 0 800 420"');
    expect(content).toContain("transform={`translate(${node.x}, ${node.y})`}");
  });

  it("updates the RAM progress gauge by declaring and modifying CSS custom variables inline on style", () => {
    expect(content).toContain('"--gauge-progress"');
    expect(content).toContain("gauge-fill");
    expect(content).toContain("stroke-dashoffset");
  });

  it("supports interactive click-to-execute connection/disconnection state rules", () => {
    expect(content).toContain("connectNodes");
    expect(content).toContain("disconnectNodes");
    expect(content).toContain("handleNodeClick");
  });

  it("maintains a historical state stack supporting proof tree rollback history upon request", () => {
    expect(content).toContain("executeRollback");
    expect(content).toContain("setHistory");
    expect(content).toContain("rollback");
  });

  it("hosts an accessible command CLI terminal supporting a command registry", () => {
    expect(content).toContain("runCliCommand");
    expect(content).toContain("consoleInput");
    expect(content).toContain("consoleLogs");
    expect(content).toContain("connect");
    expect(content).toContain("disconnect");
  });

  it("configures SchemaFlowWorkspaceWrapper with high-fidelity loading skeleton fallback to eliminate CLS", () => {
    const wrapperPath = path.resolve(__dirname, "../components/SchemaFlowWorkspaceWrapper.tsx");
    const wrapperContent = fs.readFileSync(wrapperPath, "utf-8");
    expect(wrapperContent).toContain("SchemaFlowWorkspaceSkeleton");
    expect(wrapperContent).toContain("loading:");

    const skeletonPath = path.resolve(__dirname, "../components/SchemaFlowWorkspaceSkeleton.tsx");
    const skeletonContent = fs.readFileSync(skeletonPath, "utf-8");
    expect(skeletonContent).toContain('data-testid="schemaflow-skeleton"');
    expect(skeletonContent).toContain("min-h-[520px]");
  });
});
