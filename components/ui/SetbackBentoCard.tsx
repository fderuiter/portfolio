"use client";

import React from "react";
import { Card, CardTitle } from "@/components/BentoGrid";
import { PretextRichText, type ExtendedRichInlineItem } from "@/hooks/usePretextLayout";
import { IconAlertTriangle, IconChevronRight } from "@tabler/icons-react";
import { type RichInlineLine } from "@chenglou/pretext/rich-inline";
import Link from "next/link";
import { useTelemetry } from "@/hooks/useTelemetry";

interface SetbackBentoCardProps {
  setback: {
    id: string;
    title: string;
    editorial_content: string;
    created_at: Date;
    updated_at: Date;
    caseStudyId: string;
    parentSlug: string;
    parentTitle: string;
    primary_language: string;
  };
  className?: string;
  preCalculatedHeight?: number;
  preCalculatedLines?: RichInlineLine[];
  preCalculatedItems?: ExtendedRichInlineItem[];
}

export const SetbackBentoCard: React.FC<SetbackBentoCardProps> = ({
  setback,
  className,
  preCalculatedHeight,
  preCalculatedLines,
  preCalculatedItems,
}) => {
  const { recordEvent } = useTelemetry();

  const finalHeight = preCalculatedHeight;
  const finalLines = preCalculatedLines || [];
  const finalItems = preCalculatedItems || [];
  const isLayoutReady = preCalculatedHeight !== undefined;

  return (
    <Card
      className={`${className} border-red-950/40 hover:border-red-800/40 bg-zinc-950/90 shadow-[inset_0_1px_1px_rgba(239,68,68,0.02)]`}
      style={{
        height: finalHeight ? `${finalHeight}px` : "auto",
        transition: "height 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Card Top Pill & Header */}
          <div className="flex justify-between items-center mb-3">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold border border-red-500/20 rounded-md bg-red-950/20 text-red-400 flex items-center gap-1.5">
              <IconAlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
              TECHNICAL SETBACK
            </span>
            <span className="text-[10px] font-mono text-zinc-600">
              {setback.parentSlug.toUpperCase()} / POST-MORTEM
            </span>
          </div>

          <CardTitle className="text-lg md:text-xl font-extrabold tracking-tight text-neutral-100">
            {setback.title}
          </CardTitle>

          {/* Parent Case Study Subheader */}
          <div className="text-xs font-mono text-zinc-500 mb-4 flex items-center gap-1">
            <span className="text-zinc-600">Context:</span>
            <Link
              href={`/case-studies/${setback.parentSlug}`}
              className="text-brand-cyan hover:underline hover:text-brand-cyan/80 transition-colors"
            >
              {setback.parentTitle}
            </Link>
          </div>

          {/* Description Block using Pretext Rich Text */}
          <div className="mb-4">
            <div>
              <PretextRichText
                lines={finalLines}
                items={finalItems}
                lineHeight={21} // match standard layout-config line height
                isReady={isLayoutReady}
                fallbackText={setback.editorial_content}
                className="text-zinc-400 text-sm leading-relaxed font-sans"
              />
            </div>
          </div>
        </div>

        {/* Footer analyze link */}
        <div className="flex justify-between items-center border-t border-zinc-900/40 pt-3 mt-2">
          <Link
            href={`/case-studies/${setback.parentSlug}`}
            onClick={() => recordEvent(setback.parentSlug, "project_click")}
            className="inline-flex items-center text-xs font-bold text-red-400/80 hover:text-red-400 transition-colors duration-300 cursor-pointer relative z-10"
          >
            <span>Analyze Architecture</span>
            <IconChevronRight className="ml-1 w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <div className="text-[9px] font-mono text-zinc-600">
            {!isLayoutReady ? "MEASURING..." : `H: ${finalHeight}px`}
          </div>
        </div>
      </div>
    </Card>
  );
};
