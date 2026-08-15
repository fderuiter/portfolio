/**
 * Logic Proof Workspace, Formal Theorem Definitions, Fallacy Engine, and Export Utilities.
 */

export type TheoremId =
  | "modus-ponens"
  | "modus-tollens"
  | "hypothetical-syllogism"
  | "disjunctive-syllogism"
  | "resolution";

export interface Edge {
  source: string;
  target: string;
}

export interface ProofNode {
  id: string;
  label: string;
  type: "premise" | "intermediate" | "conclusion";
  description: string;
  meaning: string;
  x: number;
  y: number;
}

export interface TacticHint {
  stepNumber: number;
  title: string;
  hint: string;
  suggestedSource?: string;
  suggestedTarget?: string;
  isCompleted: boolean;
}

export interface LedgerStep {
  stepNumber: number;
  formula: string;
  rule: string;
  premises: string;
  plainEnglish: string;
  isProven: boolean;
}

export interface TruthTableRow {
  p: boolean;
  q: boolean;
  r?: boolean;
  premise1: boolean;
  premise2: boolean;
  conclusion: boolean;
  isCounterexample: boolean;
}

export interface FallacyDiagnosis {
  fallacyName: string;
  formalFormula: string;
  plainEnglish: string;
  softwareAnalogy: string;
  truthTable: TruthTableRow[];
}

export interface TheoremDefinition {
  id: TheoremId;
  title: string;
  subtitle: string;
  category: "Foundational" | "Indirect Proofs" | "Distributed Systems" | "Fault Tolerance";
  ruleName: string;
  scenario: string;
  goalDescription: string;
  targetNodeId: string;
  nodes: ProofNode[];
  initialEdges: Edge[];
  validPairs: string[][];
  intermediateNodeId: string;
  intermediateRequires: [string, string];
  conclusionRequires: [string, string];
  simulationSteps: string[];
  leanCode: string;
  latexCode: string;
}

export const VALID_NODE_IDS = ["A", "B", "C", "D", "E"];
export const VALID_COMMANDS = [
  "connect",
  "disconnect",
  "list",
  "clear",
  "help",
  "simulate",
  "theorem",
  "switch",
  "inspect",
  "tactic",
  "ledger",
  "export",
];

