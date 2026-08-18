"use client";

import { createStore, Store } from "../pubsub-store";
import { VoxelCoord } from "./types";

export interface NeuroStoreState {
  crosshair: VoxelCoord;
  hoverIntensity: number | null;
}

export const neuroStore: Store<NeuroStoreState> = createStore<NeuroStoreState>({
  crosshair: { x: 48, y: 48, z: 48 },
  hoverIntensity: null,
});
