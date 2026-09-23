"use client";

import React, { useRef, useState } from "react";
import {
  Reorder,
  motion,
  useDragControls,
  useMotionValue,
} from "framer-motion";
import type { PopulationType, TableCardView } from "@/lib/trial-and-error";
import { CardBack } from "@/components/trial-and-error/cards/CardBack";
import { CardFace } from "@/components/trial-and-error/cards/CardFace";
import { CardFlip } from "@/components/trial-and-error/cards/CardFlip";

const SUIT_BORDER: Record<PopulationType, string> = {
  ITT: "border-l-[color:var(--te-suit-itt)]",
  SAFETY: "border-l-[color:var(--te-suit-safety)]",
  PER_PROTOCOL: "border-l-[color:var(--te-suit-pp)]",
  FAS: "border-l-[color:var(--te-suit-fas)]",
  SCREENED: "border-l-[color:var(--te-suit-screened)]",
};

const LONG_PRESS_MS = 500;
const TILT_DEG = 8;

interface HandCardProps {
  view: TableCardView;
  index: number;
  count: number;
  /** Fan, tilt, deal and flip motion may run (≥768px, no reduced motion). */
  physical: boolean;
  /** Deal and flip motion may run (no reduced motion). */
  animate: boolean;
  tabIndex: number;
  label: string;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onActivate: (pointerType: string) => void;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onLongPress: () => void;
  onDragEnd: () => void;
}

/**
 * One card in the hand: a physical object. It fans on an arc, lifts and tilts
 * toward the pointer, breathes at rest (CSS only), deals face down and turns
 * up, and drags by its grip to reorder. Every motion is transform or opacity.
 */
export function HandCard({
  view,
  index,
  count,
  physical,
  animate,
  tabIndex,
  label,
  buttonRef,
  onActivate,
  onFocus,
  onKeyDown,
  onLongPress,
  onDragEnd,
}: HandCardProps) {
  const controls = useDragControls();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const [raised, setRaised] = useState(false);
  const pointerType = useRef("mouse");
  const press = useRef<{
    timer: ReturnType<typeof setTimeout>;
    x: number;
    y: number;
  } | null>(null);
  const longPressed = useRef(false);

  const offset = index - (count - 1) / 2;
  // Overlap tightens as the hand grows past five cards.
  const overlap =
    physical && count > 5 ? Math.min(30, (count - 5) * 6) / 10 : 0;
  const lift = (view.selected ? -14 : 0) + (raised && physical ? -8 : 0);

  const cancelPress = () => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  };

  return (
    <Reorder.Item
      value={view.card.id}
      as="div"
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="relative w-36 shrink-0 md:w-40"
      style={{
        marginLeft: index > 0 && overlap > 0 ? `-${overlap}rem` : undefined,
        zIndex: raised ? 20 : view.selected ? 10 : index + 1,
      }}
      initial={animate ? { opacity: 0, y: -24 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={
        animate
          ? { opacity: 0, y: -40, transition: { duration: 0.2 } }
          : { opacity: 0, transition: { duration: 0 } }
      }
    >
      <span
        aria-hidden="true"
        title="Drag to reorder"
        onPointerDown={(e) => controls.start(e)}
        className="absolute -top-5 left-1/2 z-10 flex h-5 w-10 -translate-x-1/2 cursor-grab touch-none items-center justify-center text-[10px] leading-none text-zinc-400 active:cursor-grabbing"
        data-testid="drag-grip"
      >
        ⠿
      </span>
      <motion.button
        type="button"
        ref={buttonRef}
        tabIndex={tabIndex}
        aria-pressed={view.selected}
        aria-label={label}
        data-card-id={view.card.id}
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          onActivate(pointerType.current);
        }}
        onFocus={() => {
          setRaised(true);
          onFocus();
        }}
        onBlur={() => setRaised(false)}
        onKeyDown={onKeyDown}
        onPointerEnter={() => setRaised(true)}
        onPointerLeave={() => {
          setRaised(false);
          tiltX.set(0);
          tiltY.set(0);
          cancelPress();
        }}
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
          longPressed.current = false;
          const timer = setTimeout(() => {
            longPressed.current = true;
            press.current = null;
            onLongPress();
          }, LONG_PRESS_MS);
          press.current = { timer, x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          if (
            press.current &&
            Math.hypot(
              e.clientX - press.current.x,
              e.clientY - press.current.y
            ) > 8
          ) {
            cancelPress();
          }
          if (!physical || e.pointerType !== "mouse") return;
          const rect = e.currentTarget.getBoundingClientRect();
          tiltY.set(
            ((e.clientX - rect.left) / rect.width - 0.5) * 2 * TILT_DEG
          );
          tiltX.set(
            -((e.clientY - rect.top) / rect.height - 0.5) * 2 * TILT_DEG
          );
        }}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onContextMenu={(e) => {
          if (pointerType.current === "touch") e.preventDefault();
        }}
        animate={{
          y: (physical ? offset * offset * 1.5 : 0) + lift,
          rotate: physical && !raised ? offset * 2.5 : 0,
        }}
        transition={
          animate
            ? { type: "spring", stiffness: 420, damping: 30 }
            : { duration: 0 }
        }
        style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 700 }}
        className={`block h-[13.5rem] w-full min-w-0 border border-l-4 text-left text-xs touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${SUIT_BORDER[view.card.population]} ${
          view.selected
            ? "border-amber-400 bg-[#1f1a10]"
            : "border-zinc-700 bg-[color:var(--te-surface-1)]"
        } ${raised && physical ? "shadow-lg shadow-black/60" : ""}`}
      >
        <CardFlip
          faceUp
          dealt
          animate={animate}
          delay={animate ? Math.min(index, 8) * 0.04 : 0}
          front={
            <span
              className="te-card-wobble block h-full p-2"
              style={{ animationDelay: `${-index * 0.9}s` }}
            >
              <CardFace view={view} />
            </span>
          }
          back={
            <CardBack
              card={{ slot: `hand-${index}`, faceDown: true }}
              className="h-full w-full"
            />
          }
        />
      </motion.button>
    </Reorder.Item>
  );
}