export const THEOREMS: Record<TheoremId, TheoremDefinition> = {
  "modus-ponens": {
    id: "modus-ponens",
    title: "Modus Ponens",
    subtitle: "Affirming the Antecedent · CI/CD Quality Gate",
    category: "Foundational",
    ruleName: "Modus Ponens (P ∧ (P → Q) ⊢ Q)",
    scenario: "Automated regression testing in continuous integration pipelines.",
    goalDescription: "Discharge Conclusion R (Reliability is guaranteed) through test suite verification.",
    targetNodeId: "E",
    intermediateNodeId: "C",
    intermediateRequires: ["A", "B"],
    conclusionRequires: ["C", "D"],
    nodes: [
      {
        id: "A",
        label: "P",
        type: "premise",
        description: "Premise P: The test suite executes on every commit.",
        meaning: "All automated regression tests are actively running in the pipeline.",
        x: 120,
        y: 130,
      },
      {
        id: "B",
        label: "P → Q",
        type: "premise",
        description: "Premise P → Q: If tests run on every commit, regression bugs will be caught.",
        meaning: "High coverage test suites reliably intercept regressions before production.",
        x: 120,
        y: 290,
      },
      {
        id: "C",
        label: "Q",
        type: "intermediate",
        description: "Intermediate Conclusion Q: Regression bugs will be caught.",
        meaning: "Derived fact: The pipeline successfully detects defects.",
        x: 360,
        y: 210,
      },
      {
        id: "D",
        label: "Q → R",
        type: "premise",
        description: "Premise Q → R: If bugs are caught, production reliability is guaranteed.",
        meaning: "Intercepting defects prevents outages and guarantees system uptime.",
        x: 360,
        y: 360,
      },
      {
        id: "E",
        label: "R",
        type: "conclusion",
        description: "Conclusion R: Production reliability is guaranteed.",
        meaning: "The target theorem: 100% formal confidence in deployment reliability.",
        x: 600,
        y: 285,
      },
    ],
    initialEdges: [
      { source: "A", target: "C" },
      { source: "B", target: "C" },
    ],
    validPairs: [
      ["A", "C"],
      ["C", "A"],
      ["B", "C"],
      ["C", "B"],
      ["C", "E"],
      ["E", "C"],
      ["D", "E"],
      ["E", "D"],
    ],
    simulationSteps: [
      "Initializing Modus Ponens Tactic Engine...",
      "Traversing proof tree starting with premise nodes: Node A (P) and Node B (P → Q)...",
      "Validating Node A and Node B connection requirements...",
      "Applying Modus Ponens tactic to establish intermediate Node C (Q)...",
      "Goal C verified! Node C is now logically proven.",
      "Traversing next branch: Premise Node D (Q → R)...",
      "Validating Node C and Node D connection requirements to target Node E (R)...",
      "Applying Modus Ponens tactic to establish conclusion Node E (R)...",
      "Re-verifying entire proof graph structure...",
      "Proof graph verification completed successfully! Target R proven.",
    ],
    leanCode: `-- Formal Proof in Lean 4
theorem modus_ponens_pipeline (P Q R : Prop)
  (hA : P)
  (hB : P → Q)
  (hD : Q → R) : R := by
  have hC : Q := hB hA
  exact hD hC`,
    latexCode: `\\begin{prooftree}
  \\AxiomC{$P$}
  \\AxiomC{$P \\to Q$}
  \\RightLabel{\\scriptsize MP}
  \\BinaryInfC{$Q$}
  \\AxiomC{$Q \\to R$}
  \\RightLabel{\\scriptsize MP}
  \\BinaryInfC{$R$}
\\end{prooftree}`,
  },

  "modus-tollens": {
    id: "modus-tollens",
    title: "Modus Tollens",
    subtitle: "Denying the Consequent · Memory Safety & Exploit Prevention",
    category: "Indirect Proofs",
    ruleName: "Modus Tollens ((P → Q) ∧ ¬Q ⊢ ¬P)",
    scenario: "Proving memory safety by demonstrating the complete absence of buffer overflows.",
    goalDescription: "Discharge Conclusion R (Exploit is impossible) via contrapositive inference.",
    targetNodeId: "E",
    intermediateNodeId: "C",
    intermediateRequires: ["A", "B"],
    conclusionRequires: ["C", "D"],
    nodes: [
      {
        id: "A",
        label: "P → Q",
        type: "premise",
        description: "Premise P → Q: If buffer allocation is unbounded (P), heap overflow occurs (Q).",
        meaning: "Unchecked pointer arithmetic inevitably triggers heap corruptions.",
        x: 120,
        y: 130,
      },
      {
        id: "B",
        label: "¬Q",
        type: "premise",
        description: "Premise ¬Q: Heap overflow did not occur (verified by AddressSanitizer).",
        meaning: "AddressSanitizer proves the absence of heap corruption across all executions.",
        x: 120,
        y: 290,
      },
      {
        id: "C",
        label: "¬P",
        type: "intermediate",
        description: "Intermediate Conclusion ¬P: Buffer allocation is bounded and memory-safe.",
        meaning: "Derived fact: Unbounded memory allocation is impossible in this runtime.",
        x: 360,
        y: 210,
      },
      {
        id: "D",
        label: "¬P → R",
        type: "premise",
        description: "Premise ¬P → R: If buffer is bounded, remote code execution exploit (R) is impossible.",
        meaning: "Bounded buffers eliminate stack/heap smashing attack vectors.",
        x: 360,
        y: 360,
      },
      {
        id: "E",
        label: "R",
        type: "conclusion",
        description: "Conclusion R: Remote code execution exploit is impossible.",
        meaning: "The target theorem: 100% formal memory safety guarantee achieved.",
        x: 600,
        y: 285,
      },
    ],
    initialEdges: [
      { source: "A", target: "C" },
      { source: "B", target: "C" },
    ],
    validPairs: [
      ["A", "C"],
      ["C", "A"],
      ["B", "C"],
      ["C", "B"],
      ["C", "E"],
      ["E", "C"],
      ["D", "E"],
      ["E", "D"],
    ],
    simulationSteps: [
      "Initializing Modus Tollens Tactic Engine...",
      "Evaluating negative consequent: Node B (¬Q: No Heap Overflow)...",
      "Evaluating conditional implication: Node A (P → Q: Unbounded implies Overflow)...",
      "Applying Modus Tollens contrapositive rule to establish Node C (¬P: Bounded Memory)...",
      "Intermediate proposition ¬P discharged without sorry axiom.",
      "Linking with Premise Node D (¬P → R: Bounded memory prevents RCE)...",
      "Applying Modus Ponens on derived ¬P and Premise D...",
      "Discharging final Conclusion Node E (R: Exploit impossible)...",
      "Re-verifying entire contrapositive AST graph...",
      "Memory safety invariant formally proven (Q.E.D.)",
    ],
    leanCode: `-- Formal Proof in Lean 4
theorem modus_tollens_memory_safety (P Q R : Prop)
  (hA : P → Q)
  (hB : ¬Q)
  (hD : ¬P → R) : R := by
  have hC : ¬P := fun hp => hB (hA hp)
  exact hD hC`,
    latexCode: `\\begin{prooftree}
  \\AxiomC{$P \\to Q$}
  \\AxiomC{$\\neg Q$}
  \\RightLabel{\\scriptsize MT}
  \\BinaryInfC{$\\neg P$}
  \\AxiomC{$\\neg P \\to R$}
  \\RightLabel{\\scriptsize MP}
  \\BinaryInfC{$R$}
\\end{prooftree}`,
  },

  "hypothetical-syllogism": {
    id: "hypothetical-syllogism",
    title: "Hypothetical Syllogism",
    subtitle: "Transitivity of Implication · Microservice SLA Chaining",
    category: "Distributed Systems",
    ruleName: "Hypothetical Syllogism ((P → Q) ∧ (Q → R) ⊢ P → R)",
    scenario: "Verifying end-to-end service latency SLA across upstream and downstream microservices.",
    goalDescription: "Discharge Conclusion S (Global 99.99% Availability SLA is satisfied).",
    targetNodeId: "E",
    intermediateNodeId: "C",
    intermediateRequires: ["A", "B"],
    conclusionRequires: ["C", "D"],
    nodes: [
      {
        id: "A",
        label: "P → Q",
        type: "premise",
        description: "Premise P → Q: If Auth API latency < 50ms (P), cache hits exceed 98% (Q).",
        meaning: "Fast token validation maintains warm Redis cache tiers.",
        x: 120,
        y: 130,
      },
      {
        id: "B",
        label: "Q → R",
        type: "premise",
        description: "Premise Q → R: If cache hits exceed 98% (Q), database IOPS stay nominal (R).",
        meaning: "High cache hit ratio prevents database connection pool exhaustion.",
        x: 120,
        y: 290,
      },
      {
        id: "C",
        label: "P → R",
        type: "intermediate",
        description: "Intermediate Conclusion P → R: If Auth latency < 50ms, database IOPS stay nominal.",
        meaning: "Derived transitive chain across the distributed service topology.",
        x: 360,
        y: 210,
      },
      {
        id: "D",
        label: "(P→R)→S",
        type: "premise",
        description: "Premise (P → R) → S: If nominal DB IOPS is bounded by Auth, Global SLA is met (S).",
        meaning: "System-wide architectural contract ensures 99.99% availability.",
        x: 360,
        y: 360,
      },
      {
        id: "E",
        label: "S",
        type: "conclusion",
        description: "Conclusion S: Global 99.99% Availability SLA is formally verified.",
        meaning: "The target theorem: End-to-end distributed SLA verified without bottlenecks.",
        x: 600,
        y: 285,
      },
    ],
    initialEdges: [
      { source: "A", target: "C" },
      { source: "B", target: "C" },
    ],
    validPairs: [
      ["A", "C"],
      ["C", "A"],
      ["B", "C"],
      ["C", "B"],
      ["C", "E"],
      ["E", "C"],
      ["D", "E"],
      ["E", "D"],
    ],
    simulationSteps: [
      "Initializing Hypothetical Syllogism Tactic Engine...",
      "Inspecting upstream conditional: Node A (P → Q: Auth to Cache)...",
      "Inspecting downstream conditional: Node B (Q → R: Cache to DB IOPS)...",
      "Applying Transitivity of Implication to synthesize intermediate Node C (P → R)...",
      "Transitive implication P → R proven valid.",
      "Connecting derived contract with SLA gatekeeper Node D ((P → R) → S)...",
      "Applying Modus Ponens on intermediate Node C and Premise Node D...",
      "Discharging Conclusion Node E (S: Global SLA Met)...",
      "Verifying zero cyclical latency dependencies in service mesh...",
      "Distributed microservice SLA theorem verified (Q.E.D.)",
    ],
    leanCode: `-- Formal Proof in Lean 4
theorem hypothetical_syllogism_sla (P Q R S : Prop)
  (hA : P → Q)
  (hB : Q → R)
  (hD : (P → R) → S) : S := by
  have hC : P → R := fun hp => hB (hA hp)
  exact hD hC`,
    latexCode: `\\begin{prooftree}
  \\AxiomC{$P \\to Q$}
  \\AxiomC{$Q \\to R$}
  \\RightLabel{\\scriptsize HS}
  \\BinaryInfC{$P \\to R$}
  \\AxiomC{$(P \\to R) \\to S$}
  \\RightLabel{\\scriptsize MP}
  \\BinaryInfC{$S$}
\\end{prooftree}`,
  },

  "disjunctive-syllogism": {
    id: "disjunctive-syllogism",
    title: "Disjunctive Syllogism",
    subtitle: "Elimination of Alternatives · Distributed Consensus Failover",
    category: "Fault Tolerance",
    ruleName: "Disjunctive Syllogism ((P ∨ Q) ∧ ¬P ⊢ Q)",
    scenario: "Raft consensus leader failover and backup quorum arbitration.",
    goalDescription: "Discharge Conclusion R (Zero downtime is guaranteed during primary partition).",
    targetNodeId: "E",
    intermediateNodeId: "C",
    intermediateRequires: ["A", "B"],
    conclusionRequires: ["C", "D"],
    nodes: [
      {
        id: "A",
        label: "P ∨ Q",
        type: "premise",
        description: "Premise P ∨ Q: Primary node maintains lease (P) OR Standby replica takes leader quorum (Q).",
        meaning: "At least one consensus coordinator is active at any epoch.",
        x: 120,
        y: 130,
      },
      {
        id: "B",
        label: "¬P",
        type: "premise",
        description: "Premise ¬P: Primary node heartbeat expired and failed lease renewal (¬P).",
        meaning: "Split-brain detector confirms the primary node is unreachable.",
        x: 120,
        y: 290,
      },
      {
        id: "C",
        label: "Q",
        type: "intermediate",
        description: "Intermediate Conclusion Q: Standby replica successfully takes leader quorum.",
        meaning: "Derived fact: Failover quorum is triggered immediately.",
        x: 360,
        y: 210,
      },
      {
        id: "D",
        label: "Q → R",
        type: "premise",
        description: "Premise Q → R: If standby replica takes quorum, zero downtime (R) is maintained.",
        meaning: "Fast failover replication guarantees un-interrupted client writes.",
        x: 360,
        y: 360,
      },
      {
        id: "E",
        label: "R",
        type: "conclusion",
        description: "Conclusion R: Zero downtime consensus invariant is maintained.",
        meaning: "The target theorem: 100% formal resilience against primary node failure.",
        x: 600,
        y: 285,
      },
    ],
    initialEdges: [
      { source: "A", target: "C" },
      { source: "B", target: "C" },
    ],
    validPairs: [
      ["A", "C"],
      ["C", "A"],
      ["B", "C"],
      ["C", "B"],
      ["C", "E"],
      ["E", "C"],
      ["D", "E"],
      ["E", "D"],
    ],
    simulationSteps: [
      "Initializing Disjunctive Syllogism Tactic Engine...",
      "Evaluating active disjunction: Node A (P ∨ Q: Primary or Standby)...",
      "Evaluating negation premise: Node B (¬P: Primary Heartbeat Failed)...",
      "Applying Disjunctive Syllogism elimination rule to establish Node C (Q: Standby Active)...",
      "Intermediate conclusion Q discharged successfully.",
      "Linking standby quorum with uptime guarantee: Node D (Q → R)...",
      "Applying Modus Ponens on derived Node C and Node D...",
      "Discharging final Conclusion Node E (R: Zero Downtime)...",
      "Verifying absence of split-brain edge cases in Raft term...",
      "Distributed consensus failover theorem verified (Q.E.D.)",
    ],
    leanCode: `-- Formal Proof in Lean 4
theorem disjunctive_syllogism_raft (P Q R : Prop)
  (hA : P ∨ Q)
  (hB : ¬P)
  (hD : Q → R) : R := by
  have hC : Q := hA.resolve_left hB
  exact hD hC`,
    latexCode: `\\begin{prooftree}
  \\AxiomC{$P \\lor Q$}
  \\AxiomC{$\\neg P$}
  \\RightLabel{\\scriptsize DS}
  \\BinaryInfC{$Q$}
  \\AxiomC{$Q \\to R$}
  \\RightLabel{\\scriptsize MP}
  \\BinaryInfC{$R$}
\\end{prooftree}`,
  },

  resolution: {
    id: "resolution",
    title: "Resolution Refutation",
    subtitle: "Clausal Inference · Deadlock & Invariant Conflict Detection",
    category: "Fault Tolerance",
    ruleName: "Resolution ((P ∨ Q) ∧ (¬P ∨ R) ⊢ Q ∨ R)",
    scenario: "Automated theorem proving in database transaction wait-for graphs and lock managers.",
    goalDescription: "Discharge Conclusion R (Deadlock resolver triggers safe rollback).",
    targetNodeId: "E",
    intermediateNodeId: "C",
    intermediateRequires: ["A", "B"],
    conclusionRequires: ["C", "D"],
    nodes: [
      {
        id: "A",
        label: "P ∨ Q",
        type: "premise",
        description: "Premise P ∨ Q: Transaction lock acquired (P) OR Tx enqueued in wait-graph (Q).",
        meaning: "Concurrency control invariant: lock is held or request is queued.",
        x: 120,
        y: 130,
      },
      {
        id: "B",
        label: "¬P ∨ R",
        type: "premise",
        description: "Premise ¬P ∨ R: Transaction lock revoked (¬P) OR Deadlock detector triggers rollback (R).",
        meaning: "If lock is not held, deadlock resolution policy is active.",
        x: 120,
        y: 290,
      },
      {
        id: "C",
        label: "Q ∨ R",
        type: "intermediate",
        description: "Intermediate Conclusion Q ∨ R: Tx is enqueued (Q) OR Deadlock resolver triggers rollback (R).",
        meaning: "Derived resolvent clause removing the complementary literal P and ¬P.",
        x: 360,
        y: 210,
      },
      {
        id: "D",
        label: "¬Q",
        type: "premise",
        description: "Premise ¬Q: Wait queue is empty (Tx cannot wait further due to lock timeout).",
        meaning: "Queue boundary condition: Transaction cannot remain in wait state.",
        x: 360,
        y: 360,
      },
      {
        id: "E",
        label: "R",
        type: "conclusion",
        description: "Conclusion R: Deadlock resolver triggers safe transaction rollback.",
        meaning: "The target theorem: Deadlock resolved without data corruption or orphan locks.",
        x: 600,
        y: 285,
      },
    ],
    initialEdges: [
      { source: "A", target: "C" },
      { source: "B", target: "C" },
    ],
    validPairs: [
      ["A", "C"],
      ["C", "A"],
      ["B", "C"],
      ["C", "B"],
      ["C", "E"],
      ["E", "C"],
      ["D", "E"],
      ["E", "D"],
    ],
    simulationSteps: [
      "Initializing Resolution Refutation Tactic Engine...",
      "Inspecting Clause 1: Node A (P ∨ Q: Lock acquired or Enqueued)...",
      "Inspecting Clause 2: Node B (¬P ∨ R: Lock revoked or Rollback)...",
      "Applying Resolution Rule on complementary literal P / ¬P...",
      "Derived Resolvent Clause: Node C (Q ∨ R)...",
      "Inspecting unit clause constraint: Node D (¬Q: Not Enqueued)...",
      "Applying Unit Resolution on derived Node C and Node D...",
      "Discharging unit resolvent Conclusion Node E (R: Deadlock Rollback)...",
      "Checking empty clause refutation and cycle-free wait graph...",
      "Database concurrency safety invariant verified (Q.E.D.)",
    ],
    leanCode: `-- Formal Proof in Lean 4
theorem resolution_deadlock_safety (P Q R : Prop)
  (hA : P ∨ Q)
  (hB : ¬P ∨ R)
  (hD : ¬Q) : R := by
  have hC : Q ∨ R := match hA with
    | Or.inl hp => match hB with
      | Or.inl hnp => False.elim (hnp hp)
      | Or.inr hr => Or.inr hr
    | Or.inr hq => Or.inl hq
  exact match hC with
    | Or.inl hq => False.elim (hD hq)
    | Or.inr hr => hr`,
    latexCode: `\\begin{prooftree}
  \\AxiomC{$P \\lor Q$}
  \\AxiomC{$\\neg P \\lor R$}
  \\RightLabel{\\scriptsize Res}
  \\BinaryInfC{$Q \\lor R$}
  \\AxiomC{$\\neg Q$}
  \\RightLabel{\\scriptsize DS}
  \\BinaryInfC{$R$}
\\end{prooftree}`,
  },
};

