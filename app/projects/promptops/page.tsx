import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PromptOpsArchitectureDiagram } from "@/components/PromptOpsArchitectureDiagram";
import { SandboxTerminal } from "@/components/SandboxTerminal";
import { PROMPTOPS_COMMANDS_OBJ, PROMPTOPS_PLAYBACK_OBJ } from "@/lib/case-studies-data";
import { resolveBaseUrl } from "@/lib/domain";
import {
  IconTerminal,
  IconBrandPython,
  IconCpu,
  IconShieldCheck,
  IconGitBranch,
  IconServer,
  IconLayoutDashboard,
  IconFileCode,
  IconExternalLink,
  IconCheck,
} from "@tabler/icons-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "PromptOps: AI Prompt Engineering & Workflow Orchestration | Case Study",
  description: "Schema-driven, enterprise-grade AI prompt engineering, multi-agent LLM DAG orchestration, Model Context Protocol (MCP) tool server, and signed compliance audit trails.",
  alternates: {
    canonical: "/projects/promptops",
  },
  openGraph: {
    title: "PromptOps: AI Prompt Engineering & Workflow Orchestration",
    description: "Enterprise-grade prompt engineering, multi-agent LLM DAG orchestration, Model Context Protocol (MCP) tooling, and signed compliance audit trails.",
    type: "article",
    url: `${resolveBaseUrl()}/projects/promptops`,
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptOps: AI Prompt Engineering & Workflow Orchestration",
    description: "Enterprise-grade prompt engineering, multi-agent LLM DAG orchestration, Model Context Protocol (MCP) tooling, and signed compliance audit trails.",
  },
};

const NAV_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "workflow-engine", label: "Workflow Engine" },
  { id: "schema-validation", label: "Schema Validation" },
  { id: "mcp-tooling", label: "MCP Tooling" },
  { id: "governance", label: "Governance" },
];

