"use client";

import dynamic from "next/dynamic";

const CommandPalette = dynamic(
  () => import("./CommandPalette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

export function SearchWrapper() {
  return <CommandPalette />;
}