/**
 * Checks if a given string is a valid Node ID.
 */
export function isValidNode(nodeId: string): boolean {
  return VALID_NODE_IDS.includes(nodeId.toUpperCase());
}

/**
 * Calculates inline autocomplete suggestion based on current console input and active theorem.
 */
export function getSuggestion(inputVal: string, _theoremId: TheoremId = "modus-ponens"): string {
  const trimmed = inputVal.trim();
  if (!inputVal) return "";

  const tokens = inputVal.split(/\s+/);
  const firstWord = tokens[0].toLowerCase();

  // If only typing the command name (first word)
  if (tokens.length === 1 && !inputVal.endsWith(" ")) {
    const match = VALID_COMMANDS.find((cmd) => cmd.startsWith(trimmed.toLowerCase()));
    if (match && match !== trimmed.toLowerCase()) {
      return match;
    }
  }

  // If first word is "connect" or "disconnect"
  if (tokens.length > 1 && (firstWord === "connect" || firstWord === "disconnect")) {
    const secondWord = tokens[1]?.toUpperCase() || "";
    const thirdWord = tokens[2]?.toUpperCase() || "";

    if (tokens.length === 2 && !inputVal.endsWith(" ")) {
      const matchNode = VALID_NODE_IDS.find((id) => id.startsWith(secondWord));
      if (matchNode && matchNode !== secondWord) {
        return `${tokens[0]} ${matchNode}`;
      }
      if (VALID_NODE_IDS.includes(secondWord)) {
        return `${tokens[0]} ${secondWord} `;
      }
    }

    if (tokens.length === 2 && inputVal.endsWith(" ")) {
      return `${tokens[0]} ${secondWord} `;
    }

    if (tokens.length === 3 && !inputVal.endsWith(" ")) {
      const matchNode = VALID_NODE_IDS.find((id) => id.startsWith(thirdWord));
      if (matchNode && matchNode !== tokens[2]) {
        return `${tokens[0]} ${tokens[1]} ${matchNode}`;
      }
    }
  }

  // If first word is "theorem" or "switch"
  if (tokens.length > 1 && (firstWord === "theorem" || firstWord === "switch")) {
    const secondWord = tokens[1]?.toLowerCase() || "";
    const theoremKeys: string[] = ["mp", "mt", "hs", "ds", "res", "modus-ponens", "modus-tollens", "hypothetical-syllogism", "disjunctive-syllogism", "resolution"];
    if (tokens.length === 2 && !inputVal.endsWith(" ")) {
      const matchTh = theoremKeys.find((t) => t.startsWith(secondWord));
      if (matchTh && matchTh !== secondWord) {
        return `${tokens[0]} ${matchTh}`;
      }
    }
  }

  // If first word is "inspect"
  if (tokens.length > 1 && firstWord === "inspect") {
    const secondWord = tokens[1]?.toUpperCase() || "";
    if (tokens.length === 2 && !inputVal.endsWith(" ")) {
      const matchNode = VALID_NODE_IDS.find((id) => id.startsWith(secondWord));
      if (matchNode && matchNode !== secondWord) {
        return `${tokens[0]} ${matchNode}`;
      }
    }
  }

  // If first word is "export"
  if (tokens.length > 1 && firstWord === "export") {
    const secondWord = tokens[1]?.toLowerCase() || "";
    const formats = ["lean", "latex", "markdown", "mermaid"];
    if (tokens.length === 2 && !inputVal.endsWith(" ")) {
      const matchFmt = formats.find((f) => f.startsWith(secondWord));
      if (matchFmt && matchFmt !== secondWord) {
        return `${tokens[0]} ${matchFmt}`;
      }
    }
  }

  // If first word is "simulate"
  if (firstWord === "simulate") {
    const secondWord = tokens[1]?.toLowerCase() || "";

    if (tokens.length === 2 && !inputVal.endsWith(" ")) {
      const subCommands = ["normal", "loop"];
      const matchSub = subCommands.find((sub) => sub.startsWith(secondWord));
      if (matchSub && matchSub !== secondWord) {
        return `${tokens[0]} ${matchSub}`;
      }
    }

    if (tokens.length === 2 && inputVal.endsWith(" ")) {
      return `${tokens[0]} normal`;
    }
  }

  return "";
}

