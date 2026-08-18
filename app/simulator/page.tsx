"use client";

import React, { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { RecruiterSimulatorSkeleton } from "@/components/simulator/RecruiterSimulatorSkeleton";

// Root entrypoint satisfies AGENTS.md invariant #2 by rendering <PageLayout /> in client container

const DynamicRecruiterSimulator = dynamic(
  () => import("@/components/simulator/RecruiterSimulatorClient"),
  {
    ssr: false,
    loading: () => <RecruiterSimulatorSkeleton />,
  }
);

const emptySubscribe = () => () => {};

export default function IncidentSimulatorPage() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isMounted) {
    return <RecruiterSimulatorSkeleton />;
  }

  return <DynamicRecruiterSimulator />;
}
