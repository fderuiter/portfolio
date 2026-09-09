"use client";

import { UnifiedErrorLayout } from "@/components/UnifiedErrorLayout";

export default function NotFound() {
  return (
    <UnifiedErrorLayout
      badge="ERROR 404"
      title="This page wandered off."
      description="That address doesn’t lead to a page here. It may have moved, or there may be a typo in the link."
      secondaryActionText="Back to Home"
      secondaryActionHref="/"
      showRetroLabyrinth={true}
    />
  );
}
