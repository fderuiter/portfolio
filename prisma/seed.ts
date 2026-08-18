import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/client";
import ws from "ws";
import { scanFile, scanText } from "../lib/validation-scanner";
import { IMEDNET_COMMANDS_OBJ, IMEDNET_PLAYBACK_OBJ } from "../lib/case-studies-data";
import { compileTerms } from "../lib/term-compiler";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const SEED_PAYLOADS = [
  {
    slug: "schemaflow",
    title: "SchemaFlow: Reactive Node Engine for Schema Composition",
    primary_language: "TypeScript",
    github_url: "https://github.com/fderuiter/SchemaFlow",
    published: true,
    simulated_telemetry: false,
    tags: "TypeScript, React, Flow, Schemas, AST, Node-RED",
    editorial_content: "A **reactive**, `visual graph editor` built in **TypeScript** and **React** that allows system architects to visually compose, validate, and compile complex `JSON Schema` structures in real time. Features highly responsive `node evaluation`, cyclical dependency detection, and live `code generation`.",
    architectural_narrative: `
<h3>The Challenge</h3>
<p>Modern enterprise APIs often require complex, deeply nested JSON schemas. Hand-authoring these schemas in raw JSON or YAML leads to validation errors, duplicate definitions, and slow developer velocity. Visual graph editors exist, but they suffer from high rendering latency, lacks type-safety, and do not handle recursive schema references gracefully.</p>

<h3>The Architecture</h3>
<p>SchemaFlow is designed around a decoupled three-tier system: the <strong>Graph State Core</strong>, the <strong>Abstract Syntax Tree (AST) Compiler</strong>, and the <strong>Canvas Render Engine</strong>.</p>

<pre><code class="language-typescript">
// Graph State Management
interface SchemaNode {
  id: string;
  type: "string" | "number" | "object" | "array" | "ref";
  properties: Record&lt;string, any&gt;;
  position: { x: number; y: number };
}
</code></pre>

<h4>1. Immutable Graph State Core</h4>
<p>The state is modeled as a Directed Acyclic Graph (DAG) using a customized Zustand store. Every node represents a schema primitive or block. Connections between nodes represent references (e.g., matching a child field node to a parent object node). To ensure zero UI lagging, state selections are strictly memoized, and computed derived values (like the compiled JSON schema) are debounced and offloaded to a Web Worker.</p>

<h4>2. Cyclical Dependency Detection</h4>
<p>When a developer links nodes, SchemaFlow runs a depth-first search (DFS) algorithm across the active nodes. If a path returns to an ancestor node, a cyclic reference is flagged. Rather than crashing, the compiler safely inserts a <code>$ref</code> definition inside the JSON Schema AST to support recursive definitions (like a folder containing files and other folders) without entering infinite compile loops.</p>

<h4>3. The AST Compiler</h4>
<p>When state is pushed, the compiler resolves node connections into a unified AST. It then generates valid <strong>JSON Schema Draft-07</strong> or <strong>OpenAPI v3</strong> specs. The entire compilation runs in an isolated context, returning a structured output that can be directly copy-pasted or pushed to a schema registry.</p>
    `.trim(),
  },
  {
    slug: "clinical-data-mapper",
    title: "Clinical Data Standards Engine: CDISC ODM and SDTM Integration",
    primary_language: "TypeScript",
    github_url: "https://github.com/fderuiter/clinical-data-mapper",
    published: true,
    simulated_telemetry: false,
    tags: "TypeScript, CDISC, ODM, SDTM, XML Parser, Clinical Trials, HIPAA",
    editorial_content: "An enterprise-grade **TypeScript** mapping pipeline that ingests clinical trial metadata in `CDISC Operational Data Model (ODM)` XML format, dynamically constructs `data schemas`, and transforms raw `Electronic Data Capture (EDC)` datasets into compliant **CDISC SDTM** domains.",
    architectural_narrative: `
<h3>The Challenge</h3>
<p>Clinical trial databases are governed by rigid international regulatory standards set by CDISC. Review bodies like the FDA require trial findings to be submitted as SDTM datasets. The incoming trial data, however, arrives in XML-based CDISC ODM format or proprietary EDC database tables. Manual mapping is error-prone, highly slow, and compromises regulatory compliance.</p>

<h3>Technical Architecture</h3>
<p>The pipeline consists of a streaming XML parser, an intermediary canonical schema engine, and a declarative SDTM compiler.</p>

<pre><code class="language-typescript">
// Parsing CDISC ODM Metadata structures
interface ODMClinicalData {
  studyOID: string;
  metaDataVersionOID: string;
  subjectData: {
    subjectKey: string;
    studyEventData: {
      studyEventOID: string;
      formData: {
        formOID: string;
        itemGroupData: {
          itemGroupOID: string;
          itemData: { itemOID: string; value: string }[];
        }[];
      }[];
    }[];
  }[];
}
</code></pre>

<h4>1. Streaming XML Parser (ODM Ingestion)</h4>
<p>Clinical metadata XML files can exceed 2GB. Standard DOM parsers exhaust server memory immediately. Our parser uses a Node.js streaming SAX parser (via <code>sax-js</code>) wrapped in TypeScript generators. The pipeline streams XML tags, compiles them into typed OIDs (Object Identifiers), and writes tabular representations directly to SQLite streams, keeping memory usage constant under 50MB.</p>

<h4>2. Dynamic Schema Synthesizer</h4>
<p>ODM files specify exactly what forms were shown, what questions were asked, and what data types were captured (e.g. text, integer, codelist). The Schema Synthesizer reads the ODM <code>MetaDataVersion</code> and dynamically generates validation classes using <code>zod</code>. If the clinical protocol changes (e.g. adding a new adverse event category), the system automatically updates its schema dynamically.</p>

<h4>3. The SDTM Domain Compiler</h4>
<p>Transforms the captured values into structured SDTM domains like **DM (Demographics)**, **AE (Adverse Events)**, or **VS (Vital Signs)**. We implement a declarative mapping language written in TypeScript:
- Matches subject parameters across Study Events.
- Computes standard SDTM columns like <code>AESEV</code> (Adverse Event Severity) and <code>AESTDY</code> (Adverse Event Study Day).
- Validates constraints against CDISC Controlled Terminology vocabularies.</p>
    `.trim(),
  },
  {
    slug: "imednet-python-sdk",
    title: "iMednet Python SDK: Clinical Trial Data Integration Client",
    primary_language: "Python",
    github_url: "https://github.com/fderuiter/imednet-python-sdk",
    published: true,
    simulated_telemetry: false,
    tags: "Python, SDK, iMednet, API Client, Clinical Trials, HIPAA, Clinical Data",
    commands_json: JSON.stringify(IMEDNET_COMMANDS_OBJ),
    playback_json: JSON.stringify(IMEDNET_PLAYBACK_OBJ),
    editorial_content: "A **robust**, fully-typed `Python SDK` client for programmatic extraction and integration of clinical trial metadata and patient records from the `iMednet EDC` platform. Built for **biostatisticians** and **clinical data engineers**.",
    architectural_narrative: `
<h3>The Challenge</h3>
<p>Clinical electronic data capture (EDC) systems, such as iMednet, hold highly sensitive patient records and complex clinical trial protocols. Programmatic extraction is required by biostatisticians, data scientists, and clinical engineers for automated reporting and analytical pipelines. However, traditional SOAP/REST endpoints in clinical platforms often lack modern developer ergonomics, proper type safety, and clear schema boundaries, exposing clinical workflows to integration bugs and HIPAA security risks.</p>

<h3>Technical Architecture</h3>
<p>The iMednet Python SDK bridges the gap between raw web APIs and modern scientific computing environments (such as Pandas and Jupyter). It is engineered around three core pillars: <strong>Type-Safe Data Contracts</strong>, <strong>HIPAA-Compliant Transport Layer</strong>, and a <strong>Tabular Compilation Engine</strong>.</p>

<pre><code class="language-python">
# Typed SDK API contract using Pydantic
from pydantic import BaseModel, Field
from typing import List, Optional

class SubjectRecord(BaseModel):
    subject_id: str = Field(..., alias="subjectID")
    status: str
    site_id: int = Field(..., alias="siteID")
    enrollment_date: Optional[str] = None
    records_count: int
</code></pre>

<h4>1. Declarative Type-Safe Contracts</h4>
<p>Every response returned by the SDK is validated against strict Pydantic v2 schemas at runtime. This guarantees that clinical data engineers are immediately alerted if the platform schema deviates from expected formats. By utilizing Python's native typing and generic bindings, the SDK offers IDE auto-completion and static analysis checks directly within VS Code or Jupyter Notebooks.</p>

<h4>2. Security-Hardened Transport Layer</h4>
<p>Under the hood, the SDK enforces TLS 1.3 encryption, automatic session token rotation, and localized payload decryption. To comply with HIPAA requirements, sensitive Patient Health Information (PHI) is isolated during transfer, preventing logs or intermediary cache layers from storing decrypted identifiers.</p>

<h4>3. Interactive Developer Sandbox</h4>
<p>To accelerate developer onboarding, the repository introduces an interactive CLI sandbox built directly into the portfolio. Systems engineers can test commands, inspect raw JSON schemas, and simulate error/empty responses in real time, accelerating integration time-to-market from weeks to minutes.</p>
    `.trim(),
  },
  {
    slug: "cadence-clinical",
    title: "Cadence Clinical: Protocol-Driven eCRF & Workflow Orchestrator",
    primary_language: "TypeScript",
    github_url: "https://github.com/fderuiter/cadence-clinical",
    published: true,
    simulated_telemetry: false,
    tags: "TypeScript, Next.js, eCRF, GxP, Clinical Trials, React, Zod, HIPAA",
    editorial_content: "A modern, **full-stack clinical trial orchestrator** built in **TypeScript** and **Next.js** that translates complex protocol schedules into dynamic, validated `eCRF workflows`. Implements cross-form edit checks, real-time query management, and immutable `audit trails` meeting **21 CFR Part 11** standards.",
    architectural_narrative: `
<h3>The Challenge</h3>
<p>Clinical trial protocols frequently change through mid-study amendments. Traditional Electronic Data Capture (EDC) systems lock study sites into rigid database schemas that require weeks of vendor engineering to update, creating operational friction, data lock delays, and regulatory audit vulnerabilities.</p>

<h3>Technical Architecture</h3>
<p>Cadence Clinical is engineered as a decoupled, reactive clinical trial orchestration platform: the <strong>Protocol Schedule Compiler</strong>, the <strong>Dynamic eCRF Synthesis Engine</strong>, and the <strong>21 CFR Part 11 Audit Log Pipeline</strong>.</p>

<pre><code class="language-typescript">
// Protocol-driven form validation and dynamic dependency resolution
interface StudyVisitSchema {
  visitId: string;
  protocolScheduleDay: number;
  forms: {
    formId: string;
    fields: Array<{
      fieldId: string;
      type: "text" | "numeric" | "codelist" | "date";
      validationRules: Array<{ expression: string; errorMessage: string }>;
    }>;
  }[];
}
</code></pre>

<h4>1. Dynamic eCRF Synthesis Engine</h4>
<p>Rather than hardcoding visit forms, Cadence dynamically constructs validated UI interfaces at runtime using <code>zod</code> and schema metadata. As coordinators navigate participant visits, dependent fields are resolved reactively (e.g. automatically prompting for SAE forms when high-grade adverse events are recorded).</p>

<h4>2. Cross-Form Real-Time Edit Checks</h4>
<p>To prevent data entry discrepancies before submission, the engine evaluates cross-form validation rules client-side with debounced worker threads. If a medication start date precedes informed consent, an instantaneous non-blocking query is raised for site coordinators.</p>

<h4>3. Immutable Audit Trails &amp; 21 CFR Part 11 Compliance</h4>
<p>Every field mutation, query resolution, and investigator electronic signature is cryptographically hashed and logged to an append-only audit trail, ensuring 100% compliance with FDA regulatory standards.</p>
    `.trim(),
  },
  {
    slug: "wedding-website",
    title: "The Nuptial Engine: Bespoke Event Portal & Guest Logistics",
    primary_language: "TypeScript",
    github_url: "https://github.com/fderuiter/wedding-website",
    published: true,
    simulated_telemetry: false,
    tags: "TypeScript, Next.js, React, TailwindCSS, Framer Motion, Logistics, RSVP",
    editorial_content: "A **bespoke event portal** and guest operations engine crafted in **Next.js** and **Framer Motion**. Features real-time multi-household `RSVP tracking`, interactive personalized travel timelines, accommodation logistics, and custom canvas physics animations built to survive zero-downtime family scrutiny.",
    architectural_narrative: `
<h3>The Challenge</h3>
<p>Off-the-shelf wedding websites are notoriously cookie-cutter, rigid, and cluttered with third-party tracking scripts. Coordinating multi-event logistics across multiple time zones—including rehearsal dinners, hotel blocks, dietary accommodations, and real-time RSVPs—demanded a high-craft, bespoke digital experience engineered with zero-downtime reliability.</p>

<h3>Technical Architecture</h3>
<p>The platform is designed around three architectural pillars: the <strong>Multi-Party RSVP State Machine</strong>, the <strong>Personalized Guest Timeline Engine</strong>, and the <strong>Hardware-Accelerated Canvas Presentation Layer</strong>.</p>

<pre><code class="language-typescript">
// Guest RSVP State Model
interface HouseholdRSVP {
  householdId: string;
  passcode: string;
  guests: Array<{
    guestId: string;
    fullName: string;
    attendingCeremony: boolean;
    attendingReception: boolean;
    dietaryRestrictions: string[];
  }>;
}
</code></pre>

<h4>1. Multi-Party RSVP State Machine</h4>
<p>Handles household groupings where one recipient can respond for their entire party without data conflicts. Backed by optimistic UI updates and localized transactional caching, the interface delivers instantaneous visual feedback even on congested mobile cellular networks.</p>

<h4>2. Interactive Guest Itinerary &amp; Logistics</h4>
<p>Guests receive contextual schedules customized to their specific invite group (e.g. bridal party vs general guests). Travel directions, hotel accommodations, and local recommendations are presented via interactive micro-animations and offline-accessible guides.</p>

<h4>3. Design Craft &amp; Canvas Physics</h4>
<p>Bespoke typography, smooth Framer Motion layout transitions, and subtle particle physics create a warm, unforgettable digital invitation that marries aesthetic beauty with rock-solid full-stack engineering.</p>
    `.trim(),
  },
  {
    slug: "polyglot-tsp",
    title: "Polyglot-TSP: Technical Breakdown & Portfolio Integration",
    primary_language: "Rust",
    github_url: "https://github.com/fderuiter/polyglot-tsp",
    published: true,
    simulated_telemetry: false,
    tags: "algorithms, benchmarking, compiler-toolchains, polyglot-architecture, combinatorial-optimization, Rust, Haskell, Verilog, Python, C++, Zig, Go, Ada, VHDL",
    editorial_content: "Cross-paradigm algorithmic benchmarking and verification of combinatorial optimization across **50+ programming languages**, evaluating how disparate memory models, type systems, runtime overheads, and hardware description semantics express brute-force Traveling Salesman Problem (TSP) solutions against $O(N!)$ space/time complexity bounds.",
    architectural_narrative: `
<h3>Executive Summary & Value Proposition</h3>
<p>Exploration of computational ergonomics, runtime tooling, and language design mechanics across 50+ programming languages. The platform establishes architectural rules for implementing identical combinatorial search algorithms with strict baseline verification across diverse compilation targets.</p>

<h3>Unified Interface & Driver Architecture</h3>
<p><code>scripts/run_all.py</code> acts as a compiler abstraction layer and process driver, mapping file extensions to compile and execute commands, abstracting invocation models across native executables, bytecode interpreters, and JVM/CLR/Wasm targets.</p>

<pre><code class="language-mermaid">
flowchart TD
    A[Test Matrix Dataset: test_cases.json] --&gt; B[Testing Orchestrator: scripts/run_all.py / unittest]
    B --&gt; C[Systems &amp; Compiled: C, C++, Rust, Zig, D, Go, Ada/SPARK]
    B --&gt; D[Functional &amp; Declarative: Haskell, OCaml, Scheme, Clojure, Erlang]
    B --&gt; E[Array &amp; Dynamic: APL, BQN, J, Python, Ruby, Julia, Lua]
    B --&gt; F[Hardware &amp; HDL: VHDL, Verilog]
    B --&gt; G[Legacy &amp; Esoteric: COBOL, Fortran, Modula-2, INTERCAL]
    C --&gt; H[Canonical Distance &amp; Route Validation]
    D --&gt; H
    E --&gt; H
    F --&gt; H
    G --&gt; H
    H --&gt; I[Standardized Verification: Distance 60 / 80 / 97]
</code></pre>

<h3>Key Technical Challenges & Code Comparison</h3>
<h4>Rust: Zero-Cost Abstractions & Memory Safety</h4>
<pre><code class="language-rust">
pub fn solve_tsp(matrix: &amp;[Vec&lt;u32&gt;]) -&gt; (u32, Vec&lt;usize&gt;) {
    let n = matrix.len();
    let mut cities: Vec&lt;usize&gt; = (1..n).collect();
    let mut min_cost = u32::MAX;
    let mut best_route = Vec::new();

    let mut permutations = Vec::new();
    heap_permute(&amp;mut cities, n - 1, &amp;mut permutations);

    for perm in permutations {
        let mut current_cost = matrix[0][perm[0]];
        for i in 0..perm.len() - 1 {
            current_cost += matrix[perm[i]][perm[i + 1]];
        }
        current_cost += matrix[perm[perm.len() - 1]][0];

        if current_cost &lt; min_cost {
            min_cost = current_cost;
            let mut full_route = vec![0];
            full_route.extend_from_slice(&amp;perm);
            full_route.push(0);
            best_route = full_route;
        }
    }
    (min_cost, best_route)
}
</code></pre>

<h4>Haskell: Lazy Stream Recursion & Immutable Sequence Unfolding</h4>
<pre><code class="language-haskell">
module TSP (solveTSP) where

import Data.List (permutations)

solveTSP :: [[Int]] -&gt; (Int, [Int])
solveTSP matrix =
  let n = length matrix
      cityIndices = [1 .. n - 1]
      allRoutes = [0 : p ++ [0] | p &lt;- permutations cityIndices]
      routeCost r = sum $ zipWith (\\a b -&gt; (matrix !! a) !! b) r (tail r)
      costs = map (\\r -&gt; (routeCost r, r)) allRoutes
  in foldl1 (\\acc@(c1, _) item@(c2, _) -&gt; if c2 &lt; c1 then item else acc) costs
</code></pre>

<h4>Verilog: Discrete Event Hardware Logic & Testbench Simulation</h4>
<pre><code class="language-verilog">
module tsp_solver #(
    parameter CITIES = 4
) (
    input wire clk,
    input wire reset,
    input wire start,
    output reg done,
    output reg [15:0] min_distance
);
    reg [2:0] state;
    localparam IDLE = 3'b000, COMPUTE = 3'b001, DONE = 3'b010;

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            state &lt;= IDLE;
            done &lt;= 1'b0;
            min_distance &lt;= 16'hFFFF;
        end else begin
            case (state)
                IDLE: if (start) state &lt;= COMPUTE;
                COMPUTE: begin
                    min_distance &lt;= 16'd80;
                    state &lt;= DONE;
                end
                DONE: done &lt;= 1'b1;
            endcase
        end
    end
endmodule
</code></pre>

<h3>Trade-Offs & Key Decisions</h3>
<p>1. <strong>Exhaustive Permutations ($O(N!)$) vs. Dynamic Programming / Heuristics ($O(N^2 2^N)$)</strong>: Prioritized strict brute-force permutation generation across all targets to maintain an identical baseline for syntactic and runtime execution comparisons across obscure and exotic paradigms.</p>

<p>2. <strong>Subprocess CLI Execution vs. Foreign Function Interface (FFI)</strong>: Chose process-level standard stream (stdout/stderr) assertion over C ABI bindings to accommodate non-standardized runtimes, HDL simulation pipelines (ghdl, iverilog), and legacy/esoteric environments (INTERCAL, COBOL, Modula-2).</p>
    `.trim(),
  },
];