/**
 * Evaluates the proof logical progress based on current connections/edges.
 */
export function evaluateProofStatus(
  edges: Edge[],
  theoremId: TheoremId = "modus-ponens"
): { isC_Proven: boolean; isE_Proven: boolean } {
  const th = THEOREMS[theoremId] || THEOREMS["modus-ponens"];

  const [req1, req2] = th.intermediateRequires;
  const hasReq1ToInter = edges.some(
    (e) =>
      (e.source === req1 && e.target === th.intermediateNodeId) ||
      (e.source === th.intermediateNodeId && e.target === req1)
  );
  const hasReq2ToInter = edges.some(
    (e) =>
      (e.source === req2 && e.target === th.intermediateNodeId) ||
      (e.source === th.intermediateNodeId && e.target === req2)
  );
  const isC_Proven = hasReq1ToInter && hasReq2ToInter;

  const [cReq1, cReq2] = th.conclusionRequires;
  const hasCReq1ToConcl = edges.some(
    (e) =>
      (e.source === cReq1 && e.target === th.targetNodeId) ||
      (e.source === th.targetNodeId && e.target === cReq1)
  );
  const hasCReq2ToConcl = edges.some(
    (e) =>
      (e.source === cReq2 && e.target === th.targetNodeId) ||
      (e.source === th.targetNodeId && e.target === cReq2)
  );
  const isE_Proven = isC_Proven && hasCReq1ToConcl && hasCReq2ToConcl;

  return { isC_Proven, isE_Proven };
}

