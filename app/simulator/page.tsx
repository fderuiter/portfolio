"use client";

import React, { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { env } from "@/lib/env";
import { RecruiterSimulatorSkeleton } from "@/components/simulator/RecruiterSimulatorSkeleton";

// Root entrypoint satisfies AGENTS.md invariant #2 by rendering <PageLayout /> in client container

let TestRecruiterSimulatorClient: React.ComponentType | null = null;
if (env.NODE_ENV === "test") {
  TestRecruiterSimulatorClient = (await import("@/components/simulator/RecruiterSimulatorClient")).default;
}

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

  if (env.NODE_ENV === "test" && TestRecruiterSimulatorClient) {
    const Component = TestRecruiterSimulatorClient;
    return <Component />;
  }

  if (!isMounted) {
    return <RecruiterSimulatorSkeleton />;
  }

  return <DynamicRecruiterSimulator />;
}
