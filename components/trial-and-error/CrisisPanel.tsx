"use client";

import React from "react";
import type { CrisisView } from "@/lib/trial-and-error";
import { CardBack } from "@/components/trial-and-error/cards/CardBack";
import { CardFlip } from "@/components/trial-and-error/cards/CardFlip";
import { LOUD_PRESETS } from "@/components/trial-and-error/LoudLayer";

interface CrisisPanelProps {
  view: CrisisView;
  /** Deal and flip motion may run (no reduced motion). */
  animate: boolean;
  /** The cabinet allows loud moments: the card slams onto the table. */
  loud: boolean;
  onChoose: (choiceId: string) => void;
  /** Receives the first choice the player can take, for focus. */
  firstChoiceRef: React.Ref<HTMLButtonElement>;
}

/**
 * The Blind's crisis (T&E-05): a card that deals face down, turns up, and
 * waits for an answer. Each choice states its deterministic consequence on
 * its own button, and a choice the player cannot afford says why.
 */
export function CrisisPanel({
  view,
  animate,
  loud,
  onChoose,
  firstChoiceRef,
}: CrisisPanelProps) {
  const { crisis, choices } = view;
  const firstOpen = choices.findIndex((c) => c.refusal === null);
  return (
    <section
      aria-labelledby="crisis-heading"
      className="@container mt-3 border border-rose-400/60 bg-[color:var(--te-surface-1)] p-3"
      data-testid="crisis"
    >
      <div className="flex flex-col gap-3 @md:flex-row">
        <div
          className={`h-40 w-28 shrink-0 ${loud ? LOUD_PRESETS.crisisSlam : ""}`}
          aria-hidden="true"
          data-testid="crisis-card"
        >
          <CardFlip
            faceUp
            dealt
            animate={animate}
            front={
              <span className="flex h-full flex-col justify-between border border-rose-400/70 bg-[#1f1214] p-2 text-[10px]">
                <span className="font-bold uppercase tracking-wider text-rose-300">
                  Crisis
                </span>
                <span className="text-xs font-bold text-zinc-100 break-words">
                  {crisis.name}
                </span>
                <span className="text-zinc-400">Answer before you play</span>
              </span>
            }
            back={
              <CardBack
                card={{ slot: `crisis-${crisis.id}`, faceDown: true }}
                className="h-full w-full"
              />
            }
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            id="crisis-heading"
            className="text-sm font-bold uppercase tracking-wider text-rose-200 break-words"
          >
            Crisis: {crisis.name}
          </h3>
          <p className="mt-1 text-xs text-zinc-300 break-words">
            {crisis.description} Answer it before the Blind can be played.
          </p>
          <div
            role="group"
            aria-label={`${crisis.name} choices`}
            className="mt-2 grid gap-2 @md:grid-cols-2"
          >
            {choices.map(({ choice, refusal }, index) => {
              const noteId = `crisis-${crisis.id}-${choice.id}-note`;
              return (
                <button
                  key={choice.id}
                  ref={index === firstOpen ? firstChoiceRef : undefined}
                  type="button"
                  onClick={() => onChoose(choice.id)}
                  disabled={refusal !== null}
                  aria-describedby={noteId}
                  className="flex min-h-[48px] min-w-0 flex-col items-start gap-1 border border-zinc-600 p-2 text-left text-xs touch-manipulation hover:bg-zinc-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="crisis-choice"
                >
                  <span className="font-bold text-zinc-100 break-words">
                    {choice.label}
                  </span>
                  <span id={noteId} className="text-zinc-300 break-words">
                    {choice.consequence}
                    {refusal && (
                      <span className="block text-rose-300">{refusal}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