/**
 * Checks if two nodes can be connected logically and returns validation status.
 */
export function canConnect(
  sourceId: string,
  targetId: string,
  edges: Edge[],
  theoremId: TheoremId = "modus-ponens"
): { allowed: boolean; reason?: string } {
  const s = sourceId.toUpperCase();
  const t = targetId.toUpperCase();
  const th = THEOREMS[theoremId] || THEOREMS["modus-ponens"];

  if (s === t) {
    return { allowed: false, reason: "Cannot connect a node to itself." };
  }

  const alreadyConnected = edges.some(
    (e) => (e.source === s && e.target === t) || (e.source === t && e.target === s)
  );
  if (alreadyConnected) {
    return { allowed: false, reason: `Node ${s} and Node ${t} are already connected.` };
  }

  const isValidPair = th.validPairs.some(([p1, p2]) => p1 === s && p2 === t);
  if (!isValidPair) {
    return {
      allowed: false,
      reason: `No valid deductive inference rule links Node ${s} directly to Node ${t}.`,
    };
  }

  return { allowed: true };
}

/**
 * Diagnoses the formal logical fallacy and generates truth table counterexamples for invalid connections.
 */
export function getFallacyDiagnosis(
  sourceId: string,
  targetId: string,
  _edges: Edge[],
  _theoremId: TheoremId = "modus-ponens"
): FallacyDiagnosis {
  const s = sourceId.toUpperCase();
  const t = targetId.toUpperCase();

  // 1. Self connection / circular loop
  if (s === t) {
    return {
      fallacyName: "Fallacy of Circular Reasoning (Petitio Principii)",
      formalFormula: "P ⊢ P (Tautological Self-Reference)",
      plainEnglish: `Connecting Node ${s} directly to itself creates an invalid recursive feedback loop without establishing an external premise justification.`,
      softwareAnalogy: "Circular dependency in module imports: A depends on A, causing a runtime bootstrap deadlock.",
      truthTable: [
        { p: true, q: true, premise1: true, premise2: true, conclusion: true, isCounterexample: false },
        { p: false, q: false, premise1: false, premise2: false, conclusion: false, isCounterexample: true },
      ],
    };
  }

  // 2. Affirming the Consequent (e.g. connecting conclusion to antecedent)
  if ((s === "C" && t === "A") || (s === "E" && t === "C")) {
    return {
      fallacyName: "Fallacy of Affirming the Consequent",
      formalFormula: "((P → Q) ∧ Q) ⊬ P",
      plainEnglish: `Assuming that because the outcome (${t}) occurred, the specific initial cause (${s}) must have been the sole trigger. Other independent factors could have caused the same outcome.`,
      softwareAnalogy: "Observing that regression tests passed does not prove that all possible edge cases were tested — a missing test case could simply have been omitted.",
      truthTable: [
        { p: true, q: true, premise1: true, premise2: true, conclusion: true, isCounterexample: false },
        { p: false, q: true, premise1: true, premise2: true, conclusion: false, isCounterexample: true },
        { p: true, q: false, premise1: false, premise2: false, conclusion: true, isCounterexample: false },
        { p: false, q: false, premise1: true, premise2: false, conclusion: false, isCounterexample: false },
      ],
    };
  }

  // 3. Denying the Antecedent (inferring ¬Q from ¬P given P → Q)
  if (s === "A" && t === "D") {
    return {
      fallacyName: "Fallacy of Denying the Antecedent",
      formalFormula: "((P → Q) ∧ ¬P) ⊬ ¬Q",
      plainEnglish: `Assuming that if the antecedent condition is not met, the consequence cannot occur. The consequence might still happen via other mechanisms.`,
      softwareAnalogy: "If you don't run tests on commit (¬P), that doesn't mean zero bugs were caught (¬Q); an automated compiler lint or canary build could have caught them.",
      truthTable: [
        { p: true, q: true, premise1: true, premise2: false, conclusion: true, isCounterexample: false },
        { p: false, q: true, premise1: true, premise2: true, conclusion: false, isCounterexample: true },
        { p: false, q: false, premise1: true, premise2: true, conclusion: true, isCounterexample: false },
      ],
    };
  }

  // 4. Incompatible Terms / Non Sequitur
  return {
    fallacyName: "Fallacy of Incompatible Terms (Non Sequitur)",
    formalFormula: `Node ${s} ⊬ Node ${t}`,
    plainEnglish: `There is no valid deductive inference rule (Modus Ponens, Modus Tollens, Syllogism, or Resolution) that links Node ${s} directly to Node ${t} in the active theorem.`,
    softwareAnalogy: "Type mismatch in function signatures: passing an unrelated variable type into an incompatible parameter socket.",
    truthTable: [
      { p: true, q: false, premise1: true, premise2: false, conclusion: false, isCounterexample: true },
      { p: false, q: true, premise1: false, premise2: true, conclusion: false, isCounterexample: true },
    ],
  };
}

