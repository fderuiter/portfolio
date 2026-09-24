"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconDeviceDesktop } from "@tabler/icons-react";

// The gate matches `(pointer: coarse) and (max-width: 1023px)` (ADR 0047):
// phones in either orientation and tablets held in portrait. A desktop window
// resized narrow keeps its fine pointer and still gets the game. It is decided
// in CSS rather than with matchMedia so the server-rendered HTML is already
// correct: no hydration flash of the cabinet on phones, or of the notice on
// desktops.
const SHOW_ON_DESKTOP =
  "[@media(pointer:coarse)_and_(max-width:1023px)]:hidden";
const SHOW_ON_TOUCH_COMPACT =
  "hidden [@media(pointer:coarse)_and_(max-width:1023px)]:block";

interface DesktopOnlyGateProps {
  /** Game name used in the notice, e.g. "Laser Loon". */
  gameTitle: string;
  children: React.ReactNode;
}

/**
 * Replaces a game's play area with a desktop-only notice on phones and
 * portrait tablets. The route's heading, description and metadata render
 * unchanged, so shared links and search previews still describe the game.
 * "Try it anyway" reveals the cabinet on this page.
 */
export function DesktopOnlyGate({ gameTitle, children }: DesktopOnlyGateProps) {
  const [override, setOverride] = useState(false);

  if (override) return <>{children}</>;

  return (
    <div data-desktop-only-gate="" className="w-full min-w-0">
      <div className={SHOW_ON_DESKTOP}>{children}</div>
      <div className={SHOW_ON_TOUCH_COMPACT} data-testid="desktop-only-notice">
        <div className="flex min-h-[min(380px,65dvh)] flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-[#13151a] px-5 py-10 text-center">
          <IconDeviceDesktop
            className="h-10 w-10 text-amber-400"
            aria-hidden="true"
          />
          <h2 className="max-w-sm font-mono text-lg font-bold tracking-[-0.035em] text-zinc-100 break-words">
            {gameTitle} is a desktop game for now
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-zinc-300">
            Honestly, it&apos;s not much fun on a phone yet: the controls are
            cramped and the screen is too small to see what&apos;s going on.
            Open this page on a laptop or desktop and it plays the way it
            should.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/arcade"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-zinc-700 px-4 font-mono text-xs font-bold text-zinc-100 active:scale-[0.98]"
            >
              Back to the Arcade
            </Link>
            <button
              type="button"
              onClick={() => setOverride(true)}
              className="inline-flex min-h-[44px] items-center px-3 font-mono text-xs text-zinc-400 underline underline-offset-4 hover:text-zinc-200 active:scale-[0.98]"
            >
              Try it anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
