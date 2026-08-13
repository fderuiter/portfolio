import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { Client, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/client";
import ws from "ws";
import { scanFile, scanText } from "../lib/validation-scanner";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
const client = new Client(connectionString);
const adapter = new PrismaNeon(client as unknown as ConstructorParameters<typeof PrismaNeon>[0]);
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
    editorial_content_simplified: "A **visual tool** that lets system architects design and check complex **database structures** easily by dragging and dropping elements. It instantly points out mistakes and converts the visual diagrams into ready-to-use database code, speeding up the engineering design process.",
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
    editorial_content_simplified: "A **data mapping pipeline** that automatically imports clinical trial information from different medical databases and formats it to meet strict **international regulatory standards**. This helps researchers submit compliant trial results to regulatory authorities quickly and securely.",
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
    editorial_content: "A **robust**, fully-typed `Python SDK` client for programmatic extraction and integration of clinical trial metadata and patient records from the `iMednet EDC` platform. Built for **biostatisticians** and **clinical data engineers**.",
    editorial_content_simplified: "A **programming toolkit** for biostatisticians and medical data engineers to securely extract patient records from clinical databases. It includes a built-in sandbox so developers can safely test their integrations in minutes.",
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
    slug: "aura-haskell",
    title: "Aura: Language-Tailored Haskell Type Flow Analyzer",
    primary_language: "Haskell",
    github_url: "https://github.com/fderuiter/aura-haskell",
    published: true,
    simulated_telemetry: true,
    tags: "Haskell, GHC, Compiler, AST, Static Analysis",
    editorial_content: "An advanced **Haskell** static analyzer and type inference engine that parses GHC ASTs, traces type flow, and detects compile-time architectural anti-patterns with near-instantaneous feedback loops.",
    editorial_content_simplified: "An advanced **code analysis tool** that scans programming files in real-time to detect structural mistakes and performance bottlenecks, helping developers write cleaner, safer, and more efficient software.",
    architectural_narrative: `
<h3>The Challenge</h3>
<p>Haskell codebases are robust, but tracing complex monadic types or locating space leaks can be incredibly slow and taxing. Developers need visual, live compiler-level insight without introducing manual tracing overhead or restarting GHC sessions repeatedly.</p>

<h3>The Architecture</h3>
<p>Aura uses GHC plugins to stream compilation ASTs and type constraints directly. In the dashboard, these constraints are modeled as a unified type flow graph, allowing real-time inspection of active monads, lazy evaluation spaces, and compiler optimizations.</p>
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
    const simplifiedMatches = scanText(payload.editorial_content_simplified);
    const narrativeMatches = scanText(payload.architectural_narrative);
    const combinedMatches = [...editorialMatches, ...simplifiedMatches, ...narrativeMatches];

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
      data: payload,
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