/**
 * Returns contextual step-by-step tactic hint for guided proof assistant.
 */
export function getNextTacticHint(
  edges: Edge[],
  theoremId: TheoremId = "modus-ponens"
): TacticHint {
  const th = THEOREMS[theoremId] || THEOREMS["modus-ponens"];
  const { isE_Proven } = evaluateProofStatus(edges, theoremId);

  if (isE_Proven) {
    return {
      stepNumber: 3,
      title: `Q.E.D. ${th.title} Fully Discharged!`,
      hint: `All premises are satisfied. ${th.nodes.find((n) => n.id === th.targetNodeId)?.description || "Target conclusion is proven with mathematical certainty."}`,
      isCompleted: true,
    };
  }

  const [req1, req2] = th.intermediateRequires;
  const hasReq1 = edges.some(
    (e) =>
      (e.source === req1 && e.target === th.intermediateNodeId) ||
      (e.source === th.intermediateNodeId && e.target === req1)
  );
  const hasReq2 = edges.some(
    (e) =>
      (e.source === req2 && e.target === th.intermediateNodeId) ||
      (e.source === th.intermediateNodeId && e.target === req2)
  );

  const node1 = th.nodes.find((n) => n.id === req1);
  const node2 = th.nodes.find((n) => n.id === req2);
  const interNode = th.nodes.find((n) => n.id === th.intermediateNodeId);

  if (!hasReq1) {
    return {
      stepNumber: 1,
      title: `Establish Premise ${node1?.label || req1} → Intermediate ${interNode?.label || th.intermediateNodeId}`,
      hint: `Connect Node ${req1} (${node1?.description}) to Node ${th.intermediateNodeId} (${interNode?.label}).`,
      suggestedSource: req1,
      suggestedTarget: th.intermediateNodeId,
      isCompleted: false,
    };
  }

  if (!hasReq2) {
    return {
      stepNumber: 1,
      title: `Establish Premise ${node2?.label || req2} → Intermediate ${interNode?.label || th.intermediateNodeId}`,
      hint: `Connect Node ${req2} (${node2?.description}) to Node ${th.intermediateNodeId} (${interNode?.label}) to discharge inference step 1.`,
      suggestedSource: req2,
      suggestedTarget: th.intermediateNodeId,
      isCompleted: false,
    };
  }

  const [cReq1, cReq2] = th.conclusionRequires;
  const hasCReq1 = edges.some(
    (e) =>
      (e.source === cReq1 && e.target === th.targetNodeId) ||
      (e.source === th.targetNodeId && e.target === cReq1)
  );
  const hasCReq2 = edges.some(
    (e) =>
      (e.source === cReq2 && e.target === th.targetNodeId) ||
      (e.source === th.targetNodeId && e.target === cReq2)
  );

  const cNode1 = th.nodes.find((n) => n.id === cReq1);
  const cNode2 = th.nodes.find((n) => n.id === cReq2);
  const targetNode = th.nodes.find((n) => n.id === th.targetNodeId);

  if (!hasCReq1) {
    return {
      stepNumber: 2,
      title: `Link Derived Antecedent ${cNode1?.label || cReq1} → Goal ${targetNode?.label || th.targetNodeId}`,
      hint: `Node ${cReq1} (${cNode1?.label}) is proven! Now connect Node ${cReq1} to Node ${th.targetNodeId} (${targetNode?.description}).`,
      suggestedSource: cReq1,
      suggestedTarget: th.targetNodeId,
      isCompleted: false,
    };
  }

  if (!hasCReq2) {
    return {
      stepNumber: 2,
      title: `Link Conditional Premise ${cNode2?.label || cReq2} → Goal ${targetNode?.label || th.targetNodeId}`,
      hint: `Connect Node ${cReq2} (${cNode2?.description}) to Node ${th.targetNodeId} (${targetNode?.label}).`,
      suggestedSource: cReq2,
      suggestedTarget: th.targetNodeId,
      isCompleted: false,
    };
  }

  return {
    stepNumber: 3,
    title: "Proof Verified",
    hint: `Conclusion ${targetNode?.label} is established.`,
    isCompleted: true,
  };
}

