"use client";

import React from "react";
import { motion } from "framer-motion";
import type { CashOutReport } from "@/lib/trial-and-error";

interface CashOutProps {
  report: CashOutReport;
  /** Paid: the lines tick in one by one; otherwise they are a preview. */
  paid: boolean;
  /** Animate the tick-in. False under reduced motion. */
  animate: boolean;
  /** The table allows loud effects (≥768px, no reduced motion). */
  loud: boolean;
}

/**
 * The sponsor's cash-out for a cleared Blind (#948): each payout
 * line ticks in, then the total rolls into the study budget. Before it is
 * paid it previews what the sponsor owes. The domain computes every amount.
 */
export function CashOut({ report, paid, animate, loud }: CashOutProps) {
  return (
    <section
      aria-labelledby="cash-out-heading"
      className="mx-auto mt-4 max-w-md text-left"
      data-testid="cash-out"
    >
      <h3
        id="cash-out-heading"
        className="text-xs font-bold uppercase tracking-wider text-zinc-200"
      >
        {paid ? "Cash-out" : "Sponsor owes"}
      </h3>
      <ol className="mt-2 divide-y divide-zinc-800 border border-zinc-800 text-xs">
        {report.lines.map((line, i) => (
          <motion.li
            key={line.id}
            // Transform only: the text never fades, so contrast holds.
            initial={animate && paid ? { x: -12, scale: 0.97 } : false}
            animate={{ x: 0, scale: 1 }}
            transition={{ delay: animate ? i * 0.25 : 0, duration: 0.2 }}
            className="flex min-w-0 items-baseline justify-between gap-3 px-3 py-2"
            data-testid="cash-out-line"
          >
            <span className="min-w-0 break-words text-zinc-300">
              {line.label}
            </span>
            <span className="shrink-0 font-bold tabular-nums text-amber-300">
              +${line.amount}k
            </span>
          </motion.li>
        ))}
        <motion.li
          initial={animate && paid ? { scale: 0.94 } : false}
          animate={{ scale: 1 }}
          transition={{
            delay: animate ? report.lines.length * 0.25 : 0,
            duration: 0.25,
          }}
          className={`flex items-baseline justify-between gap-3 px-3 py-2 ${paid && loud ? "te-loud-glow" : ""}`}
        >
          <span className="font-bold uppercase text-zinc-100">Total</span>
          <span
            className="font-bold tabular-nums text-emerald-300"
            data-testid="cash-out-total"
          >
            ${report.total}k
          </span>
        </motion.li>
      </ol>
    </section>
  );
}
