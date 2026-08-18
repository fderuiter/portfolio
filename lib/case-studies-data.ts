import { compileTerms } from "./term-compiler";

export interface CaseStudyData {
  id: string;
  slug: string;
  title: string;
  primary_language: string;
  github_url: string;
  published: boolean;
  simulated_telemetry: boolean;
  tags: string;
  editorial_content: string;
  architectural_narrative: string;
  commands_json?: string;
  playback_json?: string;
  created_at: Date;
  updated_at: Date;
}

export const IMEDNET_COMMANDS_OBJ = {
  "imednet studies list": {
    description: "Retrieve a list of all active clinical trials from the iMednet EDC platform.",
    payload: [
      {
        studyID: "BRIGHT-01",
        name: "Phase III Pediatric Leukemia Study",
        status: "ACTIVE",
        subjectsCount: 142,
        version: "v4.2.1"
      },
      {
        studyID: "ONCO-2026",
        name: "Advanced Melanoma Immunotherapy Trial",
        status: "ENROLLING",
        subjectsCount: 89,
        version: "v1.0.8"
      },
      {
        studyID: "CARDIO-REF",
        name: "Congestive Heart Failure Observational Registry",
        status: "COMPLETED",
        subjectsCount: 310,
        version: "v2.5.0"
      }
    ]
  },
  "imednet subjects get --id 123": {
    description: "Query specific details and records for subject 123 (HIPAA-anonymized).",
    payload: {
      subjectID: "SUB-123",
      studyID: "BRIGHT-01",
      siteID: 401,
      enrollmentDate: "2025-11-12",
      status: "COMPLETED",
      recordsCount: 18,
      complianceScore: "[VERIFY_SECURITY_LOGS]",
      demographics: {
        age: 11,
        gender: "F",
        ethnicity: "ANONYMIZED_UNDER_HIPAA_SAFE_HARBOR"
      },
      lastVisit: "2026-05-10T14:30Z"
    }
  },
  "imednet records search --study BRIGHT-01": {
    description: "Search dynamic patient records and EDC form entries matching active trials.",
    payload: {
      studyID: "BRIGHT-01",
      totalRecordsMatched: 3,
      domain: "VS (Vital Signs)",
      results: [
        {
          subjectID: "SUB-101",
          visitName: "Week 4 Follow-up",
          heartRate: 72,
          tempCelsius: 36.8,
          systolicBP: 110,
          diastolicBP: 72,
          timestamp: "2026-05-20T08:30Z"
        },
        {
          subjectID: "SUB-102",
          visitName: "Week 4 Follow-up",
          heartRate: 84,
          tempCelsius: 37.1,
          systolicBP: 115,
          diastolicBP: 76,
          timestamp: "2026-05-20T09:15Z"
        },
        {
          subjectID: "SUB-103",
          visitName: "Week 4 Follow-up",
          heartRate: 68,
          tempCelsius: 36.6,
          systolicBP: 108,
          diastolicBP: 70,
          timestamp: "2026-05-20T10:00Z"
        }
      ]
    }
  }
};

export const IMEDNET_PLAYBACK_OBJ = [
  {
    command: "imednet studies list",
    description: "Retrieve a list of all active clinical trials from the iMednet EDC platform."
  },
  {
    command: "imednet subjects get --id 123",
    description: "Query details and demographics for subject 123"
  },
  {
    command: "imednet records search --study BRIGHT-01",
    description: "Search dynamic patient records for active trial BRIGHT-01"
  }
];

