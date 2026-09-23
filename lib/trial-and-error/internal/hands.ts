import type { HandBaseScore, HandType } from "../types";

/** Base Chips and +Mult per hand, as pinned by the governing map (#890). */
export const HAND_BASE_SCORES: Readonly<Record<HandType, HandBaseScore>> =
  Object.freeze({
    HIGH_TABLE: {
      handType: "HIGH_TABLE",
      baseChips: 15,
      baseMult: 1,
      description: "Single validated output",
    },
    TLF_PAIR: {
      handType: "TLF_PAIR",
      baseChips: 30,
      baseMult: 2,
      description: "Table plus its supporting Listing",
    },
    TLF_TWO_PAIR: {
      handType: "TLF_TWO_PAIR",
      baseChips: 60,
      baseMult: 4,
      description: "Two Tables plus two supporting Listings",
    },
    POPULATION_FLUSH: {
      handType: "POPULATION_FLUSH",
      baseChips: 100,
      baseMult: 7,
      description: "Five outputs sharing one population snapshot",
    },
    CSR_STRAIGHT: {
      handType: "CSR_STRAIGHT",
      baseChips: 140,
      baseMult: 10,
      description:
        "Disposition, Baseline, Primary Efficacy, Safety AE, Patient Listing",
    },
    EFFICACY_FULL_HOUSE: {
      handType: "EFFICACY_FULL_HOUSE",
      baseChips: 160,
      baseMult: 14,
      description: "Three Tables plus two dependent Figures",
    },
    MEDDRA_FIVE_OF_A_KIND: {
      handType: "MEDDRA_FIVE_OF_A_KIND",
      baseChips: 200,
      baseMult: 18,
      description: "Five distinct MedDRA System Organ Class tables",
    },
  });
