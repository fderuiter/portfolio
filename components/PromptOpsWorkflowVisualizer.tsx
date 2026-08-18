"use client";

import React, { useState } from "react";
import {
  IconGitBranch,
  IconCode,
  IconCheck,
  IconShieldCheck,
  IconServer,
  IconPlayerPlay,
  IconTerminal,
  IconFileCode,
  IconLockCheck,
} from "@tabler/icons-react";

type ActiveTab = "workflow" | "jinja2" | "schema" | "mcp" | "audit";

interface DAGNode {
  id: string;
  label: string;
  role: string;
  status: "idle" | "running" | "completed";
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  tools: string[];
}

const DAG_NODES: DAGNode[] = [
  {
    id: "step_1_extract",
    label: "1. Clinical Context Extraction",
    role: "Jinja2 Macro Ingestion",
    status: "completed",
    inputs: { trial_id: "BRIGHT-01", subject_key: "SUB-123", raw_notes: "Patient reports grade 2 nausea post infusion." },
    outputs: { clinical_entity: "AdverseEvent", severity: "Grade 2", codelist_term: "Nausea" },
    tools: ["ncbi_mesh_lookup"],
  },
  {
    id: "step_2_verify",
    label: "2. Regulatory Safety Verification",
    role: "2-Pass Draft-07 Validation",
    status: "completed",
    inputs: { clinical_entity: "AdverseEvent", severity: "Grade 2" },
    outputs: { safety_verified: "TRUE", fda_category: "Expected AE", review_required: "FALSE" },
    tools: ["fda_orange_book", "cdisc_ct_validator"],
  },
  {
    id: "step_3_arbitrate",
    label: "3. Consensus Arbitration & Report",
    role: "Signed Governance Output",
    status: "completed",
    inputs: { safety_verified: "TRUE", fda_category: "Expected AE" },
    outputs: { arbitration_verdict: "APPROVED", compliance_status: "GxP Compliant", hash: "sha256-e91b402" },
    tools: ["mcp_audit_logger"],
  },
];

const JINJA2_TEMPLATE = `{% import 'macros.j2' as macros %}

{{ macros.system_prompt(domain='clinical', strict_json=true) }}

User Query: Analyze clinical subject {{ subject_key }} in study {{ trial_id }}.
Context Notes: {{ raw_notes }}

{{ macros.output_guardrail(schema_name='ClinicalObservation') }}`;

const JINJA2_COMPILED = `{
  "system": "You are a regulatory-compliant AI agent operating under FDA 21 CFR Part 11 and GxP standards. Output strict Draft-07 JSON matching ClinicalObservation schema.",
  "messages": [
    { "role": "user", "content": "Analyze clinical subject SUB-123 in study BRIGHT-01. Context Notes: Patient reports grade 2 nausea post infusion." }
  ],
  "response_format": { "type": "json_object", "schema": "schemas/ClinicalObservation.schema.json" }
}`;

