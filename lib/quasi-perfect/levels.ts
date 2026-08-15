import { PuzzlerLevelDef } from "./types";

export const puzzleLevels: PuzzlerLevelDef[] = [
  // =========================================================================
  // CHAPTER 1: Equational Reasoning & Algebraic Normalization
  // =========================================================================
  {
    id: 1,
    chapter: 1,
    chapterTitle: "Equational Reasoning",
    title: "The Identity Crisis",
    subtitle: "Level 1 · Reflexivity",
    description: "Prove that an arbitrary variable equals itself (x = x) using the fundamental Law of Identity.",
    initialRam: 16,
    goldRamTarget: 15,
    silverRamTarget: 8,
    hypotheses: [],
    goal: {
      id: "eq-lvl1",
      type: "Equality",
      value: "=",
      children: [
        { id: "var-x1", type: "Variable", value: "x" },
        { id: "var-x2", type: "Variable", value: "x" },
      ],
    },
    availableTactics: ["rfl", "sorry"],
    hints: [
      "Every mathematical object is equal to itself by the Law of Identity.",
      "The equality AST node has identical Left-Hand and Right-Hand sides.",
      "Apply the 'rfl' (reflexivity) tactic to immediately close the goal.",
    ],
    leanTheoremName: "identity_crisis",
    leanTypeSignature: "(x : Nat) : x = x",
    educationalConcept: {
      title: "The Reflexivity Axiom (rfl)",
      summary: "In Type Theory, reflexivity is the canonical constructor of equality (`Eq.refl`). If two expressions evaluate to definitionally equal terms, `rfl` closes the goal in O(1) step.",
      mathNotation: "∀ x, x = x",
      leanDocUrl: "https://leanprover-community.github.io/mathlib4_docs/Init/Core.html#Eq.refl",
      realWorldApplication: "Hardware microcode verification: verifying registers contain expected unchanged states after identity operations.",
    },
  },
  {
    id: 2,
    chapter: 1,
    chapterTitle: "Equational Reasoning",
    title: "The Art of Substitution",
    subtitle: "Level 2 · Rewriting & Transitivity",
    description: "Prove a = c using hypotheses h1: a = b and h2: b = c via Leibniz's rule of substitution.",
    initialRam: 16,
    goldRamTarget: 11,
    silverRamTarget: 6,
    hypotheses: [
      {
        id: "hyp-h1",
        type: "Equality",
        value: "=",
        metadata: { name: "h1" },
        children: [
          { id: "var-a-h1", type: "Variable", value: "a" },
          { id: "var-b-h1", type: "Variable", value: "b" },
        ],
      },
      {
        id: "hyp-h2",
        type: "Equality",
        value: "=",
        metadata: { name: "h2" },
        children: [
          { id: "var-b-h2", type: "Variable", value: "b" },
          { id: "var-c-h2", type: "Variable", value: "c" },
        ],
      },
    ],
    goal: {
      id: "eq-lvl2",
      type: "Equality",
      value: "=",
      children: [
        { id: "var-a-goal", type: "Variable", value: "a" },
        { id: "var-c-goal", type: "Variable", value: "c" },
      ],
    },
    availableTactics: [
      { id: "rw", hypothesis: "h1", labelOverride: "rw [h1]" },
      { id: "rw", hypothesis: "h2", labelOverride: "rw [h2]" },
      "rfl",
      "sorry",
    ],
    hints: [
      "Use active hypotheses in your context to replace subterms.",
      "Target variable 'a' in the goal and rewrite it using hypothesis 'h1'.",
      "Then rewrite 'b' using 'h2' and close the resulting 'c = c' with 'rfl'.",
    ],
    leanTheoremName: "substitution_transitivity",
    leanTypeSignature: "(a b c : Nat) (h1 : a = b) (h2 : b = c) : a = c",
    educationalConcept: {
      title: "Leibniz's Indiscernibility of Identicals (rw)",
      summary: "The `rw` (rewrite) tactic substitutes sub-terms in the goal using an equality hypothesis `h : x = y`. It enables equational reasoning chains step-by-step.",
      mathNotation: "(a = b) ∧ (b = c) ⟹ a = c",
      leanDocUrl: "https://lean-lang.org/theorem_proving_in_lean4/tactics.html#the-rewrite-tactic",
      realWorldApplication: "Compilers use rewrite rules in peephole optimizers to replace expensive instruction sequences with cheaper equivalents.",
    },
  },
  {
    id: 3,
    chapter: 1,
    chapterTitle: "Equational Reasoning",
    title: "Memory Economics",
    subtitle: "Level 3 · RAM Optimization",
    description: "Prove x + 0 = x. Notice that 'simp' searches all algebraic rules and burns 6 GB, whereas 'rw [add_zero]' costs only 2 GB.",
    initialRam: 7,
    goldRamTarget: 4,
    silverRamTarget: 1,
    hypotheses: [
      {
        id: "hyp-add-zero",
        type: "Equality",
        value: "=",
        metadata: { name: "add_zero" },
        children: [
          {
            id: "expr-x-plus-zero",
            type: "Operator",
            value: "+",
            children: [
              { id: "var-x-h", type: "Variable", value: "x" },
              { id: "const-0-h", type: "Constant", value: 0 },
            ],
          },
          { id: "var-x-rhs", type: "Variable", value: "x" },
        ],
      },
    ],
    goal: {
      id: "eq-lvl3",
      type: "Equality",
      value: "=",
      children: [
        {
          id: "expr-x-plus-0",
          type: "Operator",
          value: "+",
          children: [
            { id: "var-x-goal", type: "Variable", value: "x" },
            { id: "const-0-goal", type: "Constant", value: 0 },
          ],
        },
        { id: "var-x-target", type: "Variable", value: "x" },
      ],
    },
    availableTactics: [
      { id: "rw", hypothesis: "add_zero", labelOverride: "rw [add_zero]" },
      "simp",
      "rfl",
      "sorry",
    ],
    hints: [
      "Broad simplifiers like 'simp' traverse the entire lemma library and use significant memory.",
      "A specific rewrite lemma `rw [add_zero]` directly targets the addition identity.",
      "Apply `rw [add_zero]` (2 GB) followed by `rfl` (1 GB) for total 3 GB consumption (Gold!).",
    ],
    leanTheoremName: "add_zero_identity",
    leanTypeSignature: "(x : Nat) : x + 0 = x",
    educationalConcept: {
      title: "Simplifier vs Targeted Rewriting",
      summary: "`simp` is a confluent term-rewriting engine maintaining thousands of simplification lemmas. While convenient, large automation tactics consume substantial language server memory.",
      mathNotation: "x + 0 = x",
      leanDocUrl: "https://lean-lang.org/theorem_proving_in_lean4/tactics.html#the-simplifier",
      realWorldApplication: "Automated test generation & formal verification pipelines benchmark proof scripts to avoid Out-Of-Memory (OOM) failures in CI/CD.",
    },
  },
  {
    id: 4,
    chapter: 1,
    chapterTitle: "Equational Reasoning",
    title: "Ring Axioms & Expansion",
    subtitle: "Level 4 · Algebraic Polynomial Normalization",
    description: "Prove (a + b)² = a² + 2ab + b² in commutative semirings using the algebraic 'ring' decision procedure.",
    initialRam: 14,
    goldRamTarget: 9,
    silverRamTarget: 4,
    hypotheses: [],
    goal: {
      id: "eq-lvl4",
      type: "Equality",
      value: "=",
      children: [
        {
          id: "expr-sq-lhs",
          type: "Operator",
          value: "^",
          children: [
            {
              id: "expr-a-plus-b",
              type: "Operator",
              value: "+",
              children: [
                { id: "var-a-ring", type: "Variable", value: "a" },
                { id: "var-b-ring", type: "Variable", value: "b" },
              ],
            },
            { id: "const-2-pow", type: "Constant", value: 2 },
          ],
        },
        {
          id: "expr-sq-rhs",
          type: "Operator",
          value: "+",
          children: [
            {
              id: "expr-a2-plus-2ab",
              type: "Operator",
              value: "+",
              children: [
                {
                  id: "expr-a2",
                  type: "Operator",
                  value: "^",
                  children: [
                    { id: "var-a-rhs1", type: "Variable", value: "a" },
                    { id: "const-2-rhs1", type: "Constant", value: 2 },
                  ],
                },
                {
                  id: "expr-2ab",
                  type: "Operator",
                  value: "*",
                  children: [
                    {
                      id: "expr-2a",
                      type: "Operator",
                      value: "*",
                      children: [
                        { id: "c2-rhs", type: "Constant", value: 2 },
                        { id: "var-a-rhs2", type: "Variable", value: "a" },
                      ],
                    },
                    { id: "var-b-rhs2", type: "Variable", value: "b" },
                  ],
                },
              ],
            },
            {
              id: "expr-b2",
              type: "Operator",
              value: "^",
              children: [
                { id: "var-b-rhs3", type: "Variable", value: "b" },
                { id: "const-2-rhs3", type: "Constant", value: 2 },
              ],
            },
          ],
        },
      ],
    },
    availableTactics: ["ring", "simp", "sorry"],
    hints: [
      "Commutative rings satisfy associativity, commutativity, and distributivity.",
      "The equation is the classic binomial theorem expansion for power 2.",
      "Apply 'ring' to transform both sides into canonical polynomials and verify identity.",
    ],
    leanTheoremName: "binomial_expansion",
    leanTypeSignature: "(a b : Nat) : (a + b)^2 = a^2 + 2 * a * b + b^2",
    educationalConcept: {
      title: "Ring Normalization (ring)",
      summary: "The `ring` tactic in Lean/Coq implements Buchberger's algorithm and Gröbner bases for commutative semirings, reducing polynomials to canonical monomial normal forms.",
      mathNotation: "(a + b)² = a² + 2ab + b²",
      leanDocUrl: "https://leanprover-community.github.io/mathlib4_docs/Mathlib/Tactic/Ring.html",
      realWorldApplication: "Cryptographic protocol verification (e.g. elliptic curve group laws and RSA polynomial expansions).",
    },
  },

  // =========================================================================
  // CHAPTER 2: Propositional Logic & Natural Deduction
  // =========================================================================
  {
    id: 5,
    chapter: 2,
    chapterTitle: "Propositional Logic",
    title: "The Deduction Theorem",
    subtitle: "Level 5 · Implication Introduction",
    description: "Prove the fundamental tautology P → P by introducing the antecedent into your hypothesis context.",
    initialRam: 14,
    goldRamTarget: 10,
    silverRamTarget: 5,
    hypotheses: [],
    goal: {
      id: "imp-lvl5",
      type: "Implication",
      value: "→",
      children: [
        { id: "var-P1", type: "Variable", value: "P" },
        { id: "var-P2", type: "Variable", value: "P" },
      ],
    },
    availableTactics: ["intro", "exact", "rfl", "sorry"],
    hints: [
      "To prove an implication P → Q, assume P as a hypothesis and deduce Q.",
      "Use 'intro h' on the implication arrow to unpack hypothesis 'h : P'.",
      "With 'h : P' in your hypotheses and goal 'P', use 'exact h' to close the proof.",
    ],
    leanTheoremName: "implication_self",
    leanTypeSignature: "(P : Prop) : P → P",
    educationalConcept: {
      title: "Implication Introduction (intro)",
      summary: "In Natural Deduction, the →-Intro rule states that if assuming P allows deriving Q, then P → Q is proven. In Curry-Howard, this is lambda abstraction `(λ h : P => h)`.",
      mathNotation: "Γ ∪ {P} ⊢ Q  ⟹  Γ ⊢ P → Q",
      leanDocUrl: "https://lean-lang.org/theorem_proving_in_lean4/tactics.html#the-intro-tactic",
      realWorldApplication: "Functional programming: creating higher-order functions that accept input arguments.",
    },
  },
  {
    id: 6,
    chapter: 2,
    chapterTitle: "Propositional Logic",
    title: "Modus Ponens in Action",
    subtitle: "Level 6 · Backwards Goal Reasoning",
    description: "Prove proposition Q using hypotheses h_imp: P → Q and h_p: P via backwards reasoning.",
    initialRam: 14,
    goldRamTarget: 9,
    silverRamTarget: 4,
    hypotheses: [
      {
        id: "hyp-imp",
        type: "Implication",
        value: "→",
        metadata: { name: "h_imp" },
        children: [
          { id: "var-P-imp", type: "Variable", value: "P" },
          { id: "var-Q-imp", type: "Variable", value: "Q" },
        ],
      },
      {
        id: "hyp-p",
        type: "Variable",
        value: "P",
        metadata: { name: "h_p" },
      },
    ],
    goal: {
      id: "goal-Q",
      type: "Variable",
      value: "Q",
    },
    availableTactics: [
      { id: "apply", hypothesis: "h_imp", labelOverride: "apply h_imp" },
      { id: "exact", hypothesis: "h_p", labelOverride: "exact h_p" },
      "sorry",
    ],
    hints: [
      "Modus Ponens allows deriving Q from P → Q and P.",
      "In interactive theorem provers, 'apply h_imp' works backwards: to prove Q, it suffices to prove P.",
      "After applying h_imp, close the resulting goal P with 'exact h_p'.",
    ],
    leanTheoremName: "modus_ponens_demo",
    leanTypeSignature: "(P Q : Prop) (h_imp : P → Q) (h_p : P) : Q",
    educationalConcept: {
      title: "Modus Ponens & Backwards Reasoning (apply)",
      summary: "The `apply` tactic implements backward chaining: given a goal Q and a lemma `h : P → Q`, it turns the goal into P. Under Curry-Howard, this is function application `h(h_p)`.",
      mathNotation: "(P → Q) ∧ P ⟹ Q",
      leanDocUrl: "https://lean-lang.org/theorem_proving_in_lean4/tactics.html#the-apply-tactic",
      realWorldApplication: "Automated logic synthesis, expert systems, and deductive database query planning (Datalog/Prolog).",
    },
  },
  {
    id: 7,
    chapter: 2,
    chapterTitle: "Propositional Logic",
    title: "Disjunction Splitting",
    subtitle: "Level 7 · Case Analysis & Multi-Goal Branches",
    description: "Prove that logical OR is commutative (P ∨ Q → Q ∨ P) by splitting on cases.",
    initialRam: 18,
    goldRamTarget: 11,
    silverRamTarget: 5,
    hypotheses: [
      {
        id: "hyp-disj",
        type: "Disjunction",
        value: "∨",
        metadata: { name: "h_or" },
        children: [
          { id: "disj-P", type: "Variable", value: "P" },
          { id: "disj-Q", type: "Variable", value: "Q" },
        ],
      },
    ],
    goal: {
      id: "goal-disj-target",
      type: "Disjunction",
      value: "∨",
      children: [
        { id: "var-Q-out", type: "Variable", value: "Q" },
        { id: "var-P-out", type: "Variable", value: "P" },
      ],
    },
    availableTactics: ["cases", "exact", "simp", "sorry"],
    hints: [
      "A disjunctive hypothesis (P ∨ Q) requires proving the goal in both possible cases.",
      "Apply 'cases' on hypothesis h_or to branch the proof tree into Case 1 (h_left: P) and Case 2 (h_right: Q).",
      "Discharge each sub-goal individually using 'exact' or 'simp'.",
    ],
    leanTheoremName: "or_commutative",
    leanTypeSignature: "(P Q : Prop) (h_or : P ∨ Q) : Q ∨ P",
    educationalConcept: {
      title: "Disjunction Elimination & Case Splits (cases)",
      summary: "In intuitionistic type theory, disjunction `P ∨ Q` is an inductive sum type (`Or.inl` / `Or.inr`). The `cases` tactic performs pattern matching, creating two independent proof branches.",
      mathNotation: "(P ∨ Q) ⟹ (Q ∨ P)",
      leanDocUrl: "https://lean-lang.org/theorem_proving_in_lean4/tactics.html#the-cases-tactic",
      realWorldApplication: "Exhaustive pattern matching in safe programming languages (Rust, Haskell, Swift) ensuring no missing enum variants.",
    },
  },
  {
    id: 8,
    chapter: 2,
    chapterTitle: "Propositional Logic",
    title: "Decidable Computation",
    subtitle: "Level 8 · Computational Reflection",
    description: "Prove the compound proposition (2 * 3 = 6) ∧ (10 > 5) via computational normalizer 'norm_num'.",
    initialRam: 12,
    goldRamTarget: 8,
    silverRamTarget: 4,
    hypotheses: [],
    goal: {
      id: "goal-conj-lvl8",
      type: "Conjunction",
      value: "∧",
      children: [
        {
          id: "eq-2x3-6",
          type: "Equality",
          value: "=",
          children: [
            {
              id: "mult-2-3",
              type: "Operator",
              value: "*",
              children: [
                { id: "c2-lvl8", type: "Constant", value: 2 },
                { id: "c3-lvl8", type: "Constant", value: 3 },
              ],
            },
            { id: "c6-lvl8", type: "Constant", value: 6 },
          ],
        },
        {
          id: "ineq-10-5",
          type: "Inequality",
          value: ">",
          children: [
            { id: "c10-lvl8", type: "Constant", value: 10 },
            { id: "c5-lvl8", type: "Constant", value: 5 },
          ],
        },
      ],
    },
    availableTactics: ["norm_num", "decide", "simp", "sorry"],
    hints: [
      "Propositions with concrete numbers and boolean operators are completely decidable by evaluation.",
      "The conjunction connects two arithmetic facts: 2*3=6 and 10>5.",
      "Use 'norm_num' or 'decide' to evaluate both sides to True computationally.",
    ],
    leanTheoremName: "computational_conjunction",
    leanTypeSignature: ": (2 * 3 = 6) ∧ (10 > 5)",
    educationalConcept: {
      title: "Computational Reflection & norm_num",
      summary: "`norm_num` evaluates numerical operations (add, mul, div, pow, comparisons) by computing normalization proofs inside the logic kernel, reducing runtime proof size.",
      mathNotation: "(2 × 3 = 6) ∧ (10 > 5) ≡ True",
      leanDocUrl: "https://leanprover-community.github.io/mathlib4_docs/Mathlib/Tactic/NormNum/Core.html",
      realWorldApplication: "Smart contracts and arithmetic circuits in zero-knowledge proofs (zk-SNARKs) verifying numerical integrity.",
    },
  },

  // =========================================================================
  // CHAPTER 3: Presburger Systems & Quasiperfect Number Theory
  // =========================================================================
  {
    id: 9,
    chapter: 3,
    chapterTitle: "Quasiperfect Number Theory",
    title: "Odd Quasiperfect Bound",
    subtitle: "Level 9 · Linear Presburger System",
    description: "Prove 3x + 2y ≤ 5x + y given 0 ≤ x and y ≤ 2x using linear decision procedures.",
    initialRam: 14,
    goldRamTarget: 4,
    silverRamTarget: 2,
    hypotheses: [
      {
        id: "hyp-hx",
        type: "Inequality",
        value: "≤",
        metadata: { name: "hx" },
        children: [
          { id: "const-0-hx", type: "Constant", value: 0 },
          { id: "var-x-hx", type: "Variable", value: "x" },
        ],
      },
      {
        id: "hyp-hy",
        type: "Inequality",
        value: "≤",
        metadata: { name: "hy" },
        children: [
          { id: "var-y-hy", type: "Variable", value: "y" },
          {
            id: "expr-2x-hy",
            type: "Operator",
            value: "*",
            children: [
              { id: "const-2-hy", type: "Constant", value: 2 },
              { id: "var-x-hy2", type: "Variable", value: "x" },
            ],
          },
        ],
      },
    ],
    goal: {
      id: "ineq-lvl9",
      type: "Inequality",
      value: "≤",
      children: [
        {
          id: "expr-lhs-lvl9",
          type: "Operator",
          value: "+",
          children: [
            {
              id: "term-3x",
              type: "Operator",
              value: "*",
              children: [
                { id: "c3", type: "Constant", value: 3 },
                { id: "vx", type: "Variable", value: "x" },
              ],
            },
            {
              id: "term-2y",
              type: "Operator",
              value: "*",
              children: [
                { id: "c2", type: "Constant", value: 2 },
                { id: "vy", type: "Variable", value: "y" },
              ],
            },
          ],
        },
        {
          id: "expr-rhs-lvl9",
          type: "Operator",
          value: "+",
          children: [
            {
              id: "term-5x",
              type: "Operator",
              value: "*",
              children: [
                { id: "c5", type: "Constant", value: 5 },
                { id: "vx2", type: "Variable", value: "x" },
              ],
            },
            { id: "term-y-alone", type: "Variable", value: "y" },
          ],
        },
      ],
    },
    availableTactics: ["omega", "linarith", "simp", "sorry"],
    hints: [
      "Integer inequalities with linear coefficients can be closed via Presburger decision procedures.",
      "The inequality is equivalent to 2y - y ≤ 5x - 3x, which simplifies to y ≤ 2x.",
      "Apply 'omega' or 'linarith' to solve the system automatically.",
    ],
    leanTheoremName: "linear_quasi_bound",
    leanTypeSignature: "(x y : Int) (hx : 0 ≤ x) (hy : y ≤ 2 * x) : 3 * x + 2 * y ≤ 5 * x + y",
    educationalConcept: {
      title: "Presburger Arithmetic (omega)",
      summary: "Mojżesz Presburger proved that the first-order theory of natural numbers with addition and equality is decidable. The `omega` tactic in Lean 4 solves integer linear systems efficiently.",
      mathNotation: "∀ x y ∈ ℤ, (0 ≤ x ∧ y ≤ 2x) ⟹ 3x + 2y ≤ 5x + y",
      leanDocUrl: "https://leanprover-community.github.io/mathlib4_docs/Mathlib/Tactic/Omega.html",
      realWorldApplication: "Array bounds checking and buffer overflow prevention in verified compiler optimization (LLVM / CompCert).",
    },
  },
  {
    id: 10,
    chapter: 3,
    chapterTitle: "Quasiperfect Number Theory",
    title: "The Abundant Parity Conundrum",
    subtitle: "Level 10 · Sum of Divisors & Quasiperfect Numbers",
    description: "Prove σ(n) > 2n using the quasiperfect definition hypothesis h_def: σ(n) = 2n + 1 and positivity.",
    initialRam: 14,
    goldRamTarget: 9,
    silverRamTarget: 4,
    hypotheses: [
      {
        id: "hyp-quasi-def",
        type: "Equality",
        value: "=",
        metadata: { name: "h_def" },
        children: [
          {
            id: "fn-sigma",
            type: "Function",
            value: "σ",
            children: [{ id: "var-n-sig", type: "Variable", value: "n" }],
          },
          {
            id: "expr-2n-plus-1",
            type: "Operator",
            value: "+",
            children: [
              {
                id: "expr-2n",
                type: "Operator",
                value: "*",
                children: [
                  { id: "c2-lvl10", type: "Constant", value: 2 },
                  { id: "var-n-lvl10", type: "Variable", value: "n" },
                ],
              },
              { id: "c1-lvl10", type: "Constant", value: 1 },
            ],
          },
        ],
      },
    ],
    goal: {
      id: "goal-sigma-gt-2n",
      type: "Inequality",
      value: ">",
      children: [
        {
          id: "fn-sigma-goal",
          type: "Function",
          value: "σ",
          children: [{ id: "var-n-goal10", type: "Variable", value: "n" }],
        },
        {
          id: "expr-2n-goal",
          type: "Operator",
          value: "*",
          children: [
            { id: "c2-goal10", type: "Constant", value: 2 },
            { id: "var-n-goal10b", type: "Variable", value: "n" },
          ],
        },
      ],
    },
    availableTactics: [
      { id: "rw", hypothesis: "h_def", labelOverride: "rw [h_def]" },
      "linarith",
      "simp",
      "sorry",
    ],
    hints: [
      "A number n is quasiperfect if the sum of all its positive divisors σ(n) equals 2n + 1.",
      "Rewrite σ(n) in the goal using hypothesis 'h_def'.",
      "After rewriting to '2n + 1 > 2n', apply 'linarith' or 'simp' to complete the proof.",
    ],
    leanTheoremName: "quasiperfect_strict_abundancy",
    leanTypeSignature: "(n : Nat) (h_def : σ(n) = 2 * n + 1) : σ(n) > 2 * n",
    educationalConcept: {
      title: "Quasiperfect Numbers & Unsolved Mathematics",
      summary: "In number theory, a quasiperfect number has σ(n) = 2n + 1. Peter Cattaneo asked in 1951 whether any quasiperfect numbers exist. If one exists, it must be an odd perfect square > 10³⁵ with at least 7 distinct prime factors. None have ever been found!",
      mathNotation: "σ(n) = 2n + 1 ⟹ σ(n) > 2n",
      leanDocUrl: "https://en.wikipedia.org/wiki/Quasiperfect_number",
      realWorldApplication: "Number theoretic cryptography and distribution of abundant numbers.",
    },
  },
  {
    id: 11,
    chapter: 3,
    chapterTitle: "Quasiperfect Number Theory",
    title: "The Quasiperfect Verifier",
    subtitle: "Level 11 (Capstone) · Multi-Step Verification",
    description: "Verify that for a quasiperfect number, (σ(n) - 1) + n² = (n + 1)² - 1 by chaining rewrites and polynomial ring normalization.",
    initialRam: 20,
    goldRamTarget: 13,
    silverRamTarget: 6,
    hypotheses: [
      {
        id: "hyp-sig-cap",
        type: "Equality",
        value: "=",
        metadata: { name: "h_sig" },
        children: [
          {
            id: "fn-sig-cap",
            type: "Function",
            value: "σ",
            children: [{ id: "var-n-cap", type: "Variable", value: "n" }],
          },
          {
            id: "expr-2n1-cap",
            type: "Operator",
            value: "+",
            children: [
              {
                id: "expr-2n-c",
                type: "Operator",
                value: "*",
                children: [
                  { id: "c2-c", type: "Constant", value: 2 },
                  { id: "var-n-c", type: "Variable", value: "n" },
                ],
              },
              { id: "c1-c", type: "Constant", value: 1 },
            ],
          },
        ],
      },
    ],
    goal: {
      id: "goal-capstone",
      type: "Equality",
      value: "=",
      children: [
        {
          id: "lhs-cap",
          type: "Operator",
          value: "+",
          children: [
            {
              id: "sig-minus-1",
              type: "Operator",
              value: "-",
              children: [
                {
                  id: "fn-sig-lhs",
                  type: "Function",
                  value: "σ",
                  children: [{ id: "vn-lhs", type: "Variable", value: "n" }],
                },
                { id: "c1-lhs", type: "Constant", value: 1 },
              ],
            },
            {
              id: "n-sq-lhs",
              type: "Operator",
              value: "^",
              children: [
                { id: "vn-sq", type: "Variable", value: "n" },
                { id: "c2-sq", type: "Constant", value: 2 },
              ],
            },
          ],
        },
        {
          id: "rhs-cap",
          type: "Operator",
          value: "-",
          children: [
            {
              id: "n-plus-1-sq",
              type: "Operator",
              value: "^",
              children: [
                {
                  id: "n-plus-1",
                  type: "Operator",
                  value: "+",
                  children: [
                    { id: "vn-rhs", type: "Variable", value: "n" },
                    { id: "c1-rhs", type: "Constant", value: 1 },
                  ],
                },
                { id: "c2-rhs-pow", type: "Constant", value: 2 },
              ],
            },
            { id: "c1-rhs-sub", type: "Constant", value: 1 },
          ],
        },
      ],
    },
    availableTactics: [
      { id: "rw", hypothesis: "h_sig", labelOverride: "rw [h_sig]" },
      "ring",
      "simp",
      "rfl",
      "sorry",
    ],
    hints: [
      "Combine hypothesis rewriting with ring polynomial normalization.",
      "First, rewrite σ(n) on the Left-Hand Side using hypothesis 'h_sig'.",
      "Once substituted, both sides are polynomial expressions: apply 'ring' to close the capstone theorem!",
    ],
    leanTheoremName: "quasiperfect_quadratic_form",
    leanTypeSignature: "(n : Nat) (h_sig : σ(n) = 2 * n + 1) : (σ(n) - 1) + n^2 = (n + 1)^2 - 1",
    educationalConcept: {
      title: "Interactive Verification Capstone",
      summary: "Real formal verification in Lean 4 and Mathlib combines domain-specific definitions, hypothesis rewrites, and algebraic decision procedures (`ring`, `linarith`, `omega`) to prove deep mathematical conjectures.",
      mathNotation: "(σ(n) - 1) + n² = 2n + n² = (n + 1)² - 1",
      leanDocUrl: "https://lean-lang.org/",
      realWorldApplication: "Full-stack formal verification of cryptography, distributed consensus protocols, and mission-critical avionics.",
    },
  },
];
