import dynamic from "next/dynamic";
import type { TabletOrientationHintProps } from "./TabletOrientationHint";

export const DynamicTabletOrientationHint = dynamic<TabletOrientationHintProps>(
  () =>
    import("./TabletOrientationHint").then((mod) => mod.TabletOrientationHint),
  { ssr: false }
);