const DRAFT_07_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ClinicalObservation",
  "type": "object",
  "required": ["subject_id", "study_id", "observation_type", "severity_grade"],
  "properties": {
    "subject_id": { "type": "string", "pattern": "^SUB-\\\\d+$" },
    "study_id": { "type": "string" },
    "observation_type": { "type": "string", "enum": ["AdverseEvent", "VitalSign", "LabValue"] },
    "severity_grade": { "type": "string", "enum": ["Grade 1", "Grade 2", "Grade 3", "Grade 4"] }
  },
  "additionalProperties": false
}`;

const MCP_SERVER_SPEC = `{
  "mcpVersion": "1.0",
  "serverName": "promptops-mcp-server",
  "tools": [
    {
      "name": "promptops_validate",
      "description": "Execute 2-pass Draft-07 schema and Jinja2 macro validation",
      "inputSchema": { "type": "object", "properties": { "template_path": { "type": "string" } } }
    },
    {
      "name": "promptops_run_dag",
      "description": "Orchestrate multi-agent workflow graph with topological sort",
      "inputSchema": { "type": "object", "properties": { "workflow_path": { "type": "string" } } }
    }
  ]
}`;

const SIGNED_AUDIT_MANIFEST = `{
  "manifestVersion": "2026.1",
  "executionId": "exec_20260814_0091",
  "workflow": "workflows/clinical/consensus_arbitration.workflow.yaml",
  "timestamp": "2026-08-14T12:00:00Z",
  "dagNodesEvaluated": 3,
  "schemaValidation": "100% PASS (Draft-07)",
  "signatureAlgorithm": "RSA-PSS-SHA256",
  "signedByKeyId": "key_fda_compliance_2026",
  "signature": "MEQCIG9f5k2Z...[RSA-PSS-2048-BIT-PROOF]...a9f4c32b810e"
}`;

export const PromptOpsWorkflowVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("workflow");
  const [selectedNode, setSelectedNode] = useState<string>("step_1_extract");
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simStep, setSimStep] = useState<number>(3);

  const handleRunSimulation = () => {
    setIsRunningSim(true);
    setSimStep(0);
    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= 2) {
          clearInterval(interval);
          setIsRunningSim(false);
          return 3;
        }
        return prev + 1;
      });
    }, 600);
  };

  const currentNodeObj = DAG_NODES.find((n) => n.id === selectedNode) || DAG_NODES[0];

  return (
    <div className="my-8 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl text-neutral-200">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-cyan">
              PromptOps Engine Playground
            </span>
          </div>
          <h3 className="text-xl font-bold font-sans text-neutral-100">
            Interactive Workflow Orchestration &amp; Governance
          </h3>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isRunningSim}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/20 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
        >
          <IconPlayerPlay className={`w-4 h-4 ${isRunningSim ? "animate-spin" : ""}`} />
          <span>{isRunningSim ? "Executing DAG Pipeline..." : "Run Simulated DAG Pipeline"}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950/80 border border-zinc-800/80 rounded-xl mb-6 text-xs font-mono">
        <button
          onClick={() => setActiveTab("workflow")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "workflow"
              ? "bg-zinc-850 text-brand-cyan border border-brand-cyan/30 font-bold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconGitBranch className="w-4 h-4" />
          <span>DAG Workflow</span>
        </button>

        <button
          onClick={() => setActiveTab("jinja2")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "jinja2"
              ? "bg-zinc-850 text-brand-cyan border border-brand-cyan/30 font-bold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconCode className="w-4 h-4" />
          <span>Jinja2 Macro Engine</span>
        </button>

        <button
          onClick={() => setActiveTab("schema")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "schema"
              ? "bg-zinc-850 text-brand-cyan border border-brand-cyan/30 font-bold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconCheck className="w-4 h-4" />
          <span>Draft-07 Schema Validator</span>
        </button>

        <button
          onClick={() => setActiveTab("mcp")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "mcp"
              ? "bg-zinc-850 text-brand-cyan border border-brand-cyan/30 font-bold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconServer className="w-4 h-4" />
          <span>MCP Server Tools</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "audit"
              ? "bg-zinc-850 text-brand-cyan border border-brand-cyan/30 font-bold shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconShieldCheck className="w-4 h-4" />
          <span>Signed Audit Trail</span>
        </button>
      </div>

      {/* Tab 1: DAG Workflow execution visualizer */}
      {activeTab === "workflow" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DAG_NODES.map((node, index) => {
              const isSelected = selectedNode === node.id;
              const isCompleted = simStep >= index + 1;
              const isCurrentSim = simStep === index && isRunningSim;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-zinc-950 border-brand-cyan/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                      : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      {node.role}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                        isCurrentSim
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse"
                          : isCompleted
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {isCurrentSim ? "EXECUTING" : isCompleted ? "PASSED" : "IDLE"}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-neutral-100 truncate">{node.label}</h4>

                  <div className="mt-2 pt-2 border-t border-zinc-900/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Tools: {node.tools.length}</span>
                    <span className="text-brand-cyan">Click to Inspect ▸</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Node Inspector */}
          <div className="p-4 bg-black/60 border border-zinc-850 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-mono font-bold text-brand-cyan flex items-center gap-1.5">
                <IconTerminal className="w-4 h-4" />
                Step State Inspector: {currentNodeObj.id}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Topological Order Position
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">
                  Context Inputs (Upstream State)
                </span>
                <pre className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-emerald-400 text-[11px] overflow-x-auto">
                  {JSON.stringify(currentNodeObj.inputs, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">
                  Validated Outputs (Downstream Context)
                </span>
                <pre className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-brand-cyan text-[11px] overflow-x-auto">
                  {JSON.stringify(currentNodeObj.outputs, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Jinja2 Macro Compiler */}
      {activeTab === "jinja2" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between bg-zinc-950 p-2.5 border-t border-x border-zinc-800 rounded-t-xl text-zinc-400">
              <span className="flex items-center gap-1.5 font-bold text-neutral-200">
                <IconFileCode className="w-4 h-4 text-amber-400" />
                Raw Jinja2 Template (.prompt.yaml)
              </span>
              <span className="text-[10px] text-amber-400">macros.j2 imported</span>
            </div>
            <pre className="p-3 bg-black/80 border border-zinc-800 rounded-b-xl text-amber-200/90 text-[11px] leading-relaxed overflow-x-auto h-[240px]">
              {JINJA2_TEMPLATE}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between bg-zinc-950 p-2.5 border-t border-x border-zinc-800 rounded-t-xl text-zinc-400">
              <span className="flex items-center gap-1.5 font-bold text-neutral-200">
                <IconCheck className="w-4 h-4 text-emerald-400" />
                Compiled Prompt Payload
              </span>
              <span className="text-[10px] text-emerald-400">Macro Substituted</span>
            </div>
            <pre className="p-3 bg-black/80 border border-zinc-800 rounded-b-xl text-emerald-300 text-[11px] leading-relaxed overflow-x-auto h-[240px]">
              {JINJA2_COMPILED}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Draft-07 Schema Validator */}
      {activeTab === "schema" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
            <span className="text-neutral-200 font-bold flex items-center gap-2">
              <IconCheck className="w-4 h-4 text-brand-cyan" />
              Draft-07 JSON Schema Contract (ClinicalObservation.schema.json)
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan rounded">
              2-Pass Validation: PASS
            </span>
          </div>
          <pre className="p-4 bg-black/80 border border-zinc-800 rounded-xl text-cyan-300 text-[11px] leading-relaxed overflow-x-auto max-h-[260px]">
            {DRAFT_07_SCHEMA}
          </pre>
        </div>
      )}

      {/* Tab 4: MCP Tool Server */}
      {activeTab === "mcp" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
            <span className="text-neutral-200 font-bold flex items-center gap-2">
              <IconServer className="w-4 h-4 text-indigo-400" />
              Model Context Protocol (MCP) Server Registry Specification
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded">
              Protocol v1.0 / SSE
            </span>
          </div>
          <pre className="p-4 bg-black/80 border border-zinc-800 rounded-xl text-indigo-300 text-[11px] leading-relaxed overflow-x-auto max-h-[260px]">
            {MCP_SERVER_SPEC}
          </pre>
        </div>
      )}

      {/* Tab 5: Signed Cryptographic Audit Trail */}
      {activeTab === "audit" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
            <span className="text-neutral-200 font-bold flex items-center gap-2">
              <IconLockCheck className="w-4 h-4 text-emerald-400" />
              Cryptographic Audit Manifest (compliance_manifest.json)
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded flex items-center gap-1">
              <IconShieldCheck className="w-3.5 h-3.5" />
              RSA-PSS Signature Valid
            </span>
          </div>
          <pre className="p-4 bg-black/80 border border-zinc-800 rounded-xl text-emerald-300 text-[11px] leading-relaxed overflow-x-auto max-h-[260px]">
            {SIGNED_AUDIT_MANIFEST}
          </pre>
        </div>
      )}
    </div>
  );
};
