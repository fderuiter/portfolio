"use client";

import React from "react";
import type { PatrolScenario, ScenarioAction } from "@/lib/patrol";
import {
  SceneInteraction,
  type SceneInteractionProps,
} from "./SceneInteraction";

/**
 * Props for the SceneInteractionPlaceholder component.
 */
interface SceneInteractionPlaceholderProps extends Partial<SceneInteractionProps> {
  /** The active patrol scenario. */
  scenario: PatrolScenario | null;
  /** Chronological history of actions executed during this shift. */
  actionHistory: ScenarioAction[];
  /** Callback triggered when a clinical/operational action is executed on scene. */
  onExecuteAction: (action: ScenarioAction) => void;
  /** Callback triggered to finish scene stabilization and transition to toboggan transport. */
  onPrepareTransport: () => void;
}

/**
 * Backwards compatibility facade for SceneInteraction.
 * // PLACEHOLDER — needs OEC/NSP content review, see #744
 */
export const SceneInteractionPlaceholder: React.FC<
  SceneInteractionPlaceholderProps
> = (props) => {
  return <SceneInteraction {...props} />;
};
