type WorkerAction = 
  | { type: "START_SIMULATION"; mode: "normal" | "loop" };

function runNormalSimulation() {
  const steps = [
    "Initializing Tactic Engine...",
    "Traversing proof tree starting with premise nodes: Node A (P) and Node B (P → Q)...",
    "Validating Node A and Node B connection requirements...",
    "Applying Modus Ponens tactic to establish Node C (Q)...",
    "Goal C verified! Node C is now logically proven.",
    "Traversing next branch: Node D (Q → R)...",
    "Validating Node C and Node D connection requirements...",
    "Applying Modus Ponens tactic to establish Node E (R)...",
    "Re-verifying entire proof graph structure...",
    "Proof graph verification completed successfully! Target R proven."
  ];

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
      runNormalSimulation();
    }
  }
});
