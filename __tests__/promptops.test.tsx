// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PromptOpsArchitectureDiagram } from "@/components/PromptOpsArchitectureDiagram";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";
import { ROUTE_METADATA_CONFIGS, buildRouteMetadata } from "@/lib/seo-metadata";

vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    volume: 0.5,
    muted: false,
    profile: "8-bit",
    playHover: vi.fn(),
    playSubmit: vi.fn(),
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playAutocomplete: vi.fn(),
  }),
}));

describe("PromptOps Architecture & Component Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders PromptOps Architecture Diagram with interactive tabs and layer nodes", async () => {
    await act(async () => {
      root.render(<PromptOpsArchitectureDiagram />);
    });

    expect(container.textContent).toContain("PromptOps Systems Architecture");
    expect(container.textContent).toContain("Diagram & Inspector");
    expect(container.textContent).toContain("DAG Workflow Engine");
    expect(container.textContent).toContain("2-Pass Validation");
    expect(container.textContent).toContain("MCP Tool Server");

    // Default tab shows architecture diagram layers
    expect(container.textContent).toContain("Layer 1: Developer Interfaces");
    expect(container.textContent).toContain("Layer 2: Core PromptOps Execution Engine");
    expect(container.textContent).toContain("Layer 3: Interoperability, Governance & Audit");
  });

  it("switches tabs in PromptOps Architecture Diagram to DAG Workflow Engine", async () => {
    await act(async () => {
      root.render(<PromptOpsArchitectureDiagram />);
    });

    const dagTab = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("DAG Workflow Engine")
    );
    expect(dagTab).toBeDefined();

    await act(async () => {
      dagTab?.click();
    });

    expect(container.textContent).toContain("Clinical Consensus Arbitration DAG Execution");
    expect(container.textContent).toContain("parse_protocol");
    expect(container.textContent).toContain("check_biosafety");
    expect(container.textContent).toContain("arbitrate_consensus");
    expect(container.textContent).toContain("sign_audit");
  });

  it("switches tabs to 2-Pass Validation and MCP Tool Server", async () => {
    await act(async () => {
      root.render(<PromptOpsArchitectureDiagram />);
    });

    // 2-Pass Validation tab
    const validationTab = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("2-Pass Validation")
    );
    await act(async () => {
      validationTab?.click();
    });

    expect(container.textContent).toContain("Pass 1: Raw Structural Schema Check");
    expect(container.textContent).toContain("Pass 2: Rendered Jinja2 Macro Validation");

    // MCP Tool Server tab
    const mcpTab = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("MCP Tool Server")
    );
    await act(async () => {
      mcpTab?.click();
    });

    expect(container.textContent).toContain("mcp_validate_prompt");
    expect(container.textContent).toContain("mcp_execute_workflow");
    expect(container.textContent).toContain("mcp_audit_log");
  });

  it("includes PromptOps case study record in FALLBACK_CASE_STUDIES with required taxonomy tags", () => {
    const promptopsStudy = FALLBACK_CASE_STUDIES.find((cs) => cs.slug === "promptops");
    expect(promptopsStudy).toBeDefined();
    expect(promptopsStudy?.title).toContain("PromptOps");
    expect(promptopsStudy?.primary_language).toBe("Python");
    expect(promptopsStudy?.tags).toContain("Python");
    expect(promptopsStudy?.tags).toContain("LLMOps");
    expect(promptopsStudy?.tags).toContain("Model Context Protocol");
    expect(promptopsStudy?.tags).toContain("Streamlit");
    expect(promptopsStudy?.tags).toContain("Pydantic");
    expect(promptopsStudy?.tags).toContain("JSON Schema");
    expect(promptopsStudy?.commands_json).toBeTruthy();
    expect(promptopsStudy?.playback_json).toBeTruthy();
  });

  it("configures valid route metadata for /projects/promptops in ROUTE_METADATA_CONFIGS", () => {
    const config = ROUTE_METADATA_CONFIGS.promptops;
    expect(config).toBeDefined();
    expect(config.path).toBe("/projects/promptops");
    expect(config.title).toContain("PromptOps");
    expect(config.keywords).toContain("Model Context Protocol");
    expect(config.keywords).toContain("LLMOps");

    const meta = buildRouteMetadata(config);
    expect(meta.title).toBe(config.title);
    expect(meta.description).toBe(config.description);
    expect(meta.alternates?.canonical).toBe("/projects/promptops");
  });

  it("app/projects/promptops/opengraph-image.tsx generates edge social preview image", async () => {
    const { default: generateOgImage } = await import("@/app/projects/promptops/opengraph-image");
    const res = generateOgImage();
    expect(res).toBeDefined();
    expect(res.headers.get("content-type")).toContain("image/png");
  });
});
