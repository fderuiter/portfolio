"use client";

import React, { useState } from "react";
import type {
  DialogueMoment,
  DialogueOption,
  DialogueStyle,
  PatrolEvent,
} from "@/lib/patrol";
import { createDialogueChoiceEvent, findDialogueOption } from "@/lib/patrol";
import {
  IconMessageCircle2,
  IconCheck,
  IconArrowRight,
} from "@tabler/icons-react";

/**
 * Props for the DialogueChoice component.
 */
interface DialogueChoiceProps {
  /** ID of the scenario this dialogue moment belongs to (recorded on the logged event). */
  scenarioId: string;
  /** The dialogue moment to present. */
  moment: DialogueMoment;
  /** Called once, when the patroller selects an option, with the rich PatrolEvent to append to shift history. */
  onChoose?: (event: PatrolEvent, option: DialogueOption) => void;
  /** Pre-resolved option id, e.g. when re-rendering a moment already answered earlier in the shift. */
  resolvedOptionId?: string;
  /** Optional CSS class overrides. */
  className?: string;
}

const STYLE_LABELS: Record<DialogueStyle, string> = {
  directive: "Directive",
  collaborative: "Collaborative",
  deferential: "Deferential",
  candid: "Candid",
  reassuring: "Reassuring",
};

/**
 * Interpersonal/delegation dialogue choice card (Issue #752).
 *
 * Presents a `DialogueMoment` as a set of non-binary communication-style
 * options — each described by clarity and closed-loop status rather than
 * marked right or wrong — and, once one is selected, logs a rich
 * `PatrolEvent` for the M7 debrief and shows the resulting response.
 *
 * Notice: Educational simulation prototype.
 */
export const DialogueChoice: React.FC<DialogueChoiceProps> = ({
  scenarioId,
  moment,
  onChoose,
  resolvedOptionId,
  className = "",
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    resolvedOptionId ?? null
  );

  const selectedOption = selectedId
    ? findDialogueOption(moment, selectedId)
    : undefined;

  const handleSelect = (option: DialogueOption) => {
    if (selectedId) return;
    setSelectedId(option.id);
    const event = createDialogueChoiceEvent(scenarioId, moment, option);
    onChoose?.(event, option);
  };

  return (
    <div
      role="group"
      aria-label={`Dialogue moment: ${moment.speaker}`}
      data-testid={`dialogue-moment-${moment.id}`}
      className={`flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 font-mono ${className}`}
    >
      <div className="flex items-start gap-2.5 pb-2 border-b border-zinc-800/70">
        <div className="p-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan shrink-0">
          <IconMessageCircle2 className="w-4 h-4" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
            {moment.speaker}
          </span>
          <p className="text-sm font-sans text-zinc-100 italic leading-snug">
            &ldquo;{moment.prompt}&rdquo;
          </p>
          {moment.context && (
            <p className="text-[11px] font-sans text-zinc-500 leading-snug">
              {moment.context}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {moment.options.map((option) => {
          const isSelected = selectedId === option.id;
          const isDisabled = Boolean(selectedId) && !isSelected;
          return (
            <button
              key={option.id}
              type="button"
              data-testid={`dialogue-option-${option.id}`}
              disabled={isDisabled}
              aria-pressed={isSelected}
              onClick={() => handleSelect(option)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelect(option);
                }
              }}
              className={`min-h-[44px] min-w-[44px] text-left px-3.5 py-2.5 rounded-xl border transition-all flex flex-col gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${
                isSelected
                  ? "bg-brand-cyan/10 border-brand-cyan/50 text-white"
                  : isDisabled
                    ? "bg-zinc-950/40 border-zinc-800/40 text-zinc-500 cursor-not-allowed opacity-60"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white cursor-pointer"
              }`}
            >
              <span className="text-xs font-sans leading-snug">
                {option.text}
              </span>
              <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                <span>{STYLE_LABELS[option.style]}</span>
                <span aria-hidden="true">&bull;</span>
                <span>{option.clarity} clarity</span>
                {option.closesLoop && (
                  <>
                    <span aria-hidden="true">&bull;</span>
                    <span className="text-emerald-400">Closed-loop</span>
                  </>
                )}
                {isSelected && (
                  <IconCheck className="w-3 h-3 text-brand-cyan ml-auto shrink-0" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <div
          data-testid="dialogue-response"
          className="mt-1 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1.5"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <IconArrowRight className="w-3 h-3 text-brand-cyan" />
            <span>Response</span>
          </div>
          <p className="text-xs font-sans text-zinc-200 leading-relaxed">
            {selectedOption.response}
          </p>
          <p className="text-[11px] font-sans text-zinc-500 italic leading-relaxed">
            {selectedOption.debriefNote}
          </p>
        </div>
      )}
    </div>
  );
};
