"use client";

import dynamic from "next/dynamic";

export const DynamicCommandPalette = dynamic(
  () => import("@/components/CommandPalette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

export const DynamicTimeline = dynamic(
  () => import("@/components/Timeline").then((mod) => mod.Timeline),
  { ssr: false }
);

export const DynamicAnimatedGridPattern = dynamic(
  () =>
    import("@/components/AnimatedGridPattern").then(
      (mod) => mod.AnimatedGridPattern
    ),
  { ssr: false }
);
