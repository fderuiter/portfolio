/**
 * Logic Proof Workspace and Terminal Core Business Logic Utilities.
 */

export interface Edge {
  source: string;
  target: string;
}

export interface TacticHint {
  stepNumber: number;
  title: string;
  hint: string;
  suggestedSource?: string;
  suggestedTarget?: string;
  isCompleted: boolean;
}

export const VALID_NODE_IDS = ["A", "B", "C", "D", "E"];
export const VALID_COMMANDS = ["connect", "disconnect", "list", "clear", "help", "simulate"];

/**
 * Checks if a given string is a valid Node ID.
 */
export function isValidNode(nodeId: string): boolean {
  return VALID_NODE_IDS.includes(nodeId.toUpperCase());
}

/**
 * Calculates inline autocomplete suggestion based on the current console input.
 */
export function getSuggestion(inputVal: string): string {
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
      // Autocomplete second token (source node)
      const matchNode = VALID_NODE_IDS.find((id) => id.startsWith(secondWord));
      if (matchNode && matchNode !== secondWord) {
        return `${tokens[0]} ${matchNode}`;
      }
      if (VALID_NODE_IDS.includes(secondWord)) {
        return `${tokens[0]} ${secondWord} `;
      }
    }

    if (tokens.length === 2 && inputVal.endsWith(" ")) {
      // Prompt for second node
      return `${tokens[0]} ${secondWord} `;
    }

    if (tokens.length === 3 && !inputVal.endsWith(" ")) {
      // Autocomplete third token (target node)
      const matchNode = VALID_NODE_IDS.find((id) => id.startsWith(thirdWord));
      if (matchNode && matchNode !== tokens[2]) {
        return `${tokens[0]} ${tokens[1]} ${matchNode}`;
      }
    }
  }

  // If first word is "simulate"
  if (firstWord === "simulate") {
    const secondWord = tokens[1]?.toLowerCase() || "";

    if (tokens.length === 2 && !inputVal.endsWith(" ")) {
      // Autocomplete second token ("normal" or "loop")
      const subCommands = ["normal", "loop"];
      const matchSub = subCommands.find((sub) => sub.startsWith(secondWord));
      if (matchSub && matchSub !== secondWord) {
        return `${tokens[0]} ${matchSub}`;
      }
    }

    if (tokens.length === 2 && inputVal.endsWith(" ")) {
      // If just typed "simulate " with a space, suggest "simulate normal" by default
      return `${tokens[0]} normal`;
    }
  }

  return "";
}

/**
 * Evaluates the proof logical progress based on current connections/edges.
 * Modus Ponens: A (P) and B (P to Q) yields C (Q)
 * Modus Ponens: C (Q) and D (Q to R) yields E (R)
 */
export function evaluateProofStatus(edges: Edge[]): { isC_Proven: boolean; isE_Proven: boolean } {
  // Check connections for Node C
  const hasAToC = edges.some((e) => (e.source === "A" && e.target === "C") || (e.source === "C" && e.target === "A"));
  const hasBToC = edges.some((e) => (e.source === "B" && e.target === "C") || (e.source === "C" && e.target === "B"));
  const isC_Proven = hasAToC && hasBToC;

  // Check connections for Node E
  const hasCToE = edges.some((e) => (e.source === "C" && e.target === "E") || (e.source === "E" && e.target === "C"));
  const hasDToE = edges.some((e) => (e.source === "D" && e.target === "E") || (e.source === "E" && e.target === "D"));
  const isE_Proven = isC_Proven && hasCToE && hasDToE;

  return { isC_Proven, isE_Proven };
}

/**
 * Checks if two nodes can be connected logically and returns validation status.
 */
export function canConnect(
  sourceId: string,
  targetId: string,
  edges: Edge[]
): { allowed: boolean; reason?: string } {
  const s = sourceId.toUpperCase();
  const t = targetId.toUpperCase();

  if (s === t) {
    return { allowed: false, reason: "Cannot connect a node to itself." };
  }

  const alreadyConnected = edges.some(
    (e) => (e.source === s && e.target === t) || (e.source === t && e.target === s)
  );
  if (alreadyConnected) {
    return { allowed: false, reason: `Node ${s} and Node ${t} are already connected.` };
  }

  // Valid logical edge combinations for this Modus Ponens theorem:
  // A (P) -> C (Q)
  // B (P -> Q) -> C (Q)
  // C (Q) -> E (R)
  // D (Q -> R) -> E (R)
  const validPairs = [
    ["A", "C"],
    ["C", "A"],
    ["B", "C"],
    ["C", "B"],
    ["C", "E"],
    ["E", "C"],
    ["D", "E"],
    ["E", "D"],
  ];

  const isValidPair = validPairs.some(([p1, p2]) => p1 === s && p2 === t);
  if (!isValidPair) {
    return {
      allowed: false,
      reason: `No valid deductive inference rule links Node ${s} directly to Node ${t}.`,
    };
  }

  return { allowed: true };
}

/**
 * Returns contextual step-by-step tactic hint for guided proof assistant.
 */
export function getNextTacticHint(edges: Edge[]): TacticHint {
  const { isE_Proven } = evaluateProofStatus(edges);

  if (isE_Proven) {
    return {
      stepNumber: 3,
      title: "Q.E.D. Proof Fully Discharged!",
      hint: "All premises are satisfied. Conclusion R (Reliability is guaranteed) is proven with mathematical certainty.",
      isCompleted: true,
    };
  }

  const hasAToC = edges.some((e) => (e.source === "A" && e.target === "C") || (e.source === "C" && e.target === "A"));
  const hasBToC = edges.some((e) => (e.source === "B" && e.target === "C") || (e.source === "C" && e.target === "B"));

  if (!hasAToC) {
    return {
      stepNumber: 1,
      title: "Establish Premise P -> Intermediate Q",
      hint: "Connect Node A (Premise P: System is under test) to Node C (Intermediate Q).",
      suggestedSource: "A",
      suggestedTarget: "C",
      isCompleted: false,
    };
  }

  if (!hasBToC) {
    return {
      stepNumber: 1,
      title: "Establish Premise (P -> Q) -> Intermediate Q",
      hint: "Connect Node B (Premise P -> Q) to Node C (Intermediate Q) to discharge Modus Ponens step 1.",
      suggestedSource: "B",
      suggestedTarget: "C",
      isCompleted: false,
    };
  }

  const hasCToE = edges.some((e) => (e.source === "C" && e.target === "E") || (e.source === "E" && e.target === "C"));
  const hasDToE = edges.some((e) => (e.source === "D" && e.target === "E") || (e.source === "E" && e.target === "D"));

  if (!hasCToE) {
    return {
      stepNumber: 2,
      title: "Link Proven Antecedent Q -> Goal Conclusion R",
      hint: "Node C (Q) is proven! Now connect Node C (Q) to Node E (Conclusion R).",
      suggestedSource: "C",
      suggestedTarget: "E",
      isCompleted: false,
    };
  }

  if (!hasDToE) {
    return {
      stepNumber: 2,
      title: "Link Conditional (Q -> R) -> Goal Conclusion R",
      hint: "Connect Node D (Premise Q -> R: If bugs are caught, reliability is guaranteed) to Node E (Conclusion R).",
      suggestedSource: "D",
      suggestedTarget: "E",
      isCompleted: false,
    };
  }

  return {
    stepNumber: 3,
    title: "Proof Verified",
    hint: "Conclusion R is established.",
    isCompleted: true,
  };
}
