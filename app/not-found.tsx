"use client";

import { UnifiedErrorLayout } from "@/components/UnifiedErrorLayout";

export default function NotFound() {
  return (
    <UnifiedErrorLayout
      badge="ERROR 404"
      title="Route Unresolved"
      description="The requested system node could not be resolved. This endpoint might have been deleted, moved, or never existed in the production schema."
      secondaryActionText="Return to Core"
      secondaryActionHref="/"
      showRetroLabyrinth={true}
    />
  );
}
