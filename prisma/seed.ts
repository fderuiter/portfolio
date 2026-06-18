import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { Client, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
const client = new Client(connectionString);
const adapter = new PrismaNeon(client as unknown as ConstructorParameters<typeof PrismaNeon>[0]);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding portfolio case studies...");

  // WIPE: Enforce idempotence by cleaning database before seeding
  await prisma.caseStudy.deleteMany({});

  // 1. SchemaFlow Seeding
  const schemaFlow = await prisma.caseStudy.create({
    data: {
      slug: "schemaflow",
      title: "SchemaFlow: Reactive Node Engine for Schema Composition",
      primary_language: "TypeScript",
      github_url: "https://github.com/fderuiter/SchemaFlow",
      published: true,
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
  });

  // 2. Clinical Data Standards Mapper Seeding
  const clinicalMapper = await prisma.caseStudy.create({
    data: {
      slug: "clinical-data-mapper",
      title: "Clinical Data Standards Engine: CDISC ODM and SDTM Integration",
      primary_language: "TypeScript",
      github_url: "https://github.com/fderuiter/clinical-data-mapper",
      published: true,
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
  });

  // 3. iMednet Python SDK Seeding
  const imednetSdk = await prisma.caseStudy.create({
    data: {
      slug: "imednet-python-sdk",
      title: "iMednet Python SDK: Clinical Trial Data Integration Client",
      primary_language: "Python",
      github_url: "https://github.com/fderuiter/imednet-python-sdk",
      published: true,
      tags: "Python, SDK, iMednet, API Client, Clinical Trials, HIPAA, Clinical Data",
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
  });

  // 4. Unified Account Transformation Seeding
  const accountTransformation = await prisma.caseStudy.create({
    data: {
      slug: "unified-account-transformation",
      title: "Unified Account Transformation",
      primary_language: "TypeScript",
      github_url: "https://github.com/fderuiter/unified-account-transformation",
      published: true,
      tags: "Identity, Verification, OTP, SNA, Stripe Connect, Clinical Data",
      editorial_content: "An automated account conversion engine and unified identity resolution service to eliminate technical onboarding barriers. Features phone ownership verification via OTP and automated EEA verification fallback.",
      architectural_narrative: `
<h3>1. Context & Objectives</h3>
<p><strong>Problem Statement:</strong> Existing users encounter onboarding dead ends when phone numbers are already linked to global Link profiles or when attempting to migrate between incompatible account types. Current systems lack the infrastructure to validate unique phone ownership or transition accounts from Standard to Express formats.</p>
<p><strong>Business Goal:</strong> Eliminate technical barriers to entry for existing account holders, increasing successful onboarding throughput.</p>
<p><strong>Hypothesis:</strong> Implementing an automated account conversion engine and unified identity resolution will remove the primary causes of abandonment for returning users.</p>

<h3>2. User Scenarios</h3>
<ul>
  <li><strong>Resolving Identity Conflicts:</strong> Instead of a "number in use" error, the system validates ownership via OTP and merges the identity into the current session.</li>
  <li><strong>Seamless Account Type Migration:</strong> The system detects an existing Standard account and automatically converts it to the Express format without forcing the user to start a new application.</li>
  <li><strong>Automated EEA Verification:</strong> If the Secure Network Authentication (SNA) check fails (e.g., Twilio error 60510), the system immediately offers an OTP fallback to maintain momentum.</li>
</ul>

<h3>3. Functional Implementation</h3>
<p>The system was engineered using a decoupled set of microservices built on Node.js and Prisma ORM:</p>
<ul>
  <li>Implemented a phone ownership verification bridge using OTP to resolve Link profile conflicts.</li>
  <li>Created an automated backend engine to transition account types from Standard to Express/Custom roles.</li>
  <li>Built a tiered verification handler that triggers OTP fallbacks upon SNA mismatch or failure.</li>
  <li>Developed a session linking service to migrate user data and clinical context across merged identities safely.</li>
</ul>
      `.trim(),
    },
  });

  console.log(`Successfully seeded:`);
  console.log(`- ${schemaFlow.title}`);
  console.log(`- ${clinicalMapper.title}`);
  console.log(`- ${imednetSdk.title}`);
  console.log(`- ${accountTransformation.title}`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
