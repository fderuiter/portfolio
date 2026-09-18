"use client";

import dynamic from "next/dynamic";

const RetroChaosOverlay = dynamic(
  () => import("./RetroChaosOverlay").then((mod) => mod.RetroChaosOverlay),
  { ssr: false }
);

export function RetroChaosOverlayWrapper() {
  return <RetroChaosOverlay />;
}
