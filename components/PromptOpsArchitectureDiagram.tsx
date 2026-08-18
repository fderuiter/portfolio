"use client";

import React, { useState, useId } from "react";
import {
  IconTerminal,
  IconLayoutDashboard,
  IconCpu,
  IconShieldCheck,
  IconGitBranch,
  IconServer,
  IconFileCode,
  IconCheck,
  IconPlayerPlay,
  IconArrowRight,
  IconCode,
  IconStack2,
  IconFileText,
  IconLock,
} from "@tabler/icons-react";
import { useAudio } from "@/components/providers/AudioProvider";

export interface ArchitectureLayerNode {
  id: string;
  category: "interface" | "engine" | "governance";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  specs: string[];
  codeSnippet: string;
  description: string;
}

const ARCHITECTURE_NODES: ArchitectureLayerNode[] = [
  {
    id: "cli",
    category: "interface",
    title: "CLI & Rich Console",
    subtitle: "Typer, Rich, Shell Commands",
    icon: <IconTerminal className="w-5 h-5 text-brand-cyan" />,
    specs: ["init", "validate", "run", "simulate", "sync", "export", "docgen", "vibe"],
    description: "Command-line developer interface powered by Typer and Rich, providing deterministic project initialization, two-pass validation, local simulation, and documentation generation.",
    codeSnippet: `$ promptops init --template clinical
[INFO] Project structure created in ./clinical-trial-audit
[INFO] Generating Draft-07 JSON Schemas...
[SUCCESS] PromptOps workspace initialized cleanly.`
  },
  {
    id: "studio",
    category: "interface",
    title: "Streamlit Studio GUI",
    subtitle: "Multi-Page Visual Studio",
    icon: <IconLayoutDashboard className="w-5 h-5 text-amber-400" />,
    specs: ["Prompt Editor", "Workflow Canvas", "Simulation Runner", "Git Sync"],
    description: "Multi-page visual IDE for drag-and-drop prompt composition, real-time workflow graph rendering, sandbox evaluation, and seamless Git sync.",
    codeSnippet: `import streamlit as st
from studio.components import render_workflow_canvas

st.title("PromptOps Workflow Studio")
render_workflow_canvas(workflow_id="clinical-consensus")`
  },
  {
    id: "jinja-compiler",
    category: "engine",
    title: "Jinja2 Macro Compiler",
    subtitle: "Template Engine & Substitutions",
    icon: <IconCode className="w-5 h-5 text-emerald-400" />,
    specs: ["macros.j2", "Variable Substitution", "Modular Libraries"],
    description: "Centralizes reusable system instructions, reasoning formats, and safety guardrail macros into compiled template assets.",
    codeSnippet: `{% import 'macros.j2' as macros %}
{{ macros.clinical_system_prompt(domain="oncology", strict=True) }}
User Input: {{ input.subject_data | to_json }}`
  },
  {
    id: "validator",
    category: "engine",
    title: "2-Pass Schema Validator",
    subtitle: "Draft-07 JSON Schema Engine",
    icon: <IconShieldCheck className="w-5 h-5 text-brand-cyan" />,
    specs: ["prompt.schema.json", "workflow.schema.json", "InputSchema.schema.json", "ModelParameters.schema.json"],
    description: "Two-pass validation engine verifying both raw structural YAML/JSON definitions and rendered Jinja2 templates against parameter boundaries prior to API execution.",
    codeSnippet: `from promptops.validation import TwoPassValidator

validator = TwoPassValidator(schema_path="schemas/Draft-07")
result = validator.validate_prompt_file("consensus.prompt.yaml")
assert result.is_valid, result.errors`
  },
  {
    id: "guard",
    category: "engine",
    title: "Execution Guard & Sanitizer",
    subtitle: "Boundary Defenses & Safety",
    icon: <IconLock className="w-5 h-5 text-purple-400" />,
    specs: ["PII/PHI Masking", "Parameter Clamping", "Token Limit Bounding"],
    description: "Runtime safety wrapper ensuring prompts comply with maximum token context limits, parameter temperature bounds, and privacy sanitization.",
    codeSnippet: `class ExecutionGuard:
    def sanitize_payload(self, raw_input: dict) -> dict:
        # Enforce HIPAA & PII boundaries
        return pii_filter.mask_sensitive_tokens(raw_input)`
  },
  {
    id: "dag-engine",
    category: "engine",
    title: "DAG Workflow Engine",
    subtitle: "Topological Sort & Dispatch",
    icon: <IconGitBranch className="w-5 h-5 text-brand-cyan" />,
    specs: ["WorkflowEdge.schema.json", "WorkflowStep.schema.json", "State Propagation"],
    description: "Orchestrates multi-agent pipelines as Directed Acyclic Graphs, resolving step dependencies, state propagation, and dry-run simulation mocks.",
    codeSnippet: `from promptops.engine import DAGWorkflowEngine

engine = DAGWorkflowEngine(workflow_file="consensus.workflow.yaml")
execution_order = engine.topological_sort()
results = engine.dispatch_all()`
  },
  {
    id: "mcp-server",
    category: "governance",
    title: "Model Context Protocol (MCP)",
    subtitle: "Tool Server & Schema Registry",
    icon: <IconServer className="w-5 h-5 text-blue-400" />,
    specs: ["mcp_server.py", "MCPTool.schema.json", "ToolCall.schema.json"],
    description: "Native MCP server exposing PromptOps prompt libraries and workflow engines as standardized tools for Claude and external MCP clients.",
    codeSnippet: `@mcp.tool(name="execute_promptops_workflow")
async def handle_mcp_call(workflow_name: str, inputs: dict) -> dict:
    return await promptops_runtime.run(workflow_name, inputs)`
  },
  {
    id: "audit-trails",
    category: "governance",
    title: "Signed Audit Trails",
    subtitle: "Tamper-Evident Cryptographic Logs",
    icon: <IconFileCode className="w-5 h-5 text-emerald-400" />,
    specs: ["compliance_manifest.json", "SHA-256 Signatures", "GxP / 21 CFR Part 11"],
    description: "Produces append-only, cryptographically signed execution manifests to satisfy regulatory compliance requirements across clinical and technical domains.",
    codeSnippet: `{
  "manifestVersion": "1.0",
  "workflowId": "clinical-consensus",
  "auditHash": "sha256:e3b0c44298fc1c149afbf4c89...",
  "signedBy": "PromptOps-AuditGuard-v2"
}`
  },
  {
    id: "docgen",
    category: "governance",
    title: "Automated DocGen",
    subtitle: "MkDocs & Markdown Generator",
    icon: <IconFileText className="w-5 h-5 text-zinc-300" />,
    specs: ["MkDocs Material", "OpenAPI Specifications", "Prompt Catalogs"],
    description: "Automatically generates readable documentation, schema reference manuals, and API catalogs directly from version-controlled prompt repositories.",
    codeSnippet: `$ promptops docgen --out docs/
[INFO] Parsed 12 prompt schemas
[INFO] Compiled MkDocs site structure in ./docs/site
[SUCCESS] Documentation build complete.`
  }
];