/**
 * Constructs the multi-row formal deduction ledger table for the active theorem.
 */
export function getDeductionLedger(
  edges: Edge[],
  theoremId: TheoremId = "modus-ponens"
): LedgerStep[] {
  const th = THEOREMS[theoremId] || THEOREMS["modus-ponens"];
  const { isC_Proven, isE_Proven } = evaluateProofStatus(edges, theoremId);

  const nA = th.nodes.find((n) => n.id === "A");
  const nB = th.nodes.find((n) => n.id === "B");
  const nC = th.nodes.find((n) => n.id === "C");
  const nD = th.nodes.find((n) => n.id === "D");
  const nE = th.nodes.find((n) => n.id === "E");

  return [
    {
      stepNumber: 1,
      formula: nA?.label || "P",
      rule: "Premise 1",
      premises: "Given",
      plainEnglish: nA?.description || "Initial premise established.",
      isProven: true,
    },
    {
      stepNumber: 2,
      formula: nB?.label || "P → Q",
      rule: "Premise 2",
      premises: "Given",
      plainEnglish: nB?.description || "Conditional implication premise.",
      isProven: true,
    },
    {
      stepNumber: 3,
      formula: nC?.label || "Q",
      rule: th.ruleName.split("(")[0].trim(),
      premises: "Lines [1, 2]",
      plainEnglish: nC?.meaning || "Derived intermediate conclusion.",
      isProven: isC_Proven,
    },
    {
      stepNumber: 4,
      formula: nD?.label || "Q → R",
      rule: "Premise 3",
      premises: "Given",
      plainEnglish: nD?.description || "Goal conditional premise.",
      isProven: true,
    },
    {
      stepNumber: 5,
      formula: nE?.label || "R",
      rule: "Modus Ponens",
      premises: "Lines [3, 4]",
      plainEnglish: nE?.meaning || "Target conclusion proven with mathematical certainty.",
      isProven: isE_Proven,
    },
  ];
}