export default function PromptOpsProjectPage() {
  const tags = [
    "Python",
    "LLMOps",
    "Model Context Protocol",
    "Streamlit",
    "Pydantic",
    "JSON Schema",
  ];

  return (
    <PageLayout variant="standard" className="py-24 md:py-32 bg-zinc-950 text-foreground outline-none">
      {/* Ambient background glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-80 h-80 rounded-full bg-brand-blue/5 blur-[160px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Case Studies", href: "/case-studies" },
              { label: "PromptOps Framework" },
            ]}
          />
        </div>

        {/* Section Navigation Sticky Bar */}
        <nav
          aria-label="PromptOps Section Navigation"
          className="sticky top-20 z-30 mb-8 py-2 px-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl flex max-w-full overflow-x-auto gap-2 scrollbar-none"
        >
          {NAV_SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="px-3 py-1.5 text-xs font-mono font-bold text-zinc-300 hover:text-brand-cyan transition-colors whitespace-nowrap rounded-lg hover:bg-zinc-950/60"
            >
              {sec.label}
            </a>
          ))}
        </nav>

        {/* Header Block */}
        <header className="mb-12 border-b border-zinc-900 pb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-mono font-bold bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan rounded-md flex items-center gap-1.5">
              <IconBrandPython className="w-4 h-4" />
              Python 3.10+ Framework
            </span>
            <span className="px-3 py-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              Model Context Protocol (MCP)
            </span>
            <span className="px-3 py-1 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md">
              2-Pass Schema Validation
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-sans tracking-tight mb-4 leading-tight">
            PromptOps: Schema-Driven AI Prompt Engineering &amp; Multi-Agent Orchestration
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-sans leading-relaxed max-w-3xl mb-6">
            An open-source, production-grade prompt engineering framework and multi-agent workflow orchestration engine. PromptOps applies standard software engineering rigor—including schema validation, continuous testing, signed audit trails, and version-controlled declarative DAGs—to generative AI workflows.
          </p>

          {/* Links & Repository CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/fderuiter/PromptOps"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 hover:border-brand-cyan/50 text-white rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2"
            >
              <IconExternalLink className="w-4 h-4 text-brand-cyan" />
              View Source Repository on GitHub
            </a>
            <Link
              href="/case-studies/promptops"
              className="px-4 py-2.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2"
            >
              <IconFileCode className="w-4 h-4" />
              Read Full Case Study
            </Link>
          </div>

          {/* Feature Tags Row */}
          <div className="flex flex-wrap gap-2 mt-8">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-mono text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* SECTION 1: OVERVIEW & ARCHITECTURE SUMMARY */}
        <section id="overview" className="scroll-mt-32 mb-16 space-y-6">
          <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-2">
            <IconCpu className="w-6 h-6 text-brand-cyan" />
            System Overview &amp; Key Architectural Pillars
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2">
              <h3 className="text-sm font-bold font-mono text-brand-cyan flex items-center gap-2">
                <IconShieldCheck className="w-4 h-4" />
                1. Schema-First Declarative Prompts
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                All prompts (<code>.prompt.yaml</code>) and workflows (<code>.workflow.yaml</code>) conform strictly to Draft-07 JSON Schemas. Two-pass validation enforces structural checks and rendered Jinja2 macro type constraints prior to execution.
              </p>
            </div>

            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2">
              <h3 className="text-sm font-bold font-mono text-amber-400 flex items-center gap-2">
                <IconGitBranch className="w-4 h-4" />
                2. Directed Acyclic Graph (DAG) Engine
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Orchestrates multi-step agentic pipelines with topological execution, state propagation, and dry-run mocking for regulated domain workflows (clinical, biosafety, regulatory gap analysis).
              </p>
            </div>

            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2">
              <h3 className="text-sm font-bold font-mono text-blue-400 flex items-center gap-2">
                <IconServer className="w-4 h-4" />
                3. Model Context Protocol (MCP) Integration
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Integrated Model Context Protocol server (<code>mcp_server.py</code>) exposing prompt libraries and workflow engines as standardized MCP tools to external AI clients.
              </p>
            </div>

            <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2">
              <h3 className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-2">
                <IconLayoutDashboard className="w-4 h-4" />
                4. Dual Developer Experience (CLI &amp; Studio)
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                CLI powered by Typer/Rich alongside a multi-page Streamlit Visual Studio for prompt editing, visual workflow editing, simulation monitoring, and direct Git sync.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE ARCHITECTURE FLOW DIAGRAM */}
        <section id="architecture" className="scroll-mt-32 mb-16">
          <PromptOpsArchitectureDiagram />
        </section>

        {/* SECTION 3: WORKFLOW ENGINE DEEP DIVE */}
        <section id="workflow-engine" className="scroll-mt-32 mb-16 space-y-6">
          <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-2">
            <IconGitBranch className="w-6 h-6 text-brand-cyan" />
            DAG Workflow Orchestration Engine
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed font-sans">
            PromptOps orchestrates complex multi-agent reasoning chains using explicit Directed Acyclic Graphs (DAGs). Execution steps declare required context inputs, tool call bindings, and downstream edges. The runtime dispatcher topologically orders tasks, ensuring deterministic data passing and sandboxed simulation dry-runs without live API overhead.
          </p>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold font-mono text-white">Pre-Configured Domain Workflows</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                <span className="text-xs font-bold text-brand-cyan font-mono block mb-1">Clinical Consensus</span>
                <p className="text-[11px] text-zinc-400">Arbitrates clinical trial safety findings and protocol deviations across medical domain agent voters.</p>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                <span className="text-xs font-bold text-amber-400 font-mono block mb-1">Biological Safety</span>
                <p className="text-[11px] text-zinc-400">Verifies gene sequence requests against dual-use pathogen registries and biosecurity constraints.</p>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                <span className="text-xs font-bold text-emerald-400 font-mono block mb-1">Regulatory Gap Analysis</span>
                <p className="text-[11px] text-zinc-400">Audits submission dossiers against FDA guidance and CDISC controlled terminology standards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: SCHEMA VALIDATION & JINJA2 COMPILER */}
        <section id="schema-validation" className="scroll-mt-32 mb-16 space-y-6">
          <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-2">
            <IconShieldCheck className="w-6 h-6 text-amber-400" />
            Schema Validation &amp; Jinja2 Macro Engine
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold font-mono text-amber-400">Strict Draft-07 JSON Schema Contracts</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                PromptOps guarantees that model inputs and output structures conform strictly to formal Draft-07 JSON Schemas. If a model output deviates from expected key constraints or data types, the runtime catches the discrepancy immediately.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300 font-mono">
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-400" />
                  <code>prompt.schema.json</code>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-400" />
                  <code>workflow.schema.json</code>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-400" />
                  <code>InputSchema.schema.json</code>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-400" />
                  <code>ModelParameters.schema.json</code>
                </li>
              </ul>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold font-mono text-brand-cyan">Jinja2 Macro Compilation Engine</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Modular Jinja2 template components (<code>macros.j2</code>) eliminate copy-paste prompt duplication. Common reasoning formats, system personas, and safety boundaries are imported dynamically into prompt templates.
              </p>
              <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                <code>{`{% import 'macros.j2' as macros %}

{{ macros.system_role("clinical_auditor") }}
{{ macros.chain_of_thought_guard() }}

Protocol ID: {{ input.protocol_id }}`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* SECTION 5: MODEL CONTEXT PROTOCOL (MCP) TOOLING */}
        <section id="mcp-tooling" className="scroll-mt-32 mb-16 space-y-6">
          <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-2">
            <IconServer className="w-6 h-6 text-blue-400" />
            Model Context Protocol (MCP) Integration
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed font-sans">
            PromptOps natively implements the Anthropic Model Context Protocol (MCP) standard via <code>mcp_server.py</code>. External clients (such as Claude Desktop or custom agents) can inspect prompt specs, execute workflow graphs, and validate tool parameters in real time over standard JSON-RPC protocol transport.
          </p>
        </section>

        {/* SECTION 6: GOVERNANCE & CRYPTOGRAPHIC AUDITING */}
        <section id="governance" className="scroll-mt-32 mb-16 space-y-6">
          <h2 className="text-2xl font-bold text-white font-sans flex items-center gap-2">
            <IconFileCode className="w-6 h-6 text-emerald-400" />
            Compliance, Governance &amp; Signed Audit Trails
          </h2>

          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
            <p className="text-sm text-zinc-300 leading-relaxed">
              In regulated industries (FDA, CDISC, GxP), executing generative LLM prompts requires immutable proof of execution parameters and output integrity. PromptOps automatically generates cryptographically signed audit manifests (<code>compliance_manifest.json</code>) detailing full template inputs, schema hashes, tool call signatures, and execution timestamps.
            </p>

            {/* Interactive CLI Terminal Shell */}
            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-base font-bold font-sans text-neutral-100 mb-3 flex items-center gap-2">
                <IconTerminal className="w-5 h-5 text-brand-cyan" />
                PromptOps CLI Terminal Sandbox
              </h3>
              <p className="text-xs font-mono text-zinc-400 mb-4">
                Test CLI commands for project initialization, two-pass validation, DAG execution, and MCP server startup:
              </p>
              <SandboxTerminal commands={PROMPTOPS_COMMANDS_OBJ} playback={PROMPTOPS_PLAYBACK_OBJ} slug="promptops" />
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
