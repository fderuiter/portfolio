"use client";

import dynamic from "next/dynamic";
import { env } from "@/lib/env";

const RetroChaosOverlay = dynamic(
  () => import("@/components/RetroChaosOverlay").then((mod) => mod.RetroChaosOverlay),
  { ssr: false }
);

const SearchWrapper = dynamic(
  () => import("@/components/SearchWrapper").then((mod) => mod.SearchWrapper),
  { ssr: false }
);

const DevOverflowHud = env.NODE_ENV !== "production"
  ? dynamic(
      () => import("@/components/ui/DevOverflowHud").then((mod) => mod.DevOverflowHud),
      { ssr: false }
    )
  : () => null;

export function DynamicOverlays() {
  return (
    <>
      <RetroChaosOverlay />
      <SearchWrapper />
      <DevOverflowHud />
    </>
  );
}