const rawFallbackCaseStudies: CaseStudyData[] = [
  {
    id: "canonical-1",
    slug: "clinical-data-mapper",
    title: "Clinical Data Standards Engine: CDISC ODM and SDTM Integration",
    primary_language: "TypeScript",
    github_url: "https://github.com/fderuiter/clinical-data-mapper",
    published: true,
    simulated_telemetry: false,
    tags: "TypeScript, CDISC, ODM, SDTM, XML Parser, Clinical Trials, HIPAA",
    editorial_content: "An enterprise-grade **TypeScript** mapping pipeline that ingests clinical trial metadata in `CDISC Operational Data Model (ODM)` XML format, dynamically constructs `data schemas`, and transforms raw `Electronic Data Capture (EDC)` datasets into compliant **CDISC SDTM** domains.",
    architectural_narrative: `<h3>The Challenge</h3>
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
<p>Transforms the captured values into structured SDTM domains like <strong>DM (Demographics)</strong>, <strong>AE (Adverse Events)</strong>, or <strong>VS (Vital Signs)</strong>. We implement a declarative mapping language written in TypeScript:
- Matches subject parameters across Study Events.
- Computes standard SDTM columns like <code>AESEV</code> (Adverse Event Severity) and <code>AESTDY</code> (Adverse Event Study Day).
- Validates constraints against CDISC Controlled Terminology vocabularies.</p>`,
    created_at: new Date("2026-01-15T00:00:00Z"),
    updated_at: new Date("2026-08-14T00:00:00Z"),
  },
  {
    id: "canonical-2",
    slug: "cadence-clinical",
    title: "Cadence Clinical: Protocol-Driven Enterprise Clinical Operating System",
    primary_language: "Python / Vue 3",
    github_url: "https://github.com/fderuiter/cadence-clinical",
    published: true,
    simulated_telemetry: false,
    tags: "clinical-trials, cdisc-usdm, hexagonal-architecture, gxp-compliance, distributed-systems, vue3-vite",
    editorial_content: "An end-to-end, **multi-tenant digital clinical platform** combining graph-native protocol design (`Neo4j` for `CDISC USDM` protocol authoring) with a transactional relational engine (`PostgreSQL` / `SQLModel`). Features cryptographic `Merkle-tree audit trails`, **RSA-PSS** digital signatures, and asynchronous transactional outbox event streaming meeting FDA **21 CFR Part 11** and **GxP** compliance.",
    architectural_narrative: `<h3>Executive Summary &amp; Core Architecture</h3>
<p>Cadence Clinical is a multi-tenant digital clinical trial platform that ingests, authors, executes, and exports regulatory-compliant clinical trial lifecycles governed by CDISC USDM, CDASH, SDTM, and ADaM standards. It utilizes a dual-engine polyglot architecture combining graph-native protocol design (Neo4j for CDISC USDM v2/v3 protocol authoring and AST-driven amendment cascading) with a transactional relational engine (PostgreSQL / SQLModel) backed by cryptographic Merkle-tree audit trails and RSA-PSS e-signatures.</p>

<h3>1. Hexagonal Architecture (Ports &amp; Adapters)</h3>
<p>Domain logic across microservices (apps/execution, apps/designer, apps/etmf, apps/safety) is strictly decoupled from framework and infrastructure concerns. Ports define explicit interfaces while adapters handle persistence and external network integration.</p>

<pre><code class="language-python">
# apps/execution/domain/ports.py
from typing import Protocol, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ClinicalObservation(BaseModel):
    observation_id: str
    subject_id: str
    tenant_id: str
    domain_code: str
    value: str
    timestamp: datetime
    merkle_hash: str

class ExecutionRepositoryPort(Protocol):
    """Hexagonal Repository Port enforcing strict domain isolation."""
    async def get_subject_with_lock(self, subject_id: str, tenant_id: str) -> Optional[SubjectRecord]: ...
    async def persist_observation(self, observation: ClinicalObservation) -> None: ...
</code></pre>

<h3>2. Cryptographic 21 CFR Part 11 Signature Verification Engine</h3>
<p>To eliminate padding oracle vulnerabilities associated with legacy PKCS#1 v1.5 signatures, Cadence Clinical standardizes on RSA-PSS with SHA-256 for all e-signature manifests and audit state updates.</p>

<pre><code class="language-python">
# packages/compliance/services/esignature_verifier.py
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature

def verify_manifest_signature(
    public_key: rsa.RSAPublicKey,
    signature: bytes,
    canonical_payload: bytes
) -> bool:
    try:
        public_key.verify(
            signature,
            canonical_payload,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except InvalidSignature:
        return False
</code></pre>

<h3>3. USDM Graph AST Mapping Transformer</h3>
<p>Protocol Schedule of Activities (SoA), arms, encounters, and biomedical concepts are modeled in Neo4j to support zero-downtime study amendments and AST-driven amendment cascading without clinical execution lockouts.</p>

<pre><code class="language-python">
# apps/designer/transformers/usdm_graph.py
from typing import Dict, Any, List

class USDMGraphTransformer:
    def __init__(self, usdm_payload: Dict[str, Any]):
        self.payload = usdm_payload

    def build_soa_graph_nodes(self) -> List[Dict[str, Any]]:
        study = self.payload.get("study", {})
        study_id = study.get("id")
        nodes = [{"labels": ["Study"], "properties": {"study_id": study_id, "name": study.get("name")}}]
        for arm in study.get("arms", []):
            nodes.append({"labels": ["StudyArm"], "properties": {"arm_id": arm.get("id"), "type": arm.get("type")}})
        return nodes
</code></pre>

<h3>Lessons Learned &amp; System Metrics</h3>
<ul>
  <li><strong>Sub-50ms Gateway Overhead</strong>: High-throughput API gateway routing with Redis token replay protection and JWKS key caching.</li>
  <li><strong>100% GxP Audit Traceability</strong>: Append-only Merkle tree audit logging with sub-millisecond tamper verification.</li>
  <li><strong>Monorepo Performance</strong>: Moving Python microservices to <code>uv</code> workspaces reduced cold CI test execution times by 65%.</li>
</ul>`,
    created_at: new Date("2026-01-20T00:00:00Z"),
    updated_at: new Date("2026-08-14T00:00:00Z"),
  },
  {
    id: "canonical-3",
    slug: "imednet-python-sdk",
    title: "iMednet Python SDK: Clinical Trial Data Integration Client",
    primary_language: "Python",
    github_url: "https://github.com/fderuiter/imednet-python-sdk",
    published: true,
    simulated_telemetry: false,
    tags: "Python, SDK, iMednet, API Client, Clinical Trials, HIPAA, Clinical Data",
    editorial_content: "A **robust**, fully-typed `Python SDK` client for programmatic extraction and integration of clinical trial metadata and patient records from the `iMednet EDC` platform. Built for **biostatisticians** and **clinical data engineers**.",
    architectural_narrative: `<h3>The Challenge</h3>
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
<p>To accelerate developer onboarding, the repository introduces an interactive CLI sandbox built directly into the portfolio. Systems engineers can test commands, inspect raw JSON schemas, and simulate error/empty responses in real time, accelerating integration time-to-market from weeks to minutes.</p>`,
    commands_json: JSON.stringify(IMEDNET_COMMANDS_OBJ),
    playback_json: JSON.stringify(IMEDNET_PLAYBACK_OBJ),
    created_at: new Date("2026-02-01T00:00:00Z"),
    updated_at: new Date("2026-08-14T00:00:00Z"),
  },
  {
    id: "canonical-4",
    slug: "wedding-website",
    title: "The Nuptial Engine: Bespoke Event Portal & Guest Logistics",
    primary_language: "TypeScript",
    github_url: "https://github.com/fderuiter/wedding-website",
    published: true,
    simulated_telemetry: false,
    tags: "TypeScript, Next.js, React, TailwindCSS, Framer Motion, Logistics, RSVP",
    editorial_content: "A **bespoke event portal** and guest operations engine crafted in **Next.js** and **Framer Motion**. Features real-time multi-household `RSVP tracking`, interactive personalized travel timelines, accommodation logistics, and custom canvas physics animations built to survive zero-downtime family scrutiny.",
    architectural_narrative: `<h3>The Challenge</h3>
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
<p>Bespoke typography, smooth Framer Motion layout transitions, and subtle particle physics create a warm, unforgettable digital invitation that marries aesthetic beauty with rock-solid full-stack engineering.</p>`,
    created_at: new Date("2026-02-10T00:00:00Z"),
    updated_at: new Date("2026-08-14T00:00:00Z"),
  },
  {
    id: "canonical-5",
    slug: "schemaflow",
    title: "SchemaFlow: Reactive Node Engine for Schema Composition",
    primary_language: "TypeScript",
    github_url: "https://github.com/fderuiter/SchemaFlow",
    published: true,
    simulated_telemetry: false,
    tags: "TypeScript, React, Flow, Schemas, AST, Node-RED",
    editorial_content: "A **reactive**, `visual graph editor` built in **TypeScript** and **React** that allows system architects to visually compose, validate, and compile complex `JSON Schema` structures in real time. Features highly responsive `node evaluation`, cyclical dependency detection, and live `code generation`.",
    architectural_narrative: `<h3>The Challenge</h3>
<p>Modern enterprise APIs often require complex, deeply nested JSON schemas. Hand-authoring these schemas in raw JSON or YAML leads to validation errors, duplicate definitions, and slow developer velocity. Visual graph editors exist, but they suffer from high rendering latency, lacks type-safety, and do not handle recursive schema references gracefully.</p>

<h3>Technical Architecture</h3>
<p>SchemaFlow is designed around a decoupled three-tier system: the <strong>Graph State Core</strong>, the <strong>Abstract Syntax Tree (AST) Compiler</strong>, and the <strong>Canvas Render Engine</strong>.</p>

<pre><code class="language-typescript">
// Graph State Management
interface SchemaNode {
  id: string;
  type: "string" | "number" | "object" | "array" | "ref";
  properties: Record<string, any>;
  position: { x: number; y: number };
}
</code></pre>

<h4>1. Immutable Graph State Core</h4>
<p>The state is modeled as a Directed Acyclic Graph (DAG) using a customized Zustand store. Every node represents a schema primitive or block. Connections between nodes represent references (e.g., matching a child field node to a parent object node). To ensure zero UI lagging, state selections are strictly memoized, and computed derived values (like the compiled JSON schema) are debounced and offloaded to a Web Worker.</p>

<h4>2. Cyclical Dependency Detection</h4>
<p>When a developer links nodes, SchemaFlow runs a depth-first search (DFS) algorithm across the active nodes. If a path returns to an ancestor node, a cyclic reference is flagged. Rather than crashing, the compiler safely inserts a <code>$ref</code> definition inside the JSON Schema AST to support recursive definitions (like a folder containing files and other folders) without entering infinite compile loops.</p>

<h4>3. The AST Compiler</h4>
<p>When state is pushed, the compiler resolves node connections into a unified AST. It then generates valid <strong>JSON Schema Draft-07</strong> or <strong>OpenAPI v3</strong> specs. The entire compilation runs in an isolated context, returning a structured output that can be directly copy-pasted or pushed to a schema registry.</p>`,
    created_at: new Date("2026-02-15T00:00:00Z"),
    updated_at: new Date("2026-08-14T00:00:00Z"),
  },
];

export const FALLBACK_CASE_STUDIES: CaseStudyData[] = rawFallbackCaseStudies.map((cs) => ({
  ...cs,
  editorial_content: compileTerms(cs.editorial_content),
  architectural_narrative: compileTerms(cs.architectural_narrative),
}));

