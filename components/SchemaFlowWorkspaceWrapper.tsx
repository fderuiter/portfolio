"use client";

import React from "react";
import dynamic from "next/dynamic";

const SchemaFlowWorkspace = dynamic(
  () => import("@/components/SchemaFlowWorkspace"),
  { ssr: false }
);

export default function SchemaFlowWorkspaceWrapper() {
  return <SchemaFlowWorkspace />;
}
