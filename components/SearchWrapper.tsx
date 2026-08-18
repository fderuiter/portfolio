"use client";

import dynamic from "next/dynamic";
import { useSearch } from "@/components/providers/SearchProvider";

const DynamicCommandPalette = dynamic(
  () => import("./CommandPalette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

export function SearchWrapper() {
  const { isOpen } = useSearch();

  if (!isOpen) {
    return null;
  }

  return <DynamicCommandPalette />;
}
