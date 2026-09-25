import {
  DEMOGRAPHICS_SCENARIO,
  ScenarioSchema,
  type Scenario,
} from "@/lib/trial-and-error";

/**
 * The Small Blind with Table 14.1.1 as a closed-session output: its shell is
 * blinded, so Drafts A, B and C are dealt face down, and a DMC is chartered
 * to convene the closed session. Act I stays unblinded (ADR 0046); DMC
 * encounters arrive in Act II, so the mechanic is exercised here.
 */
export const DMC_SCENARIO: Scenario = ScenarioSchema.parse({
  ...DEMOGRAPHICS_SCENARIO,
  shells: DEMOGRAPHICS_SCENARIO.shells.map((shell) =>
    shell.id === "T-14.1.1" ? { ...shell, isBlinded: true } : shell
  ),
  dmc: { charter: "DMC Charter §7.2 (closed-session procedures)" },
});

/** The three blinded drafts, in deal order. */
export const BLINDED = ["C-T14.1.1-A", "C-T14.1.1-B", "C-T14.1.1-C"] as const;

/** Closed-session values printed on the blinded drafts: none may leak. */
export const CLOSED_VALUES = ["49.8", "40.7", "45.3", "66.67"];
