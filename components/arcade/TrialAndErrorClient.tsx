"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { IconArrowLeft, IconTable } from "@tabler/icons-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PlayCabinet } from "@/components/arcade/PlayCabinet";
import { useTeMotion } from "@/components/trial-and-error/useTeMotion";

const QcDeskLoader = () =>
  import("@/components/trial-and-error/QcDesk").then((mod) => mod.QcDesk);

const DynamicQcDesk = dynamic(QcDeskLoader, {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[380px] items-center justify-center p-8 font-mono text-xs text-zinc-400">
      Loading QC Desk…
    </div>
  ),
});

export const TrialAndErrorClient: React.FC = () => {
  const { loudEffectsEnabled } = useTeMotion();
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#0d0e11] px-4 pb-24 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-zinc-800 pb-4 sm:gap-4">
          <Link
            href="/arcade"
            className="inline-flex min-h-[48px] items-center gap-1.5 font-mono text-xs text-zinc-300 hover:text-amber-400"
          >
            <IconArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Arcade Hub</span>
          </Link>
          <Breadcrumbs
            items={[
              { label: "Arcade Hub", href: "/arcade" },
              { label: "Trial & Error: Biostat Ops" },
            ]}
          />
        </div>

        <div className="mb-8 min-w-0">
          <h1 className="font-mono text-3xl font-extrabold tracking-[-0.035em] text-zinc-100 break-words sm:text-4xl">
            Trial &amp; Error:{" "}
            <span className="text-amber-400">Biostat Ops</span>
          </h1>
          <p className="mt-2 max-w-3xl font-mono text-xs text-zinc-300 sm:text-sm">
            A deckbuilder where clinical outputs are the cards. Review the
            staged Demographics table against its SAP, correct the redlines, and
            play a hand worth Chips × Mult to beat the Blind. Every study,
            subject and rule here is fictional; nothing is clinical or
            regulatory advice.
          </p>
        </div>

        {/* Cabinet scope for the --te-* tokens and loud-moment layers (ADR 0046 amendment). */}
        <div
          data-te-cabinet=""
          data-te-loud={loudEffectsEnabled ? "on" : "off"}
          className="border border-zinc-800 bg-[#13151a] p-1.5 sm:p-4"
        >
          <PlayCabinet
            gameId="trial-and-error"
            title="Trial & Error: Biostat Ops"
            subtitle="QC Desk · Small Blind"
            accentColor="amber"
            icon={
              <IconTable
                className="h-8 w-8 text-amber-400"
                aria-hidden="true"
              />
            }
            instructions="Inspect each cell of Table 14.1.1 against the SAP. Correct redlines to earn +Mult; an uncorrected denominator error zeroes the hand. Approve & Play costs 2 CPU, Reject & Discard costs 1 CPU."
            controls={[
              { key: "Arrows", action: "Move the review cursor" },
              { key: "Enter / Space", action: "Inspect cell" },
              { key: "C", action: "Flag & correct finding" },
              { key: "P", action: "Approve & Play (2 CPU)" },
              { key: "D", action: "Reject & Discard (1 CPU)" },
            ]}
            importComponent={QcDeskLoader}
          >
            <DynamicQcDesk />
          </PlayCabinet>
        </div>
      </div>
    </div>
  );
};