/**
 * Exports the active theorem proof into Lean 4 verification syntax.
 */
export function exportProofToLean4(
  theoremId: TheoremId = "modus-ponens"
): string {
  const th = THEOREMS[theoremId] || THEOREMS["modus-ponens"];
  return th.leanCode;
}

/**
 * Exports the active theorem proof into LaTeX natural deduction syntax.
 */
export function exportProofToLatex(
  theoremId: TheoremId = "modus-ponens"
): string {
  const th = THEOREMS[theoremId] || THEOREMS["modus-ponens"];
  return th.latexCode;
}

/**
 * Exports the active theorem proof ledger into Markdown table format.
 */
export function exportProofToMarkdown(
  edges: Edge[],
  theoremId: TheoremId = "modus-ponens"
): string {
  const th = THEOREMS[theoremId] || THEOREMS["modus-ponens"];
  const ledger = getDeductionLedger(edges, theoremId);
  const { isE_Proven } = evaluateProofStatus(edges, theoremId);

  const rows = ledger
    .map(
      (s) =>
        `| ${s.stepNumber} | \`${s.formula}\` | ${s.rule} | ${s.premises} | ${s.isProven ? "✔ PROVEN" : "⏳ PENDING"} | ${s.plainEnglish} |`
    )
    .join("\n");

  return `# Formal Proof Certificate: ${th.title}
**Scenario**: ${th.scenario}  
**Status**: ${isE_Proven ? "✔ Q.E.D. DISCHARGED (100% Sound)" : "⏳ INCOMPLETE"}  
**Inference Rule**: ${th.ruleName}  

| Step | Proposition | Inference Rule | Premises | Status | Plain English Meaning |
|:---:|:---:|:---:|:---:|:---:|:---|
${rows}

---
*Generated by Antigravity Logical Proof Canvas v3.0*
`;
}

/**
 * Exports the active theorem proof into Mermaid flowchart syntax.
 */
export function exportProofToMermaid(
  edges: Edge[],
  theoremId: TheoremId = "modus-ponens"
): string {
  const th = THEOREMS[theoremId] || THEOREMS["modus-ponens"];
  const { isC_Proven, isE_Proven } = evaluateProofStatus(edges, theoremId);

  const nodeDefs = th.nodes
    .map((n) => {
      let isProven = true;
      if (n.id === "C") isProven = isC_Proven;
      if (n.id === "E") isProven = isE_Proven;
      const statusIcon = isProven ? "✔" : "⏳";
      return `    Node_${n.id}["${statusIcon} [Node ${n.id}] ${n.label}\\n${n.type.toUpperCase()}"]`;
    })
    .join("\n");

  const edgeDefs = edges
    .map((e) => `    Node_${e.source} --> Node_${e.target}`)
    .join("\n");

  return `graph LR
    %% Formal Logic Proof Graph: ${th.title}
${nodeDefs}
${edgeDefs}
    classDef proven fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5;
    classDef pending fill:#18181b,stroke:#52525b,stroke-width:1px,color:#a1a1aa;
    class Node_A,Node_B,Node_D proven;
    class Node_C ${isC_Proven ? "proven" : "pending"};
    class Node_E ${isE_Proven ? "proven" : "pending"};
`;
}
