type TheoremId =
  | "modus-ponens"
  | "modus-tollens"
  | "hypothetical-syllogism"
  | "disjunctive-syllogism"
  | "resolution";

type WorkerAction = 
  | { type: "START_SIMULATION"; mode: "normal" | "loop"; theoremId?: TheoremId };

const THEOREM_SIMULATION_STEPS: Record<TheoremId, string[]> = {
  "modus-ponens": [
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
  "modus-tollens": [
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
  "hypothetical-syllogism": [
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
  "disjunctive-syllogism": [
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
  "resolution": [
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
};

function runNormalSimulation(theoremId: TheoremId = "modus-ponens") {
  const steps = THEOREM_SIMULATION_STEPS[theoremId] || THEOREM_SIMULATION_STEPS["modus-ponens"];
  let currentStep = 0;

  function next() {
    if (currentStep < steps.length) {
      self.postMessage({
        type: "progress",
        step: currentStep + 1,
        log: `[Step ${currentStep + 1}/${steps.length}] ${steps[currentStep]}`
      });
      currentStep++;
      setTimeout(next, 200); // 200ms delay between steps to simulate complex processing
    } else {
      self.postMessage({
        type: "done",
        stepsCompleted: steps.length,
        finalStatus: "success"
      });
    }
  }

  next();
}

self.addEventListener("message", (event: MessageEvent<WorkerAction>) => {
  const { data } = event;
  if (data && data.type === "START_SIMULATION") {
    if (data.mode === "loop") {
      self.postMessage({
        type: "progress",
        step: 0,
        log: "Starting loop simulation: this will enter an infinite loop to test the 5s watchdog..."
      });
      
      // Infinite synchronous loop to block the worker thread completely
      while (true) {
        // block
      }
    } else {
      runNormalSimulation(data.theoremId || "modus-ponens");
    }
  }
});