async function main() {
  const startTime = Date.now();
  console.log("Seeding portfolio case studies...");

  // 1. Validate payload fields programmatically
  console.log("Checking active database seeding payload for credentials...");
  for (const payload of SEED_PAYLOADS) {
    const editorialMatches = scanText(payload.editorial_content);
    const narrativeMatches = scanText(payload.architectural_narrative);
    const combinedMatches = [...editorialMatches, ...narrativeMatches];

    if (combinedMatches.length > 0) {
      console.error(`❌ Credentials detected programmatically in seeding payload for "${payload.title}":`);
      for (const m of combinedMatches) {
        console.error(`  - Matched Category: [${m.category}] on relative line ${m.lineNumber}: "${m.matchedText}"`);
      }
      console.error("Seeding halted. Zero records were inserted into the database.");
      process.exit(1);
    }
  }

  // 2. Validate fallback files statically to ensure absolute line tracing is perfect
  const seedFile = path.resolve(process.cwd(), "prisma/seed.ts");
  const fallbackFile = path.resolve(process.cwd(), "app/page.tsx");

  console.log("Scanning seed file and fallback configurations...");
  const seedMatches = scanFile(seedFile);
  const fallbackMatches = scanFile(fallbackFile);

  // Filter out any connection strings in seed.ts that match the actual DB connection string template / process.env lines,
  // but we want to fail on actual hardcoded secrets/connection strings.
  // Note: scanFile checks line-by-line. If there's any actual hardcoded connection string or secret, it will fail.
  const allStaticMatches = [...seedMatches, ...fallbackMatches];

  if (allStaticMatches.length > 0) {
    console.error("\n❌ Regex Guard alert: Hardcoded secrets or DB connection strings detected in source code/configs!");
    for (const match of seedMatches) {
      console.error(`  - [In Seed File] Line ${match.lineNumber}: Category [${match.category}]`);
      console.error(`    Matched: "${match.matchedText}"`);
    }
    for (const match of fallbackMatches) {
      console.error(`  - [In Fallback Config] Line ${match.lineNumber}: Category [${match.category}]`);
      console.error(`    Matched: "${match.matchedText}"`);
    }
    console.error("Seeding halted. Zero records were inserted into the database.");
    process.exit(1);
  }

  const duration = Date.now() - startTime;
  console.log(`Validation guards completed successfully in ${duration}ms.`);

  // WIPE: Enforce idempotence by cleaning database before seeding
  await prisma.caseStudy.deleteMany({});

  // Insert the validated payloads
  for (const payload of SEED_PAYLOADS) {
    await prisma.caseStudy.create({
      data: {
        ...payload,
        editorial_content: compileTerms(payload.editorial_content),
        architectural_narrative: compileTerms(payload.architectural_narrative),
      },
    });
  }

  console.log(`Successfully seeded:`);
  for (const payload of SEED_PAYLOADS) {
    console.log(`- ${payload.title}`);
  }
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
