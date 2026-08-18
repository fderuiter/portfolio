"use client";

import React, { useState } from "react";
import { AnatomicalParcel, SurfaceMode, VoxelCoord } from "@/lib/neuro/types";
import { useAdaptiveResource } from "@/hooks/useAdaptiveResource";
import { Brain3DPoster } from "./Brain3DPoster";
import { Brain3DViewer } from "./Brain3DViewer";

interface AdaptiveBrain3DViewerProps {
  surfaceMode: SurfaceMode;
  crosshair: VoxelCoord;
  modelUrl?: string;
  wireframe?: boolean;
  onSurfaceChange?: (mode: SurfaceMode) => void;
  onCrosshairChange?: (coord: VoxelCoord) => void;
  forceDefer?: boolean;
  forceActivate?: boolean;
}

export const AdaptiveBrain3DViewer: React.FC<AdaptiveBrain3DViewerProps> = (props) => {
  const capabilities = useAdaptiveResource();
  const [isUserActivated, setIsUserActivated] = useState(false);

  const shouldDefer =
    props.forceDefer ?? (capabilities.shouldDefer3D && !props.forceActivate);

  const isActivated = isUserActivated || !shouldDefer;

  if (!isActivated) {
    return (
      <Brain3DPoster
        surfaceMode={props.surfaceMode}
        isCellular={capabilities.connection.isCellularOrConstrained}
        onActivate={() => setIsUserActivated(true)}
      />
    );
  }

  return <Brain3DViewer {...props} />;
};
