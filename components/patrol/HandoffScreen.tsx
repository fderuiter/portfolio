"use client";

import React from "react";
import type { PatrolScenario, ScenarioAction } from "@/lib/patrol";
import { HandoffPanel, type HandoffPanelProps } from "./HandoffPanel";

/**
 * Props for the HandoffScreen component.
 */
interface HandoffScreenProps extends Partial<HandoffPanelProps> {
  /** The active patrol scenario. */
  scenario: PatrolScenario | null;
  /** History of actions executed on scene and during transport. */
  actionHistory: ScenarioAction[];
  /** Total elapsed minutes spent on this incident call. */
  timeElapsedMinutes: number;
  /** Callback triggered to transfer care to EMS/clinic staff and advance to debrief. */
  onCompleteHandoff: () => void;
}

/**
 * Backwards compatibility facade for HandoffPanel.
 * // PLACEHOLDER — needs OEC/NSP content review, see #744
 */
export const HandoffScreen: React.FC<HandoffScreenProps> = (props) => {
  return <HandoffPanel {...props} />;
};
