import type { GuidanceCard, HandType } from "../types";

/**
 * The Guidance card catalog: one card per hand type, each named after a real
 * guidance document (T&E-UX-05, #947). Using one levels its hand up by the
 * bonus in `HAND_LEVEL_BONUS`. The flavour is insider humour, not regulatory
 * advice.
 */
export const GUIDANCE_CARDS: Readonly<Record<HandType, GuidanceCard>> =
  Object.freeze({
    HIGH_TABLE: {
      id: "GUIDE-FDA-TCG",
      name: "FDA Study Data TCG",
      document: "FDA Study Data Technical Conformance Guide",
      handType: "HIGH_TABLE",
      flavor:
        "Read it once, cover to cover, and you will never again wonder why the define.xml is late.",
      sellValue: 1,
    },
    TLF_PAIR: {
      id: "GUIDE-SDTM-IG",
      name: "CDISC SDTM IG",
      document: "CDISC Study Data Tabulation Model Implementation Guide",
      handType: "TLF_PAIR",
      flavor:
        "Every listing has a domain. Every domain has a SUPP. Every SUPP has a story nobody wants to hear.",
      sellValue: 1,
    },
    TLF_TWO_PAIR: {
      id: "GUIDE-ADAM-IG",
      name: "CDISC ADaM IG",
      document: "CDISC Analysis Data Model Implementation Guide",
      handType: "TLF_TWO_PAIR",
      flavor:
        "One PARAMCD per row, traceability to the source, and a quiet sense of moral superiority.",
      sellValue: 2,
    },
    POPULATION_FLUSH: {
      id: "GUIDE-ICH-E9",
      name: "ICH E9",
      document: "ICH E9: Statistical Principles for Clinical Trials",
      handType: "POPULATION_FLUSH",
      flavor:
        "Define the analysis sets before unblinding. Then define them again, in the SAP, in bold.",
      sellValue: 2,
    },
    CSR_STRAIGHT: {
      id: "GUIDE-ICH-E3",
      name: "ICH E3",
      document: "ICH E3: Structure and Content of Clinical Study Reports",
      handType: "CSR_STRAIGHT",
      flavor: "Section 16 is where good intentions go to become appendices.",
      sellValue: 3,
    },
    EFFICACY_FULL_HOUSE: {
      id: "GUIDE-ICH-E9R1",
      name: "ICH E9(R1)",
      document: "ICH E9(R1): Estimands and Sensitivity Analysis",
      handType: "EFFICACY_FULL_HOUSE",
      flavor:
        "Name the intercurrent event, pick a strategy, and never say “per-protocol” in the estimand meeting.",
      sellValue: 3,
    },
    MEDDRA_FIVE_OF_A_KIND: {
      id: "GUIDE-ICH-E2A",
      name: "ICH E2A",
      document: "ICH E2A: Clinical Safety Data Management",
      handType: "MEDDRA_FIVE_OF_A_KIND",
      flavor:
        "Serious is not the same as severe. Say it with the safety physician, slowly, until it sticks.",
      sellValue: 3,
    },
  });