export const PromptOpsArchitectureDiagram: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"architecture" | "dag" | "validation" | "mcp">("architecture");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("dag-engine");
  const [simStep, setSimStep] = useState<number>(0);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const { playHover, playSubmit } = useAudio();
  const titleId = useId();

  const selectedNode = ARCHITECTURE_NODES.find((n) => n.id === selectedNodeId) || ARCHITECTURE_NODES[5];

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    if (typeof playHover === "function") playHover();
  };

  const runSim = () => {
    if (typeof playSubmit === "function") playSubmit();
    setSimRunning(true);
    setSimStep(1);
    const timer1 = setTimeout(() => setSimStep(2), 1000);
    const timer2 = setTimeout(() => setSimStep(3), 2000);
    const timer3 = setTimeout(() => {
      setSimStep(4);
      setSimRunning(false);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden my-8">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-cyan">
              Framework Architecture & Interactive Engine
            </span>
          </div>
          <h3 id={titleId} className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
            PromptOps Systems Architecture
          </h3>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab("architecture");
              if (typeof playHover === "function") playHover();
            }}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "architecture"
                ? "bg-zinc-950 text-brand-cyan border border-brand-cyan/30 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Diagram &amp; Inspector
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("dag");
              if (typeof playHover === "function") playHover();
            }}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "dag"
                ? "bg-zinc-950 text-brand-cyan border border-brand-cyan/30 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            DAG Workflow Engine
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("validation");
              if (typeof playHover === "function") playHover();
            }}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "validation"
                ? "bg-zinc-950 text-brand-cyan border border-brand-cyan/30 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            2-Pass Validation
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("mcp");
              if (typeof playHover === "function") playHover();
            }}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "mcp"
                ? "bg-zinc-950 text-brand-cyan border border-brand-cyan/30 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            MCP Tool Server
          </button>
        </div>
      </div>

      {/* TAB 1: ARCHITECTURE DIAGRAM & INSPECTOR */}
      {activeTab === "architecture" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Layer Flow Diagram */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Layer 1: Interfaces */}
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-3.5 space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <IconStack2 className="w-3.5 h-3.5 text-brand-cyan" />
                Layer 1: Developer Interfaces
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ARCHITECTURE_NODES.filter((n) => n.category === "interface").map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleSelectNode(node.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-zinc-900 border-brand-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-brand-cyan/50"
                          : "bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        {node.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold font-mono truncate">{node.title}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{node.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connecting Flow Arrow */}
            <div className="flex items-center justify-center -my-2 z-10">
              <div className="bg-zinc-900 border border-zinc-800 rounded-full p-1 text-brand-cyan">
                <IconArrowRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Layer 2: Core Engine */}
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-3.5 space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <IconCpu className="w-3.5 h-3.5 text-amber-400" />
                Layer 2: Core PromptOps Execution Engine
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ARCHITECTURE_NODES.filter((n) => n.category === "engine").map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleSelectNode(node.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-zinc-900 border-brand-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-brand-cyan/50"
                          : "bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        {node.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold font-mono truncate">{node.title}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{node.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connecting Flow Arrow */}
            <div className="flex items-center justify-center -my-2 z-10">
              <div className="bg-zinc-900 border border-zinc-800 rounded-full p-1 text-emerald-400">
                <IconArrowRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Layer 3: Interoperability & Governance */}
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-3.5 space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <IconShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Layer 3: Interoperability, Governance &amp; Audit
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {ARCHITECTURE_NODES.filter((n) => n.category === "governance").map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleSelectNode(node.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-zinc-900 border-brand-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-brand-cyan/50"
                          : "bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        {node.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold font-mono truncate">{node.title}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{node.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Inspector Drawer */}
          <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                  {selectedNode.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">{selectedNode.title}</h4>
                  <p className="text-[11px] text-zinc-400">{selectedNode.subtitle}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 uppercase font-bold">
                {selectedNode.category}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {selectedNode.description}
            </p>

            {/* Specifications */}
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider mb-2 block">
                Technical Specifications &amp; Contracts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.specs.map((spec, i) => (
                  <span key={i} className="text-[10px] font-mono text-zinc-300 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-md">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Code Snippet Box */}
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider mb-2 block">
                Source Snippet Preview
              </span>
              <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed scrollbar-none">
                <code>{selectedNode.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAG WORKFLOW ENGINE DEMO */}
      {activeTab === "dag" && (
        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <IconGitBranch className="w-5 h-5 text-brand-cyan" />
                  Clinical Consensus Arbitration DAG Execution
                </h4>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Topological Step Dispatcher with state propagation and tool call stubs
                </p>
              </div>

              <button
                type="button"
                onClick={runSim}
                disabled={simRunning}
                className="px-4 py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <IconPlayerPlay className="w-4 h-4" />
                {simRunning ? "Executing Pipeline..." : "Run Simulated Execution"}
              </button>
            </div>

            {/* Visual DAG Nodes Chain */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-6 relative">
              {/* Step 1 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simStep >= 1 ? "bg-zinc-900 border-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white" : "bg-zinc-950/80 border-zinc-800 text-zinc-400"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-brand-cyan font-bold">STEP 1</span>
                  {simStep >= 1 && <IconCheck className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold font-mono">parse_protocol</div>
                <p className="text-[10px] text-zinc-400 mt-1">Extract study criteria &amp; endpoints</p>
              </div>

              {/* Step 2 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simStep >= 2 ? "bg-zinc-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)] text-white" : "bg-zinc-950/80 border-zinc-800 text-zinc-400"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">STEP 2</span>
                  {simStep >= 2 && <IconCheck className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold font-mono">check_biosafety</div>
                <p className="text-[10px] text-zinc-400 mt-1">Query biosafety guidelines via MCP</p>
              </div>

              {/* Step 3 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simStep >= 3 ? "bg-zinc-900 border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.15)] text-white" : "bg-zinc-950/80 border-zinc-800 text-zinc-400"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-purple-400 font-bold">STEP 3</span>
                  {simStep >= 3 && <IconCheck className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold font-mono">arbitrate_consensus</div>
                <p className="text-[10px] text-zinc-400 mt-1">Multi-agent consensus voting</p>
              </div>

              {/* Step 4 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                simStep >= 4 ? "bg-zinc-900 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)] text-white" : "bg-zinc-950/80 border-zinc-800 text-zinc-400"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">STEP 4</span>
                  {simStep >= 4 && <IconCheck className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold font-mono">sign_audit</div>
                <p className="text-[10px] text-zinc-400 mt-1">Export signed audit manifest</p>
              </div>
            </div>

            {/* Execution Telemetry Log */}
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 font-mono text-xs">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-bold">
                DAG Runtime Console Telemetry
              </div>
              <div className="text-emerald-400 space-y-1">
                <div>[00:00.00] PromptOps DAG Engine Initialized (workflow_id: clinical-consensus-arbitration)</div>
                {simStep >= 1 && <div>[00:01.00] Step 1 COMPLETE: Extracted 14 protocol criteria from ODM-XML.</div>}
                {simStep >= 2 && <div>[00:02.00] Step 2 COMPLETE: Tool &apos;fda_regulations_query&apos; returned status 200 OK.</div>}
                {simStep >= 3 && <div>[00:03.00] Step 3 COMPLETE: 3 multi-agent voters reached 100% consensus agreement.</div>}
                {simStep >= 4 && <div>[00:04.00] Step 4 COMPLETE: Signed audit log written to compliance_manifest.json (SHA-256 verified).</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TWO-PASS VALIDATION DEMO */}
      {activeTab === "validation" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                Pass 1: Raw Structural Schema Check
              </span>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/10">
                PASSED
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Validates raw YAML file structure against Draft-07 JSON Schema specs (prompt.schema.json, InputSchema.schema.json).
            </p>
            <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-[11px] font-mono text-zinc-300">
              <code>{`name: "consensus_arbitration"
domain: "clinical"
inputSchema:
  type: "object"
  required: ["protocol_id", "subject_data"]
modelParameters:
  temperature: 0.2
  maxTokens: 2048`}</code>
            </pre>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-brand-cyan uppercase">
                Pass 2: Rendered Jinja2 Macro Validation
              </span>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/10">
                PASSED
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Compiles Jinja2 macros (macros.j2) and asserts output type constraints, parameter boundaries, and variable substitutions.
            </p>
            <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-[11px] font-mono text-emerald-400">
              <code>{`[CHECK 1] macro 'clinical_system_prompt' compiled without syntax error.
[CHECK 2] variable 'protocol_id' successfully bound to 'BRIGHT-01'.
[CHECK 3] output tokens bounded strictly to <= 2048 limit.`}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: MCP TOOL SERVER DEMO */}
      {activeTab === "mcp" && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <IconServer className="w-4 h-4 text-blue-400" />
                Model Context Protocol (MCP) Tool Server (mcp_server.py)
              </h4>
              <p className="text-xs text-zinc-400">Exposing PromptOps prompt engineering &amp; workflow orchestration to MCP clients</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md font-bold self-start sm:self-auto">
              MCP PROTOCOL 2024-11-05 READY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="text-xs font-bold text-brand-cyan font-mono mb-1">mcp_validate_prompt</div>
              <p className="text-[11px] text-zinc-400">Validates external prompt YAML payloads against Draft-07 schemas.</p>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="text-xs font-bold text-amber-400 font-mono mb-1">mcp_execute_workflow</div>
              <p className="text-[11px] text-zinc-400">Dispatches multi-agent DAG pipelines and returns validated JSON.</p>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="text-xs font-bold text-emerald-400 font-mono mb-1">mcp_audit_log</div>
              <p className="text-[11px] text-zinc-400">Generates signed compliance manifests and gap inspection reports.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
