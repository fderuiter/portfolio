"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTelemetry } from "@/hooks/useTelemetry";
import { FieldManualButton } from "@/components/FieldManualButton";
import { FullscreenButton } from "@/components/arcade/FullscreenButton";
import { TabletOrientationHint } from "@/components/arcade/TabletOrientationHint";
import { useFullscreen } from "@/hooks/useFullscreen";
import {
  IconPlayerPlay,
  IconRotate,
  IconBone,
  IconBallTennis,
  IconSparkles,
  IconTrees,
  IconHeart,
  IconBrandGithub,
  IconCalendar,
  IconBriefcase,
  IconVolume,
  IconVolumeOff,
  IconBook,
  IconX,
  IconAlertTriangle,
  IconPhoto,
  IconPalette,
  IconMusic,
  IconMusicOff,
  IconInfoCircle,
  IconShirt,
  IconDroplet,
  IconCheck,
  IconCode,
} from "@tabler/icons-react";
import {
  WorkingWithDuckState,
  DuckBehaviorState,
  DuckAccessory,
  createInitialDuckGameState,
  stepDuckGame,
  throwBall,
  applySqueakyToy,
  applyKongToy,
  giveTreat,
  scrubBelly,
  startDraggingDuck,
  dragDuckTo,
  releaseDuck,
  performTrick,
  activeCodeBurst,
  interactStation,
  mopIndoorPuddle,
  enterBathtub,
  scrubBathtub,
  rinseBathtub,
  exitBathtub,
  equipAccessory,
  enterDogPark,
  throwParkBall,
  jumpParkHurdle,
  steerParkDuck,
  tapParkWhistle,
  exitDogPark,
  advanceToNextLevel,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DESK_BOUNDS,
  RUG_BOUNDS,
  DOG_BED_BOUNDS,
  BACK_DOOR_BOUNDS,
  WATER_BOWL_BOUNDS,
  FOOD_BOWL_BOUNDS,
  BATHTUB_BOUNDS,
  DUCK_FACTS,
  SPRINTS,
  SoundCue,
} from "@/lib/working-with-duck-engine";

const subscribeStorage = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getHighScoreSnapshot = () => {
  if (typeof window === "undefined") return "0";
  try {
    return window.localStorage && typeof window.localStorage.getItem === "function"
      ? window.localStorage.getItem("working_with_duck_high_score") || "0"
      : "0";
  } catch {
    return "0";
  }
};

const getServerSnapshot = () => "0";

// --- Pure Drawing Helpers Outside Component ---

function drawAccessories(
  ctx: CanvasRenderingContext2D,
  accessory: DuckAccessory,
  _duckState?: DuckBehaviorState
) {
  if (accessory === "none") return;

  if (accessory === "bucket-hat") {
    // Adidas Black Bucket Hat perched stylishly on head
    ctx.save();
    ctx.translate(22, -10);
    ctx.fillStyle = "#18181b";
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1;

    // Hat Crown
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hat Brim
    ctx.beginPath();
    ctx.ellipse(0, 4, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White Trefoil Stripes
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-4, -2, 8, 1.5);
    ctx.fillRect(-3, 1, 6, 1.2);
    ctx.restore();
  } else if (accessory === "bowtie") {
    // Executive Tech CEO Bowtie at neck
    ctx.save();
    ctx.translate(14, 0);
    ctx.fillStyle = "#0284c7";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;

    // Left wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, -5);
    ctx.lineTo(-6, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(6, -5);
    ctx.lineTo(6, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center knot
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (accessory === "bandana") {
    // Red Adventure Bandana
    ctx.save();
    ctx.translate(12, 0);
    ctx.fillStyle = "#ef4444";
    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 1;

    // Triangle Fold
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.lineTo(8, 0);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Polka dots
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-2, -3, 1, 0, Math.PI * 2);
    ctx.arc(-2, 3, 1, 0, Math.PI * 2);
    ctx.arc(2, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (accessory === "rain-boots") {
    // Yellow Rubber Rain Boots on all 4 paws
    const drawBoot = (bx: number, by: number) => {
      ctx.save();
      ctx.translate(bx, by);
      ctx.fillStyle = "#facc15";
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-4, -4, 8, 8, 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    drawBoot(-14, -14);
    drawBoot(-14, 14);
    drawBoot(12, -14);
    drawBoot(12, 14);
  }
}

function drawDuckPuppy(
  ctx: CanvasRenderingContext2D,
  duck: {
    x: number;
    y: number;
    angle: number;
    state: DuckBehaviorState;
    isCarryingBall: boolean;
    tailWagAngle?: number;
  },
  ticks: number,
  bellyRubProgress: number = 0,
  accessory: DuckAccessory = "none",
  isMuddy: boolean = false
) {
  ctx.save();
  ctx.translate(duck.x, duck.y);

  if (duck.state === "THE_FLOP") {
    // Outer Fluffy Fur Aura
    ctx.fillStyle = isMuddy ? "#a16207" : "#faf5ee";
    ctx.strokeStyle = isMuddy ? "#78350f" : "#fde68a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Soft Pink Belly Patch
    ctx.fillStyle = "#fdf2f8";
    ctx.beginPath();
    ctx.ellipse(0, 2, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly fluff texture
    ctx.strokeStyle = "#fbcfe8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-6, 2, 5, 0, Math.PI);
    ctx.arc(6, 2, 5, 0, Math.PI);
    ctx.stroke();

    // Paws up in the air with brown pads
    const drawPawUp = (px: number, py: number, rot: number) => {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.fillStyle = isMuddy ? "#78350f" : "#ffffff";
      ctx.strokeStyle = "#fde68a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.ellipse(0, 2, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-4, -5, 1.8, 0, Math.PI * 2);
      ctx.arc(0, -7, 1.8, 0, Math.PI * 2);
      ctx.arc(4, -5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawPawUp(-18, -16, -0.4);
    drawPawUp(18, -16, 0.4);
    drawPawUp(-20, 16, -0.2);
    drawPawUp(20, 16, 0.2);

    // Floppy ears spread wide on floor
    ctx.fillStyle = isMuddy ? "#854d0e" : "#fef08a";
    ctx.strokeStyle = "#fcd34d";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-24, -22, 8, 16, -0.6, 0, Math.PI * 2);
    ctx.ellipse(24, -22, 8, 16, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cute rounded marshmallow head
    ctx.fillStyle = isMuddy ? "#a16207" : "#ffffff";
    ctx.strokeStyle = "#fde68a";
    ctx.beginPath();
    ctx.ellipse(0, -22, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Happy curved sleeping puppy eyes
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-7, -24, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(7, -24, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Big button nose
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.arc(0, -18, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-1, -19, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Blushing puppy cheeks
    ctx.fillStyle = "#f472b6";
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(-13, -19, 4.5, 0, Math.PI * 2);
    ctx.arc(13, -19, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Belly Rub Progress Ring Overlay above Duck
    ctx.fillStyle = "#ec4899";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`❤️ SCRUB TUMMY (${Math.round(bellyRubProgress)}%)`, 0, -46);

    // Progress Bar Track
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(-35, -40, 70, 6);
    ctx.fillStyle = "#ec4899";
    ctx.fillRect(-35, -40, (70 * Math.min(100, bellyRubProgress)) / 100, 6);
    ctx.strokeStyle = "#fbcfe8";
    ctx.lineWidth = 1;
    ctx.strokeRect(-35, -40, 70, 6);

    ctx.restore();
    return;
  }

  if (duck.state === "NAP_TIME") {
    const breath = Math.sin(ticks * 0.05) * 1.5;
    ctx.fillStyle = isMuddy ? "#854d0e" : "#faf5ee";
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 2;

    // Body ball
    ctx.beginPath();
    ctx.arc(0, 0, 24 + breath, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fur texture
    ctx.fillStyle = isMuddy ? "#713f12" : "#ffffff";
    ctx.beginPath();
    ctx.arc(-4, -4, 18, 0, Math.PI * 2);
    ctx.fill();

    // Golden Floppy ear draped over face
    ctx.fillStyle = "#fef08a";
    ctx.strokeStyle = "#fcd34d";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-10, -6, 7, 13, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sleeping eye & nose
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-14, 4, 3.5, 0, Math.PI);
    ctx.stroke();

    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.arc(-18, 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Snooze Zzz
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Zzz...", -18, -26 - Math.sin(ticks * 0.08) * 4);
    ctx.restore();
    return;
  }

  // Walking / Roaming / Zooming Rotation
  ctx.rotate(duck.angle);

  // 1. Feathery Plume Tail with dynamic wagging wave
  const tailWag = duck.tailWagAngle ?? Math.sin(ticks * 0.3) * 0.4;
  ctx.save();
  ctx.translate(-22, 0);
  ctx.rotate(tailWag);
  ctx.fillStyle = isMuddy ? "#78350f" : "#faf5ee";
  ctx.strokeStyle = "#fef08a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.bezierCurveTo(-15, -8, -25, -2, -32, 4);
  ctx.bezierCurveTo(-24, 10, -10, 8, 0, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. Hind Paws & Haunches
  ctx.fillStyle = isMuddy ? "#78350f" : "#faf5ee";
  ctx.strokeStyle = "#fef08a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-14, -14, 10, 7, -0.2, 0, Math.PI * 2);
  ctx.ellipse(-14, 14, 10, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Plush Cream Body
  ctx.fillStyle = isMuddy ? "#a16207" : "#ffffff";
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Front Paws
  ctx.fillStyle = isMuddy ? "#78350f" : "#faf5ee";
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(12, -14, 7, 5, 0.3, 0, Math.PI * 2);
  ctx.ellipse(12, 14, 7, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Floppy Ears
  const earFlap = duck.state === "ZOOMIES" ? Math.sin(ticks * 0.4) * 0.15 : 0;
  ctx.fillStyle = isMuddy ? "#854d0e" : "#fef08a";
  ctx.strokeStyle = "#fcd34d";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(16, -12, 7, 10, -0.35 + earFlap, 0, Math.PI * 2);
  ctx.ellipse(16, 12, 7, 10, 0.35 - earFlap, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 6. Cute Marshmallow Head & Fluffy Cheeks
  ctx.fillStyle = isMuddy ? "#a16207" : "#ffffff";
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(20, 0, 15, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 7. Soulful Puppy Eyes
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.arc(24, -5, 3.2, 0, Math.PI * 2);
  ctx.arc(24, 5, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(23, -6, 1.2, 0, Math.PI * 2);
  ctx.arc(23, 4, 1.2, 0, Math.PI * 2);
  ctx.arc(25, -4, 0.6, 0, Math.PI * 2);
  ctx.arc(25, 6, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // 8. Soft Muzzle & Charcoal Button Nose
  ctx.fillStyle = isMuddy ? "#854d0e" : "#ffffff";
  ctx.beginPath();
  ctx.ellipse(29, 0, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.ellipse(32, 0, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Happy Pink Tongue
  if (
    duck.state === "ZOOMIES" ||
    duck.state === "FETCHING_BALL" ||
    duck.state === "NO_TAKE_THROW" ||
    duck.state === "PERFORMING_TRICK"
  ) {
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.ellipse(33, 2, 4, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Equipped Accessories
  drawAccessories(ctx, accessory, duck.state);

  // Tennis ball in mouth
  if (duck.isCarryingBall) {
    ctx.fillStyle = "#84cc16";
    ctx.beginPath();
    ctx.arc(36, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  ctx.restore();

  // Thought Bubble above Duck
  if (duck.state === "NO_TAKE_THROW") {
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("🎾 NO TAKE! (Press 4 or Call Drop It)", duck.x, duck.y - 34);
  } else if (duck.state === "SNIFFING_POTTY") {
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("🚽 DRAG TO DOOR!", duck.x, duck.y - 34);
  } else if (duck.state === "ZOOMIES") {
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("⚡ ZOOMIES!", duck.x, duck.y - 34);
  } else if (duck.state === "SNEAKY_CHEW") {
    ctx.fillStyle = "#f87171";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("😈 SNEAKY CHEW!", duck.x, duck.y - 34);
  } else if (duck.state === "PERFORMING_TRICK") {
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("✨ GOOD BOY TRICK!", duck.x, duck.y - 34);
  } else if (duck.state === "DRINKING_WATER") {
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("💧 Lap Lap Lap...", duck.x, duck.y - 34);
  } else if (duck.state === "EATING_KIBBLE") {
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("🍖 Munch Crunch...", duck.x, duck.y - 34);
  }
}

function drawOfficeScene(ctx: CanvasRenderingContext2D, state: WorkingWithDuckState) {
  // 1. Hardwood Floor
  ctx.fillStyle = "#1e1b18";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Floor Planks
  ctx.strokeStyle = "#292524";
  ctx.lineWidth = 1;
  for (let y = 0; y < CANVAS_HEIGHT; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Office Window on Top Wall
  ctx.fillStyle = "#0c4a6e";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.fillRect(360, 10, 85, 48);
  ctx.strokeRect(360, 10, 85, 48);

  // Sky & Clouds in Window
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(362, 12, 81, 44);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(380, 25, 8, 0, Math.PI * 2);
  ctx.arc(392, 22, 10, 0, Math.PI * 2);
  ctx.arc(405, 25, 8, 0, Math.PI * 2);
  ctx.fill();

  // Window Frame Crossbars
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(402, 10);
  ctx.lineTo(402, 58);
  ctx.moveTo(360, 34);
  ctx.lineTo(445, 34);
  ctx.stroke();

  // Squirrel at the Window
  if (state.activeSurpriseEvent?.type === "squirrel-window") {
    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    ctx.arc(425, 42, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(433, 36, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(340, 62, 125, 20);
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(340, 62, 125, 20);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("🐿️ CLICK WINDOW (+200)", 402, 75);
  }

  // 2. Cozy Plush Rug
  ctx.fillStyle = "#3f3f46";
  ctx.strokeStyle = "#71717a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(RUG_BOUNDS.x, RUG_BOUNDS.y, RUG_BOUNDS.width, RUG_BOUNDS.height, 24);
  ctx.fill();
  ctx.stroke();

  // Rug Pattern
  ctx.strokeStyle = "#52525b";
  ctx.lineWidth = 1.5;
  for (let rx = RUG_BOUNDS.x + 20; rx < RUG_BOUNDS.x + RUG_BOUNDS.width - 10; rx += 30) {
    ctx.beginPath();
    ctx.moveTo(rx, RUG_BOUNDS.y + 10);
    ctx.lineTo(rx, RUG_BOUNDS.y + RUG_BOUNDS.height - 10);
    ctx.stroke();
  }

  // 3. Desk & Developer Workspace
  ctx.fillStyle = "#18181b";
  ctx.strokeStyle = "#3f3f46";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(DESK_BOUNDS.x, DESK_BOUNDS.y, DESK_BOUNDS.width, DESK_BOUNDS.height, 16);
  ctx.fill();
  ctx.stroke();

  // Monitors
  ctx.fillStyle = "#09090b";
  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 1.5;
  ctx.fillRect(DESK_BOUNDS.x + 15, DESK_BOUNDS.y + 15, 65, 45);
  ctx.strokeRect(DESK_BOUNDS.x + 15, DESK_BOUNDS.y + 15, 65, 45);

  ctx.fillRect(DESK_BOUNDS.x + 90, DESK_BOUNDS.y + 15, 65, 45);
  ctx.strokeRect(DESK_BOUNDS.x + 90, DESK_BOUNDS.y + 15, 65, 45);

  // Code lines simulation
  ctx.fillStyle = "#22d3ee";
  ctx.fillRect(DESK_BOUNDS.x + 20, DESK_BOUNDS.y + 22, 35, 3);
  ctx.fillStyle = "#a855f7";
  ctx.fillRect(DESK_BOUNDS.x + 20, DESK_BOUNDS.y + 28, 48, 3);
  ctx.fillStyle = "#10b981";
  ctx.fillRect(DESK_BOUNDS.x + 20, DESK_BOUNDS.y + 34, 40, 3);
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(DESK_BOUNDS.x + 20, DESK_BOUNDS.y + 40, 25, 3);

  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(DESK_BOUNDS.x + 95, DESK_BOUNDS.y + 22, 40, 3);
  ctx.fillStyle = "#34d399";
  ctx.fillRect(DESK_BOUNDS.x + 95, DESK_BOUNDS.y + 28, 50, 3);
  ctx.fillStyle = "#f43f5e";
  ctx.fillRect(DESK_BOUNDS.x + 95, DESK_BOUNDS.y + 34, 30, 3);

  // Developer Avatar Head & Chair
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.arc(DESK_BOUNDS.x + 85, DESK_BOUNDS.y + 100, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#52525b";
  ctx.stroke();

  ctx.fillStyle = "#e4e4e7";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("YOU", DESK_BOUNDS.x + 85, DESK_BOUNDS.y + 104);

  // Interactive Code Prompt overlay on Desk
  ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
  ctx.fillRect(DESK_BOUNDS.x + 20, DESK_BOUNDS.y + 125, 130, 22);
  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 1;
  ctx.strokeRect(DESK_BOUNDS.x + 20, DESK_BOUNDS.y + 125, 130, 22);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 9px monospace";
  ctx.fillText("💻 FOCUS SPRINT (SPACE)", DESK_BOUNDS.x + 85, DESK_BOUNDS.y + 140);

  // 4. Dog Bed
  ctx.fillStyle = "#581c87";
  ctx.strokeStyle = "#a855f7";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(
    DOG_BED_BOUNDS.x + DOG_BED_BOUNDS.width / 2,
    DOG_BED_BOUNDS.y + DOG_BED_BOUNDS.height / 2,
    DOG_BED_BOUNDS.width / 2,
    DOG_BED_BOUNDS.height / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#7e22ce";
  ctx.beginPath();
  ctx.ellipse(
    DOG_BED_BOUNDS.x + DOG_BED_BOUNDS.width / 2,
    DOG_BED_BOUNDS.y + DOG_BED_BOUNDS.height / 2,
    DOG_BED_BOUNDS.width / 2 - 12,
    DOG_BED_BOUNDS.height / 2 - 10,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#e9d5ff";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("DUCK'S BED", DOG_BED_BOUNDS.x + DOG_BED_BOUNDS.width / 2, DOG_BED_BOUNDS.y + DOG_BED_BOUNDS.height / 2 + 3);

  // 5. Office Stations (Water & Food Bowls)
  // Water Bowl
  ctx.fillStyle = "#0284c7";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(WATER_BOWL_BOUNDS.x + 25, WATER_BOWL_BOUNDS.y + 20, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.ellipse(
    WATER_BOWL_BOUNDS.x + 25,
    WATER_BOWL_BOUNDS.y + 20,
    18 * (state.officeStations.waterLevel / 100),
    12 * (state.officeStations.waterLevel / 100),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 8px monospace";
  ctx.fillText(`💧 ${Math.round(state.officeStations.waterLevel)}%`, WATER_BOWL_BOUNDS.x + 25, WATER_BOWL_BOUNDS.y + 42);

  // Food Bowl
  ctx.fillStyle = "#d97706";
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(FOOD_BOWL_BOUNDS.x + 25, FOOD_BOWL_BOUNDS.y + 20, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#b45309";
  ctx.beginPath();
  ctx.ellipse(
    FOOD_BOWL_BOUNDS.x + 25,
    FOOD_BOWL_BOUNDS.y + 20,
    18 * (state.officeStations.foodLevel / 100),
    12 * (state.officeStations.foodLevel / 100),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 8px monospace";
  ctx.fillText(`🍖 ${Math.round(state.officeStations.foodLevel)}%`, FOOD_BOWL_BOUNDS.x + 25, FOOD_BOWL_BOUNDS.y + 42);

  // 6. Bathtub Washroom Door / Station
  const isMuddy = state.isMuddy;
  ctx.fillStyle = isMuddy ? "#0369a1" : "#0f172a";
  ctx.strokeStyle = isMuddy ? "#38bdf8" : "#334155";
  ctx.lineWidth = isMuddy ? 3 : 1.5;
  ctx.beginPath();
  ctx.roundRect(BATHTUB_BOUNDS.x, BATHTUB_BOUNDS.y, BATHTUB_BOUNDS.width, BATHTUB_BOUNDS.height, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isMuddy ? "#38bdf8" : "#94a3b8";
  ctx.font = "bold 9px monospace";
  ctx.fillText("🛁 BATHTUB", BATHTUB_BOUNDS.x + BATHTUB_BOUNDS.width / 2, BATHTUB_BOUNDS.y + 35);
  ctx.fillText(isMuddy ? "🧼 NEEDS WASH!" : "(CLEAN)", BATHTUB_BOUNDS.x + BATHTUB_BOUNDS.width / 2, BATHTUB_BOUNDS.y + 50);

  // 7. Back Door to Yard
  const isPottyUrgent = state.bladder > 75 || state.duck.state === "SNIFFING_POTTY" || state.duck.state === "DRAGGED";

  ctx.fillStyle = isPottyUrgent ? "#065f46" : "#064e3b";
  ctx.strokeStyle = isPottyUrgent ? "#34d399" : "#10b981";
  ctx.lineWidth = isPottyUrgent ? 3 : 2;
  ctx.beginPath();
  ctx.roundRect(BACK_DOOR_BOUNDS.x, BACK_DOOR_BOUNDS.y, BACK_DOOR_BOUNDS.width, BACK_DOOR_BOUNDS.height, 12);
  ctx.fill();
  ctx.stroke();

  if (isPottyUrgent) {
    ctx.save();
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(
      BACK_DOOR_BOUNDS.x - 4,
      BACK_DOOR_BOUNDS.y - 4,
      BACK_DOOR_BOUNDS.width + 8,
      BACK_DOOR_BOUNDS.height + 8
    );
    ctx.setLineDash([]);

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(state.duck.x, state.duck.y);
    ctx.lineTo(BACK_DOOR_BOUNDS.x + BACK_DOOR_BOUNDS.width / 2, BACK_DOOR_BOUNDS.y + BACK_DOOR_BOUNDS.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  ctx.fillStyle = "#047857";
  ctx.fillRect(BACK_DOOR_BOUNDS.x + 10, BACK_DOOR_BOUNDS.y + 10, BACK_DOOR_BOUNDS.width - 20, BACK_DOOR_BOUNDS.height - 20);

  ctx.fillStyle = "#a7f3d0";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText("BACK DOOR", BACK_DOOR_BOUNDS.x + BACK_DOOR_BOUNDS.width / 2, BACK_DOOR_BOUNDS.y + BACK_DOOR_BOUNDS.height / 2 - 4);
  ctx.fillText(isPottyUrgent ? "👉 DROP HERE" : "(POTTY YARD)", BACK_DOOR_BOUNDS.x + BACK_DOOR_BOUNDS.width / 2, BACK_DOOR_BOUNDS.y + BACK_DOOR_BOUNDS.height / 2 + 8);

  // Amazon Delivery Parcel Knock
  if (state.activeSurpriseEvent?.type === "amazon-delivery") {
    ctx.fillStyle = "#78350f";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.fillRect(BACK_DOOR_BOUNDS.x - 30, BACK_DOOR_BOUNDS.y + 40, 24, 24);
    ctx.strokeRect(BACK_DOOR_BOUNDS.x - 30, BACK_DOOR_BOUNDS.y + 40, 24, 24);
    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("📦", BACK_DOOR_BOUNDS.x - 18, BACK_DOOR_BOUNDS.y + 57);

    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(BACK_DOOR_BOUNDS.x - 70, BACK_DOOR_BOUNDS.y + 10, 80, 20);
    ctx.strokeStyle = "#fde68a";
    ctx.lineWidth = 1;
    ctx.strokeRect(BACK_DOOR_BOUNDS.x - 70, BACK_DOOR_BOUNDS.y + 10, 80, 20);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 8px monospace";
    ctx.fillText("📦 SIGN PACKAGE", BACK_DOOR_BOUNDS.x - 30, BACK_DOOR_BOUNDS.y + 23);
  }

  // 8. Portfolio Hazards
  state.hazards.forEach((hazard) => {
    const isTargeted = state.activeHazardTarget === hazard.id;
    ctx.save();

    if (isTargeted) {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.radius + 8 + Math.sin(state.ticks * 0.2) * 4, 0, Math.PI * 2);
      ctx.stroke();

      const maxTimer = state.duck.maxStateTimer || 240;
      const progress = Math.max(0, state.duck.stateTimer / maxTimer);
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.radius + 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();

      ctx.fillStyle = "#f97316";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("🦴 DROP KONG / CALL DROP IT!", hazard.x, hazard.y - hazard.radius - 10);
    }

    ctx.fillStyle = hazard.isChewed ? "#7f1d1d" : "#27272a";
    ctx.strokeStyle = isTargeted ? "#f87171" : "#52525b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isTargeted ? "#fca5a5" : "#e4e4e7";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    let icon = "📊";
    if (hazard.id === "power-cable" || hazard.id === "server-cable") icon = "⚡";
    if (hazard.id === "audit-file" || hazard.id === "clinical-db") icon = "📑";
    if (hazard.id === "laptop" || hazard.id === "garmin-watch") icon = "💻";
    if (hazard.id === "pitch-deck" || hazard.id === "resume") icon = "📊";
    ctx.fillText(icon, hazard.x, hazard.y + 5);

    ctx.fillStyle = isTargeted ? "#f87171" : "#a1a1aa";
    ctx.font = "9px monospace";
    ctx.fillText(hazard.name.split(" ")[0], hazard.x, hazard.y + hazard.radius + 12);

    ctx.restore();
  });

  // 9. Indoor Bladder Puddles
  if (state.indoorPuddles && state.indoorPuddles.length > 0) {
    state.indoorPuddles.forEach((puddle) => {
      ctx.save();
      // Outer puddle spill
      ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(puddle.x, puddle.y, puddle.radius * 1.25, puddle.radius * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner puddle ripple
      ctx.fillStyle = "rgba(14, 165, 233, 0.55)";
      ctx.beginPath();
      ctx.ellipse(puddle.x, puddle.y, puddle.radius * 0.7, puddle.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mop Progress Bar if scrubbing
      if (puddle.mopProgress > 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(puddle.x - 25, puddle.y - 28, 50, 6);
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(puddle.x - 25, puddle.y - 28, (50 * Math.min(100, puddle.mopProgress)) / 100, 6);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(puddle.x - 25, puddle.y - 28, 50, 6);
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 4;
      ctx.fillText("🧹 CLICK / SCRUB TO MOP", puddle.x, puddle.y + 4);
      ctx.restore();
    });
  }

  // 10. Thrown Ball in room
  if (state.ball && state.ball.active) {
    ctx.fillStyle = "#84cc16";
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 10. Procedural Duck Puppy Rendering
  drawDuckPuppy(ctx, state.duck, state.ticks, state.bellyRubProgress, state.activeAccessory, state.isMuddy);

  // 11. Floating Particles
  state.particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.shape === "heart") {
      ctx.font = `${p.size}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("❤️", p.x, p.y);
    } else if (p.shape === "star") {
      ctx.font = `${p.size}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("Z", p.x, p.y);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // 12. Floating Text Alerts
  state.floatingAlerts.forEach((a) => {
    ctx.save();
    ctx.globalAlpha = a.alpha;
    ctx.fillStyle = a.color;
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 6;
    ctx.fillText(a.text, a.x, a.y);
    ctx.restore();
  });
}

function drawDogParkScene(
  ctx: CanvasRenderingContext2D,
  state: WorkingWithDuckState,
  aimParkStart: { x: number; y: number } | null = null
) {
  const park = state.parkState;

  // 1. Lush Green Grass
  ctx.fillStyle = "#14532d";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Grass texture accents
  ctx.strokeStyle = "#166534";
  ctx.lineWidth = 2;
  for (let gx = 30; gx < CANVAS_WIDTH; gx += 50) {
    for (let gy = 40; gy < CANVAS_HEIGHT; gy += 60) {
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx - 4, gy - 8);
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 4, gy - 10);
      ctx.stroke();
    }
  }

  // 2. Mud Puddles
  park.puddles.forEach((puddle) => {
    ctx.fillStyle = "#78350f";
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(puddle.x, puddle.y, puddle.radius * 1.3, puddle.radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#92400e";
    ctx.beginPath();
    ctx.ellipse(puddle.x - 5, puddle.y - 4, puddle.radius * 0.7, puddle.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("MUD PUDDLE!", puddle.x, puddle.y + 4);
  });

  // 3. Agility Hurdles
  park.hurdles.forEach((hurdle) => {
    ctx.fillStyle = hurdle.cleared ? "#15803d" : "#ea580c";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fillRect(hurdle.x - hurdle.width / 2, hurdle.y - hurdle.height / 2, hurdle.width, hurdle.height);
    ctx.strokeRect(hurdle.x - hurdle.width / 2, hurdle.y - hurdle.height / 2, hurdle.width, hurdle.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(hurdle.cleared ? "CLEARED" : "JUMP (SPACE)", hurdle.x, hurdle.y - hurdle.height / 2 - 6);
  });

  // 4. Friendly Dog NPCs
  park.friends.forEach((friend) => {
    ctx.save();
    ctx.translate(friend.x, friend.y);
    ctx.fillStyle = friend.breed === "corgi" ? "#d97706" : "#facc15";
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#18181b";
    ctx.font = "12px sans-serif";
    ctx.fillText(friend.breed === "corgi" ? "🦊" : "🐕", 0, 4);

    ctx.fillStyle = friend.greeted ? "#4ade80" : "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.fillText(friend.greeted ? `❤️ ${friend.name}` : friend.name, 0, 22);
    ctx.restore();
  });

  // 5. Golden Bonus Bones
  park.bones.forEach((bone) => {
    if (!bone.collected) {
      ctx.save();
      ctx.fillStyle = "#facc15";
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bone.x, bone.y, 14 + Math.sin(state.ticks * 0.1) * 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🦴", bone.x, bone.y + 6);
      ctx.restore();
    }
  });

  // 6. Player at left side
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.arc(80, 250, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("YOU", 80, 254);

  // 7. Thrown Ball / Frisbee Trajectory
  if (park.status === "thrown" || park.status === "retrieving") {
    if (park.mode === "frisbee") {
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.ellipse(park.ballX, park.ballY, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = "#84cc16";
      ctx.beginPath();
      ctx.arc(park.ballX, park.ballY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Aim Line when aiming
  if (park.status === "aim" && aimParkStart) {
    ctx.strokeStyle = "#a3e635";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(90, 250);
    ctx.lineTo(aimParkStart.x, aimParkStart.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 8. Duck in Park with Jump Offset
  const jumpOffset = park.jumpHeight || 0;
  drawDuckPuppy(
    ctx,
    {
      x: park.duckX,
      y: park.duckY - jumpOffset,
      angle: park.duckAngle,
      state: park.status === "retrieving" ? "FETCHING_BALL" : "IDLE_ROAM",
      isCarryingBall: park.status === "retrieving",
    },
    state.ticks,
    0,
    state.activeAccessory,
    park.status === "muddy"
  );

  // Park Instructions Overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(CANVAS_WIDTH / 2 - 220, 15, 440, 52);
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(CANVAS_WIDTH / 2 - 220, 15, 440, 52);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  if (park.status === "aim") {
    ctx.fillText("🎾 Phase 1: Click & Drag on field to Launch!", CANVAS_WIDTH / 2, 34);
    ctx.fillText("Duck will sprint across to fetch & jump obstacles", CANVAS_WIDTH / 2, 50);
  } else if (park.status === "thrown" || park.status === "retrieving") {
    ctx.fillStyle = "#facc15";
    ctx.fillText(
      `🐾 Steer Duck (Mouse) · Jump Hurdles (Space) · Bones: ${park.bonesCollected}/3`,
      CANVAS_WIDTH / 2,
      34
    );
    ctx.fillText("Dodge mud puddles, jump hurdles & greet park friends!", CANVAS_WIDTH / 2, 50);
  } else if (park.status === "success") {
    ctx.fillStyle = "#4ade80";
    ctx.fillText(`🌟 Perfect Fetch! Duck retrieved ball & ${park.bonesCollected} bones!`, CANVAS_WIDTH / 2, 34);
    ctx.fillText("Click 'Return to Office' for 30s Tired Puppy Buff", CANVAS_WIDTH / 2, 50);
  } else if (park.status === "muddy") {
    ctx.fillStyle = "#f87171";
    ctx.fillText("💦 Duck splashed in mud! Needs a quick bath in the Washroom!", CANVAS_WIDTH / 2, 34);
    ctx.fillText("Click 'Return to Office' to wash in Bathtub", CANVAS_WIDTH / 2, 50);
  }
}

function drawBathtubScene(ctx: CanvasRenderingContext2D, state: WorkingWithDuckState) {
  const bath = state.bathtubState;

  // 1. Cozy Pastel Blue Bathroom Tiles
  ctx.fillStyle = "#0c4a6e";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Tiles Grid
  ctx.strokeStyle = "#0369a1";
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // 2. Porcelain Bathtub
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#bae6fd";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(200, 120, 400, 260, 40);
  ctx.fill();
  ctx.stroke();

  // Water inside Tub
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.roundRect(220, 140, 360, 220, 30);
  ctx.fill();

  // 3. Duck Sitting in Bathtub (Chin on ledge surrender pose)
  ctx.save();
  ctx.translate(400, 240);

  // Wet fluffy duck body
  ctx.fillStyle = bath.soapLather > 30 ? "#f0fdf4" : state.isMuddy ? "#a16207" : "#faf5ee";
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 45, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cute head resting on bathtub rim
  ctx.fillStyle = bath.soapLather > 30 ? "#ffffff" : state.isMuddy ? "#854d0e" : "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, -25, 25, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Droopy relaxed bath ears
  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.ellipse(-28, -20, 8, 16, -0.4, 0, Math.PI * 2);
  ctx.ellipse(28, -20, 8, 16, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Surrendered calm bath eyes
  ctx.strokeStyle = "#18181b";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(-8, -28, 4, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.arc(8, -28, 4, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Nose
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.arc(0, -20, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 4. Soap Foam & Bubbles
  bath.bubbles.forEach((b) => {
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.strokeStyle = "#e0f2fe";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // 5. Bathtub HUD & Progress Card
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(CANVAS_WIDTH / 2 - 200, 20, 400, 75);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.strokeRect(CANVAS_WIDTH / 2 - 200, 20, 400, 75);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "center";
  ctx.fillText("🛁 DUCK'S BATHTUB WASHROOM", CANVAS_WIDTH / 2, 42);

  // Lather & Rinse Progress Bar
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(CANVAS_WIDTH / 2 - 150, 52, 300, 10);

  const latherWidth = (300 * Math.min(100, bath.soapLather)) / 100;
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(CANVAS_WIDTH / 2 - 150, 52, latherWidth, 10);

  const rinseWidth = (300 * Math.min(100, bath.rinseLevel)) / 100;
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(CANVAS_WIDTH / 2 - 150, 52, rinseWidth, 10);

  ctx.fillStyle = "#e0f2fe";
  ctx.font = "bold 10px monospace";
  if (bath.soapLather < 100) {
    ctx.fillText(`🧼 Scrub Cursor to Lather Soap (${Math.round(bath.soapLather)}%)`, CANVAS_WIDTH / 2, 80);
  } else if (bath.rinseLevel < 100) {
    ctx.fillText(`🚿 Click 'Rinse Spray' Button Below (${Math.round(bath.rinseLevel)}%)`, CANVAS_WIDTH / 2, 80);
  } else {
    ctx.fillStyle = "#4ade80";
    ctx.fillText("✨ 100% Clean! Click 'Finish Bath & Return'", CANVAS_WIDTH / 2, 80);
  }
}

function drawCanvas(
  ctx: CanvasRenderingContext2D,
  state: WorkingWithDuckState,
  aimParkStart: { x: number; y: number } | null = null
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (state.inDogPark) {
    drawDogParkScene(ctx, state, aimParkStart);
    return;
  }

  if (state.inBathtub) {
    drawBathtubScene(ctx, state);
    return;
  }

  drawOfficeScene(ctx, state);
}

// --- Main React Component ---

export const WorkingWithDuck: React.FC = () => {
  const rawHighScore = useSyncExternalStore(subscribeStorage, getHighScoreSnapshot, getServerSnapshot);
  const loadedHighScore = parseInt(rawHighScore, 10) || 0;

  const { playNote, muted, setMuted } = useAudio();
  const { recordEvent } = useTelemetry();

  // Core Game State Ref for 60 FPS deterministic engine
  const gameStateRef = useRef<WorkingWithDuckState>(createInitialDuckGameState(1, "campaign"));
  // UI React State for rendering HUD, modals, and overlays
  const [uiState, setUiState] = useState<WorkingWithDuckState>(() => createInitialDuckGameState(1, "campaign"));
  const [isScrapbookOpen, setIsScrapbookOpen] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [activeScrapbookIndex, setActiveScrapbookIndex] = useState(0);
  const [scrapbookViewMode, setScrapbookViewMode] = useState<"photo" | "vector">("photo");
  const [isDraggingDuckState, setIsDraggingDuckState] = useState(false);
  const [isThrowingParkBall, setIsThrowingParkBall] = useState(false);
  const [aimParkStart, setAimParkStart] = useState<{ x: number; y: number } | null>(null);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastBellyScrubPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // Web Audio Procedural Synthesizer for Duck Sound Effects & Lo-Fi Beats
  const playSoundCue = useCallback(
    (cue: SoundCue) => {
      if (muted) return;
      try {
        if (cue === "tippy-tap") {
          playNote(700 + Math.random() * 200, 0.015);
        } else if (cue === "squeak") {
          playNote(1200, 0.05);
          setTimeout(() => playNote(1650, 0.04), 30);
        } else if (cue === "bark") {
          playNote(340, 0.06);
          setTimeout(() => playNote(220, 0.08), 25);
        } else if (cue === "belly-rub") {
          playNote(523.25 + Math.random() * 100, 0.08);
        } else if (cue === "whistle") {
          playNote(1760, 0.08);
          setTimeout(() => playNote(2093, 0.06), 40);
        } else if (cue === "snore") {
          playNote(160, 0.25);
        } else if (cue === "ding") {
          playNote(523.25, 0.08);
          setTimeout(() => playNote(659.25, 0.08), 60);
          setTimeout(() => playNote(783.99, 0.12), 120);
        } else if (cue === "fail") {
          playNote(220, 0.15);
          setTimeout(() => playNote(180, 0.2), 100);
        } else if (cue === "door-knock") {
          playNote(140, 0.06);
          setTimeout(() => playNote(130, 0.06), 90);
          setTimeout(() => playNote(140, 0.06), 180);
        } else if (cue === "squirrel-chirp") {
          playNote(2200, 0.04);
          setTimeout(() => playNote(2600, 0.04), 50);
        } else if (cue === "hiccup") {
          playNote(650, 0.03);
        } else if (cue === "combo-fanfare") {
          playNote(523.25, 0.06);
          setTimeout(() => playNote(659.25, 0.06), 50);
          setTimeout(() => playNote(783.99, 0.06), 100);
          setTimeout(() => playNote(1046.5, 0.12), 150);
        } else if (cue === "trick-chime") {
          playNote(880, 0.06);
          setTimeout(() => playNote(1174.66, 0.08), 50);
        } else if (cue === "paw-clap") {
          playNote(440, 0.04);
          setTimeout(() => playNote(880, 0.04), 25);
        } else if (cue === "spin-whoosh") {
          playNote(300, 0.06);
          setTimeout(() => playNote(600, 0.06), 40);
        } else if (cue === "bath-soap") {
          playNote(900 + Math.random() * 300, 0.03);
        } else if (cue === "bath-rinse") {
          playNote(400, 0.1);
          setTimeout(() => playNote(500, 0.1), 60);
        } else if (cue === "water-lap") {
          playNote(600, 0.03);
        } else if (cue === "crunch-kibble") {
          playNote(250, 0.03);
        } else if (cue === "code-type") {
          playNote(1200 + Math.random() * 200, 0.015);
        } else if (cue === "frisbee-throw") {
          playNote(700, 0.08);
          setTimeout(() => playNote(950, 0.08), 50);
        }
      } catch {}
    },
    [muted, playNote]
  );

  // Procedural Lo-Fi Background Music Loop
  useEffect(() => {
    if (muted || isMusicMuted || uiState.status !== "running") return;

    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0], // Am7
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];

    let chordIdx = 0;
    const interval = setInterval(() => {
      try {
        const chord = chords[chordIdx];
        chord.forEach((freq, i) => {
          setTimeout(() => {
            playNote(freq, 0.35);
          }, i * 40);
        });
        chordIdx = (chordIdx + 1) % chords.length;
      } catch {}
    }, 2400);

    return () => clearInterval(interval);
  }, [muted, isMusicMuted, uiState.status, playNote]);

  // Sync high scores safely to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage && typeof window.localStorage.setItem === "function") {
        if (uiState.highScore > loadedHighScore) {
          window.localStorage.setItem("working_with_duck_high_score", String(uiState.highScore));
        }
        if (uiState.unlockedFacts.length > 0) {
          window.localStorage.setItem("working_with_duck_unlocked_facts", JSON.stringify(uiState.unlockedFacts));
        }
      }
    } catch {}
  }, [uiState.highScore, uiState.unlockedFacts, loadedHighScore]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    let isRunning = true;
    let isContextLost = false;
    const canvas = canvasRef.current;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };

    const handleContextRestored = () => {
      isContextLost = false;
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    if (canvas) {
      canvas.addEventListener("contextlost", handleContextLost);
      canvas.addEventListener("contextrestored", handleContextRestored);
    }

    const render = () => {
      if (!isRunning || isContextLost) return;

      const state = gameStateRef.current;

      // Advance deterministic engine
      if (state.status === "running") {
        const nextState = stepDuckGame(state);
        gameStateRef.current = nextState;

        // Process sound cue queue
        if (nextState.soundCueQueue.length > 0) {
          nextState.soundCueQueue.forEach((cue) => playSoundCue(cue));
          gameStateRef.current.soundCueQueue = [];
        }

        // Throttle UI update every 4 frames (15 FPS UI state for DOM performance)
        if (nextState.ticks % 4 === 0) {
          setUiState({ ...nextState });
        }
      }

      // Draw canvas frame
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          drawCanvas(ctx, gameStateRef.current, aimParkStart);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (canvas) {
        canvas.removeEventListener("contextlost", handleContextLost);
        canvas.removeEventListener("contextrestored", handleContextRestored);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [playSoundCue, aimParkStart]);

  // Keyboard Shortcuts (1-4 for hotbar items, Q-W-E-R for tricks, Space for coding/jumping)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      const state = gameStateRef.current;
      if (e.key === "1") {
        gameStateRef.current = { ...state, selectedItem: "tennis-ball" };
        setUiState((s) => ({ ...s, selectedItem: "tennis-ball" }));
      } else if (e.key === "2") {
        gameStateRef.current = { ...state, selectedItem: "kong" };
        setUiState((s) => ({ ...s, selectedItem: "kong" }));
      } else if (e.key === "3") {
        gameStateRef.current = { ...state, selectedItem: "squeaky-toy" };
        setUiState((s) => ({ ...s, selectedItem: "squeaky-toy" }));
      } else if (e.key === "4") {
        gameStateRef.current = giveTreat(state);
        setUiState({ ...gameStateRef.current });
      } else if (e.key === "q" || e.key === "Q") {
        if (!state.inDogPark && !state.inBathtub) {
          gameStateRef.current = performTrick(state, "SIT");
          setUiState({ ...gameStateRef.current });
        }
      } else if (e.key === "w" || e.key === "W") {
        if (!state.inDogPark && !state.inBathtub) {
          gameStateRef.current = performTrick(state, "HIGH_FIVE");
          setUiState({ ...gameStateRef.current });
        } else if (state.inDogPark) {
          gameStateRef.current = steerParkDuck(state, state.parkState.duckY - 25);
          setUiState({ ...gameStateRef.current });
        }
      } else if (e.key === "e" || e.key === "E") {
        if (!state.inDogPark && !state.inBathtub) {
          gameStateRef.current = performTrick(state, "DROP_IT");
          setUiState({ ...gameStateRef.current });
        }
      } else if (e.key === "r" || e.key === "R") {
        if (!state.inDogPark && !state.inBathtub) {
          gameStateRef.current = performTrick(state, "SPIN");
          setUiState({ ...gameStateRef.current });
        }
      } else if (e.code === "Space") {
        e.preventDefault();
        if (state.inDogPark) {
          gameStateRef.current = jumpParkHurdle(state);
          setUiState({ ...gameStateRef.current });
        } else if (!state.inBathtub) {
          gameStateRef.current = activeCodeBurst(state);
          setUiState({ ...gameStateRef.current });
        }
      } else if (e.key === "ArrowUp" && state.inDogPark) {
        e.preventDefault();
        gameStateRef.current = steerParkDuck(state, state.parkState.duckY - 25);
        setUiState({ ...gameStateRef.current });
      } else if (e.key === "ArrowDown" && state.inDogPark) {
        e.preventDefault();
        gameStateRef.current = steerParkDuck(state, state.parkState.duckY + 25);
        setUiState({ ...gameStateRef.current });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Global Window Pointer Up Handler (Prevents Drag Locking Off-Canvas)
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      const state = gameStateRef.current;
      if (state.inDogPark && isThrowingParkBall && aimParkStart) {
        setIsThrowingParkBall(false);
        const powerX = (aimParkStart.x - 90) * 0.08;
        const powerY = (aimParkStart.y - 250) * 0.06;
        gameStateRef.current = throwParkBall(state, powerX, powerY);
        setAimParkStart(null);
        setUiState({ ...gameStateRef.current });
        return;
      }

      if (isDraggingDuckState) {
        setIsDraggingDuckState(false);
        gameStateRef.current = releaseDuck(state);
        setUiState({ ...gameStateRef.current });
      }
    };

    window.addEventListener("mouseup", handleGlobalPointerUp);
    window.addEventListener("touchend", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalPointerUp);
      window.removeEventListener("touchend", handleGlobalPointerUp);
    };
  }, [isThrowingParkBall, aimParkStart, isDraggingDuckState]);

  // Canvas Mouse Interactions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    const state = gameStateRef.current;

    // Bathtub Mode Mouse Scrubbing
    if (state.inBathtub) {
      gameStateRef.current = scrubBathtub(state, x, y);
      setUiState({ ...gameStateRef.current });
      return;
    }

    // Dog Park Aiming & Throwing
    if (state.inDogPark) {
      if (state.parkState.status === "aim") {
        setAimParkStart({ x, y });
        setIsThrowingParkBall(true);
      }
      return;
    }

    // Check click on surprise event target
    if (state.activeSurpriseEvent) {
      if (state.activeSurpriseEvent.type === "squirrel-window" && x >= 340 && x <= 465 && y <= 85) {
        gameStateRef.current = {
          ...state,
          activeSurpriseEvent: null,
          totalScore: state.totalScore + 200,
          comboStreak: state.comboStreak + 1,
          soundCueQueue: [...state.soundCueQueue, "combo-fanfare"],
          floatingAlerts: [
            ...state.floatingAlerts,
            {
              id: state.nextAlertId,
              x: 400,
              y: 80,
              text: "🐿️ Squirrel Watched! (+200 pts)",
              color: "#38bdf8",
              alpha: 1,
              vy: -1.2,
            },
          ],
        };
        setUiState({ ...gameStateRef.current });
        return;
      }

      if (
        state.activeSurpriseEvent.type === "amazon-delivery" &&
        x >= BACK_DOOR_BOUNDS.x - 70 &&
        x <= BACK_DOOR_BOUNDS.x + 30 &&
        y >= BACK_DOOR_BOUNDS.y + 10 &&
        y <= BACK_DOOR_BOUNDS.y + 70
      ) {
        gameStateRef.current = {
          ...state,
          activeSurpriseEvent: null,
          totalScore: state.totalScore + 150,
          comboStreak: state.comboStreak + 1,
          soundCueQueue: [...state.soundCueQueue, "combo-fanfare"],
          floatingAlerts: [
            ...state.floatingAlerts,
            {
              id: state.nextAlertId,
              x: BACK_DOOR_BOUNDS.x,
              y: BACK_DOOR_BOUNDS.y + 30,
              text: "📦 Package Retrieved! (+150 pts)",
              color: "#f59e0b",
              alpha: 1,
              vy: -1.2,
            },
          ],
        };
        setUiState({ ...gameStateRef.current });
        return;
      }
    }

    // Check if clicked directly on Desk for Active Code Burst
    if (
      x >= DESK_BOUNDS.x &&
      x <= DESK_BOUNDS.x + DESK_BOUNDS.width &&
      y >= DESK_BOUNDS.y &&
      y <= DESK_BOUNDS.y + DESK_BOUNDS.height
    ) {
      gameStateRef.current = activeCodeBurst(state);
      setUiState({ ...gameStateRef.current });
      return;
    }

    // Check if clicked directly on Stations
    if (
      x >= WATER_BOWL_BOUNDS.x &&
      x <= WATER_BOWL_BOUNDS.x + WATER_BOWL_BOUNDS.width &&
      y >= WATER_BOWL_BOUNDS.y &&
      y <= WATER_BOWL_BOUNDS.y + WATER_BOWL_BOUNDS.height
    ) {
      gameStateRef.current = interactStation(state, "water");
      setUiState({ ...gameStateRef.current });
      return;
    }

    if (
      x >= FOOD_BOWL_BOUNDS.x &&
      x <= FOOD_BOWL_BOUNDS.x + FOOD_BOWL_BOUNDS.width &&
      y >= FOOD_BOWL_BOUNDS.y &&
      y <= FOOD_BOWL_BOUNDS.y + FOOD_BOWL_BOUNDS.height
    ) {
      gameStateRef.current = interactStation(state, "food");
      setUiState({ ...gameStateRef.current });
      return;
    }

    if (
      x >= BATHTUB_BOUNDS.x &&
      x <= BATHTUB_BOUNDS.x + BATHTUB_BOUNDS.width &&
      y >= BATHTUB_BOUNDS.y &&
      y <= BATHTUB_BOUNDS.y + BATHTUB_BOUNDS.height
    ) {
      gameStateRef.current = enterBathtub(state);
      setUiState({ ...gameStateRef.current });
      return;
    }

    // Check if clicked directly on indoor puddle for mopping
    if (state.indoorPuddles && state.indoorPuddles.length > 0) {
      const clickedPuddle = state.indoorPuddles.some(
        (p) => Math.hypot(x - p.x, y - p.y) <= p.radius + 15
      );
      if (clickedPuddle) {
        gameStateRef.current = mopIndoorPuddle(state, x, y);
        setUiState({ ...gameStateRef.current });
        return;
      }
    }

    // Check if clicked directly on Duck
    const duckDist = Math.hypot(x - state.duck.x, y - state.duck.y);
    if (duckDist < 38) {
      if (state.duck.state === "NO_TAKE_THROW") {
        gameStateRef.current = giveTreat(state);
        setUiState({ ...gameStateRef.current });
        return;
      }
      gameStateRef.current = startDraggingDuck(state);
      setIsDraggingDuckState(true);
      return;
    }

    // Use Selected Hotbar Item on Canvas click
    if (state.selectedItem === "squeaky-toy") {
      gameStateRef.current = applySqueakyToy(state, x, y);
    } else if (state.selectedItem === "kong") {
      gameStateRef.current = applyKongToy(state, x, y);
    } else if (state.selectedItem === "tennis-ball") {
      gameStateRef.current = throwBall(state, x, y);
    } else if (state.selectedItem === "treat") {
      gameStateRef.current = giveTreat(state);
    }
    setUiState({ ...gameStateRef.current });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    const state = gameStateRef.current;

    // Bathtub Mode Scrubbing
    if (state.inBathtub) {
      gameStateRef.current = scrubBathtub(state, x, y);
      setUiState({ ...gameStateRef.current });
      return;
    }

    // Dog Park Mouse Steering during retrieval
    if (state.inDogPark) {
      if (isThrowingParkBall) {
        setAimParkStart({ x, y });
      } else if (state.parkState.status === "retrieving") {
        gameStateRef.current = steerParkDuck(state, y);
      }
      return;
    }

    // Dragging Duck
    if (isDraggingDuckState) {
      gameStateRef.current = dragDuckTo(state, x, y);
      return;
    }

    // Scrub / Mop Indoor Puddle on Hover & Scrub
    if (state.indoorPuddles && state.indoorPuddles.length > 0) {
      const hoveringPuddle = state.indoorPuddles.some(
        (p) => Math.hypot(x - p.x, y - p.y) <= p.radius + 15
      );
      if (hoveringPuddle) {
        gameStateRef.current = mopIndoorPuddle(state, x, y);
        setUiState({ ...gameStateRef.current });
      }
    }

    // Belly Rubbing during The Flop
    if (state.duck.state === "THE_FLOP") {
      const movedDist = Math.hypot(x - lastBellyScrubPosRef.current.x, y - lastBellyScrubPosRef.current.y);
      if (movedDist > 12) {
        lastBellyScrubPosRef.current = { x, y };
        gameStateRef.current = scrubBelly(state, x, y);
        setUiState({ ...gameStateRef.current });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    const state = gameStateRef.current;

    if (state.inDogPark && isThrowingParkBall && aimParkStart) {
      setIsThrowingParkBall(false);
      const powerX = (aimParkStart.x - 90) * 0.08;
      const powerY = (aimParkStart.y - 250) * 0.06;
      gameStateRef.current = throwParkBall(state, powerX, powerY);
      setAimParkStart(null);
      setUiState({ ...gameStateRef.current });
      return;
    }

    if (isDraggingDuckState) {
      setIsDraggingDuckState(false);
      gameStateRef.current = releaseDuck(state);
      setUiState({ ...gameStateRef.current });
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleCanvasMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as unknown as React.MouseEvent<HTMLCanvasElement>);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleCanvasMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as unknown as React.MouseEvent<HTMLCanvasElement>);
    }
  };

  const handleTouchEnd = () => {
    handleCanvasMouseUp();
  };

  const currentSprint = SPRINTS.find((s) => s.level === uiState.currentLevel) || SPRINTS[0];

  // Guided Onboarding Hint Text
  let tutorialHint: string | null = null;
  if (uiState.currentLevel === 1 && uiState.status === "running") {
    if (uiState.duck.state === "THE_FLOP") {
      tutorialHint = "💖 Duck flopped on his back! Move your cursor back & forth over his belly!";
    } else if (uiState.duck.state === "SNIFFING_POTTY" || uiState.bladder > 80) {
      tutorialHint = "🚽 Duck needs to go! Click and drag Duck over to the Back Door!";
    } else if (uiState.duck.state === "SNEAKY_CHEW") {
      tutorialHint = "⚠️ Duck is eyeing your work! Drop a Kong (2) or Call Drop It (E) to save it!";
    } else if (uiState.duck.state === "NO_TAKE_THROW") {
      tutorialHint = "🎾 Duck caught the ball! Press (4) to trade a treat or (E) for Drop It!";
    } else if (uiState.excitement > 80) {
      tutorialHint = "⚡ Excitement is high! Call Sit (Q) or take a Dog Park trip!";
    } else {
      tutorialHint = "💡 Tip: Work advances automatically. Press Space for active coding bursts & try training tricks (Q-W-E-R)!";
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-5xl mx-auto select-none font-sans ${
        isFullscreen
          ? "fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none rounded-none bg-black p-2 sm:p-4 overflow-y-auto overflow-x-hidden flex flex-col justify-between"
          : ""
      }`}
    >
      {/* Tablet Orientation Recommendation */}
      <TabletOrientationHint />

      {/* Top Status & Meters HUD */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Work Progress Meter */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5">
              <IconBriefcase className="w-4 h-4 text-cyan-400" />
              Work Progress
            </span>
            <span className="text-brand-cyan font-bold">
              {Math.min(100, Math.round((uiState.workProgress / uiState.targetWorkProgress) * 100))}%
            </span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-150"
              style={{
                width: `${Math.min(100, (uiState.workProgress / uiState.targetWorkProgress) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono text-zinc-500">
            <span>{uiState.mode === "endless" ? "Endless Mode" : currentSprint.title.split(":")[0]}</span>
            <span className="text-teal-400 font-bold">{uiState.multiplier.toFixed(1)}× Speed</span>
          </div>
        </div>

        {/* Excitement / Zoomies Meter */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5">
              <IconSparkles className="w-4 h-4 text-amber-400" />
              Excitement
            </span>
            <span
              className={`font-bold ${
                uiState.excitement > 80 ? "text-amber-400 animate-pulse" : "text-zinc-300"
              }`}
            >
              {Math.round(uiState.excitement)}%
            </span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-150 ${
                uiState.excitement > 80
                  ? "bg-gradient-to-r from-amber-500 to-rose-500"
                  : "bg-gradient-to-r from-sky-400 to-amber-400"
              }`}
              style={{ width: `${uiState.excitement}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono text-zinc-500">
            <span>{uiState.excitement > 85 ? "⚠️ ZOOMIES IMMINENT" : "Play fetch / call Sit"}</span>
            {uiState.calmBuffTimer > 0 && <span className="text-emerald-400">Tired Buff Active</span>}
          </div>
        </div>

        {/* Bladder / Potty Meter */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5">
              <IconAlertTriangle
                className={`w-4 h-4 ${uiState.bladder > 80 ? "text-rose-400 animate-bounce" : "text-sky-400"}`}
              />
              Bladder Clock
            </span>
            <span className={`font-bold ${uiState.bladder > 80 ? "text-rose-400" : "text-zinc-300"}`}>
              {Math.round(uiState.bladder)}%
            </span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-150 ${
                uiState.bladder > 85
                  ? "bg-rose-500 animate-pulse"
                  : "bg-gradient-to-r from-cyan-400 to-sky-500"
              }`}
              style={{ width: `${uiState.bladder}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono text-zinc-500">
            <span>{uiState.duck.state === "SNIFFING_POTTY" ? "🚨 DRAG TO DOOR!" : "Drag to Back Door"}</span>
          </div>
        </div>

        {/* Naughty vs Good Boy Scale */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5">
              <IconHeart className="w-4 h-4 text-rose-400" />
              Good Boy Scale
            </span>
            <span className="text-amber-300 font-bold">{Math.round(uiState.naughtyVsGood)}</span>
          </div>
          <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800 relative">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-200"
              style={{
                width: "100%",
                clipPath: `inset(0 ${Math.max(0, 100 - (uiState.naughtyVsGood + 100) / 2)}% 0 0)`,
              }}
            />
            {/* Center line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40" />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono">
            <span className="text-rose-400 font-semibold">Naughty</span>
            <span className="text-emerald-400 font-semibold">Good Boy (2.5×)</span>
          </div>
        </div>
      </div>

      {/* Guided Tutorial Hint Banner */}
      {tutorialHint && (
        <div className="mb-3 px-4 py-2 rounded-xl border border-brand-cyan/30 bg-brand-cyan/10 backdrop-blur-md flex items-center gap-2 text-xs font-mono text-brand-cyan animate-fadeIn">
          <IconInfoCircle className="w-4 h-4 shrink-0" />
          <span>{tutorialHint}</span>
        </div>
      )}

      {/* Main Canvas Screen Container */}
      <div className="relative rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
          variant="floating"
        />
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={
            isFullscreen
              ? "max-h-[calc(100vh-220px)] max-w-full aspect-[800/500] object-contain block cursor-crosshair touch-none my-auto mx-auto"
              : "w-full h-auto cursor-crosshair block touch-none"
          }
        />

        {/* Start Overlay Screen */}
        {uiState.status === "idle" && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mb-4">
              <IconBone className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white mb-2">
              Working With <span className="text-brand-cyan">Duck</span>
            </h2>
            <p className="text-xs font-mono text-amber-300 font-bold mb-2">
              {uiState.mode === "endless" ? "Endless Mode · High Score Challenge" : currentSprint.title}
            </p>
            <p className="max-w-md text-xs sm:text-sm text-zinc-300 font-mono mb-6 leading-relaxed">
              {uiState.mode === "endless"
                ? "Infinite sprints with accelerating puppy impulses. Keep Duck entertained and protect the codebase!"
                : currentSprint.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  gameStateRef.current = { ...gameStateRef.current, status: "running" };
                  setUiState((s) => ({ ...s, status: "running" }));
                  recordEvent("working-with-duck", "project_click").catch(() => {});
                }}
                className="px-6 py-3 rounded-xl bg-brand-cyan text-black font-mono font-bold text-sm hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer"
              >
                <IconPlayerPlay className="w-4 h-4 fill-current" />
                <span>{uiState.mode === "endless" ? "Start Endless Mode" : `Start Sprint ${uiState.currentLevel}`}</span>
              </button>

              <button
                onClick={() => setIsScrapbookOpen(true)}
                className="px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 font-mono text-xs hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <IconBook className="w-4 h-4" />
                <span>Duck Scrapbook</span>
              </button>

              <button
                onClick={() => setIsWardrobeOpen(true)}
                className="px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 font-mono text-xs hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <IconShirt className="w-4 h-4 text-amber-400" />
                <span>Wardrobe</span>
              </button>

              <FieldManualButton manualId="working-with-duck" label="Field Manual" />
            </div>
          </div>
        )}

        {/* Combo Streak Notification Overlay */}
        {uiState.comboStreak >= 2 && (
          <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-xl border border-amber-400/40 bg-zinc-900/90 text-amber-300 font-mono text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-pulse">
            <span>⚡ {uiState.comboStreak}× COMBO STREAK</span>
          </div>
        )}

        {/* Skill Toast Easter Egg */}
        {uiState.activeSkillToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl border border-emerald-500/40 bg-zinc-900/90 backdrop-blur-md text-white shadow-2xl flex items-center gap-2.5 animate-bounce">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase">
              {uiState.activeSkillToast.badge}
            </span>
            <span className="text-xs font-mono text-zinc-300">{uiState.activeSkillToast.text}</span>
          </div>
        )}
      </div>

      {/* Unified Tactile Action Dock */}
      <div className="mt-4 flex flex-col gap-3 font-mono">
        {/* Hotbar Row 1: Toys & Treats [1-4] + Tricks [Q-W-E-R] */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Toys & Treats */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                gameStateRef.current = { ...gameStateRef.current, selectedItem: "tennis-ball" };
                setUiState((s) => ({ ...s, selectedItem: "tennis-ball" }));
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                uiState.selectedItem === "tennis-ball"
                  ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-white"
              }`}
              title="Throw ball to play fetch & drain Excitement"
            >
              <span className="px-1 py-0.5 rounded bg-zinc-950 text-[9px] text-zinc-500">1</span>
              <IconBallTennis className="w-3.5 h-3.5 text-lime-400" />
              <span>Tennis Ball</span>
            </button>

            <button
              onClick={() => {
                gameStateRef.current = { ...gameStateRef.current, selectedItem: "kong" };
                setUiState((s) => ({ ...s, selectedItem: "kong" }));
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                uiState.selectedItem === "kong"
                  ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-white"
              }`}
              title="Drop chew toy to distract Duck away from desk hazards"
            >
              <span className="px-1 py-0.5 rounded bg-zinc-950 text-[9px] text-zinc-500">2</span>
              <span>Kong Chew</span>
            </button>

            <button
              onClick={() => {
                gameStateRef.current = { ...gameStateRef.current, selectedItem: "squeaky-toy" };
                setUiState((s) => ({ ...s, selectedItem: "squeaky-toy" }));
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                uiState.selectedItem === "squeaky-toy"
                  ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-white"
              }`}
              title="Squeak to instantly get Duck's attention and recall"
            >
              <span className="px-1 py-0.5 rounded bg-zinc-950 text-[9px] text-zinc-500">3</span>
              <IconBone className="w-3.5 h-3.5" />
              <span>Squeaky</span>
            </button>

            <button
              onClick={() => {
                gameStateRef.current = giveTreat(gameStateRef.current);
                setUiState({ ...gameStateRef.current });
              }}
              className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 text-amber-300 hover:border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Give treat (trades ball during No Take Only Throw)"
            >
              <span className="px-1 py-0.5 rounded bg-zinc-950 text-[9px] text-zinc-500">4</span>
              <span>Treat 🍖</span>
            </button>
          </div>

          {/* Training Tricks [Q-W-E-R] */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                gameStateRef.current = performTrick(gameStateRef.current, "SIT");
                setUiState({ ...gameStateRef.current });
              }}
              className="px-3 py-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Command Sit: Calms Excitement (-20) & boosts Good Boy scale"
            >
              <span className="px-1 py-0.5 rounded bg-zinc-950 text-[9px] text-sky-400">Q</span>
              <span>Sit 🪑</span>
            </button>

            <button
              onClick={() => {
                gameStateRef.current = performTrick(gameStateRef.current, "HIGH_FIVE");
                setUiState({ ...gameStateRef.current });
              }}
              className="px-3 py-1.5 rounded-xl border border-pink-500/40 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Command High Five: Morale boost (+45 pts) & tail wag"
            >
              <span className="px-1 py-0.5 rounded bg-zinc-950 text-[9px] text-pink-400">W</span>
              <span>Paw 🐾</span>
            </button>

            <button
              onClick={() => {
                gameStateRef.current = performTrick(gameStateRef.current, "DROP_IT");
                setUiState({ ...gameStateRef.current });
              }}
              className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Command Drop It: Immediately drops stolen hazards or ball (+60-75 pts)"
            >
              <span className="px-1 py-0.5 rounded bg-zinc-950 text-[9px] text-emerald-400">E</span>
              <span>Drop It ✋</span>
            </button>

            <button
              onClick={() => {
                gameStateRef.current = performTrick(gameStateRef.current, "SPIN");
                setUiState({ ...gameStateRef.current });
              }}
              className="px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Command Spin: Playful trick (+50 pts) with 360 rotation"
            >
              <span className="px-1 py-0.5 rounded bg-zinc-950 text-[9px] text-purple-400">R</span>
              <span>Spin 🌀</span>
            </button>
          </div>
        </div>

        {/* Hotbar Row 2: Active Desk Coding + Office Stations + Dog Park */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Active Action Button */}
          <div className="flex items-center gap-2">
            {!uiState.inDogPark && !uiState.inBathtub ? (
              <button
                onClick={() => {
                  gameStateRef.current = activeCodeBurst(gameStateRef.current);
                  setUiState({ ...gameStateRef.current });
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2 cursor-pointer"
                title="Focus work sprint at desk (Spacebar)"
              >
                <IconCode className="w-4 h-4" />
                <span>Focus Work Sprint (Space)</span>
              </button>
            ) : uiState.inBathtub ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    gameStateRef.current = rinseBathtub(gameStateRef.current);
                    setUiState({ ...gameStateRef.current });
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-500 text-black font-bold text-xs hover:bg-sky-400 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                >
                  <IconDroplet className="w-4 h-4" />
                  <span>Shower Rinse Spray 🚿</span>
                </button>

                <button
                  onClick={() => {
                    gameStateRef.current = exitBathtub(gameStateRef.current);
                    setUiState({ ...gameStateRef.current });
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span>Finish Bath &amp; Return →</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    gameStateRef.current = jumpParkHurdle(gameStateRef.current);
                    setUiState({ ...gameStateRef.current });
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(250,204,21,0.3)]"
                >
                  <span>🦘 Agility Jump (Space)</span>
                </button>

                <button
                  onClick={() => {
                    gameStateRef.current = tapParkWhistle(gameStateRef.current);
                    setUiState({ ...gameStateRef.current });
                  }}
                  className="px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Whistle 📢</span>
                </button>

                <button
                  onClick={() => {
                    const isSuccess = uiState.parkState.status === "success";
                    gameStateRef.current = exitDogPark(gameStateRef.current, isSuccess);
                    setUiState({ ...gameStateRef.current });
                  }}
                  className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span>Return to Office →</span>
                </button>
              </div>
            )}

            {!uiState.inDogPark && !uiState.inBathtub && (
              <>
                <button
                  onClick={() => {
                    gameStateRef.current = enterDogPark(gameStateRef.current);
                    setUiState({ ...gameStateRef.current });
                  }}
                  className="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <IconTrees className="w-4 h-4" />
                  <span>Dog Park 🌲</span>
                </button>

                <button
                  onClick={() => {
                    gameStateRef.current = enterBathtub(gameStateRef.current);
                    setUiState({ ...gameStateRef.current });
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    uiState.isMuddy
                      ? "border-sky-400 bg-sky-500/20 text-sky-300 animate-pulse"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  <IconDroplet className="w-4 h-4 text-sky-400" />
                  <span>Bathtub 🛁</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Meta Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWardrobeOpen(true)}
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-amber-400 hover:text-white transition-colors cursor-pointer"
              title="Duck Wardrobe & Accessories"
            >
              <IconShirt className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsScrapbookOpen(true)}
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Duck Scrapbook & Facts"
            >
              <IconBook className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMusicMuted(!isMusicMuted)}
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isMusicMuted ? "Unmute Lo-Fi Music" : "Mute Lo-Fi Music"}
            >
              {isMusicMuted ? <IconMusicOff className="w-4 h-4 text-zinc-500" /> : <IconMusic className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={muted ? "Unmute Audio" : "Mute Audio"}
            >
              {muted ? <IconVolumeOff className="w-4 h-4" /> : <IconVolume className="w-4 h-4 text-brand-cyan" />}
            </button>

            <FieldManualButton manualId="working-with-duck" label="Manual" />
            <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} variant="header" />
          </div>
        </div>
      </div>

      {/* Win / Nap Time Modal */}
      {uiState.status === "won" && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="max-w-lg w-full rounded-3xl border border-brand-cyan/40 bg-zinc-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center font-mono">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center mb-4">
              <IconSparkles className="w-8 h-8 animate-pulse" />
            </div>

            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              {uiState.mode === "endless" ? "Endless Milestone" : currentSprint.title} Completed!
            </span>

            <h3 className="text-2xl font-bold text-white mt-3 mb-2">
              Duck is Asleep &amp; Work is Done! 💤
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Total Score: <strong className="text-amber-300 font-bold">{uiState.totalScore}</strong> · High Score:{" "}
              <strong className="text-brand-cyan">{Math.max(uiState.highScore, loadedHighScore)}</strong>
            </p>

            {/* Unlocked Polaroid Card */}
            {uiState.latestUnlockedFact && (
              <div className="mb-6 rounded-2xl bg-white p-3 shadow-2xl text-black rotate-1 max-w-xs mx-auto">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-amber-50 mb-2 border border-zinc-200">
                  <Image
                    src={uiState.latestUnlockedFact.photoUrl}
                    alt={uiState.latestUnlockedFact.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-bold text-xs text-zinc-900">{uiState.latestUnlockedFact.title}</h4>
                <p className="text-[11px] text-zinc-600 font-sans mt-1 leading-snug">
                  {uiState.latestUnlockedFact.fact}
                </p>
              </div>
            )}

            {/* Recruiter CTA Suite */}
            <div className="mt-6 pt-6 border-t border-zinc-800/80">
              <p className="text-xs text-zinc-300 mb-4 font-sans leading-relaxed">
                Raising Duck takes multitasking, empathy, and quick problem solving — the exact skills Fred brings to
                engineering teams. Now that Duck is napping, let&apos;s talk!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <Link
                  href="/schedule"
                  className="px-4 py-2.5 rounded-xl bg-brand-cyan text-black font-bold text-xs hover:bg-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5"
                >
                  <IconCalendar className="w-4 h-4" />
                  <span>Schedule a Chat</span>
                </Link>

                <Link
                  href="/case-studies"
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs hover:border-zinc-600 transition-colors flex items-center gap-1.5"
                >
                  <IconBriefcase className="w-4 h-4" />
                  <span>Case Studies</span>
                </Link>

                <a
                  href="https://github.com/fderuiter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs hover:border-zinc-600 transition-colors flex items-center gap-1.5"
                >
                  <IconBrandGithub className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    gameStateRef.current = advanceToNextLevel(gameStateRef.current);
                    setUiState({ ...gameStateRef.current, status: "running" });
                  }}
                  className="text-xs text-zinc-400 hover:text-brand-cyan transition-colors underline cursor-pointer"
                >
                  {uiState.currentLevel < 5 ? "Proceed to Next Sprint →" : "Play Endless Mode →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fail / Time Out Modal */}
      {uiState.status === "failed" && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl border border-rose-500/40 bg-zinc-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-center font-mono">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center mb-4">
              <IconAlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Duck Got a Time-Out! 🐾</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-sans">
              Too many sneaky chews and missed potty breaks tilted the scale fully red.
              Take a breath and try again!
            </p>

            <button
              onClick={() => {
                gameStateRef.current = createInitialDuckGameState(uiState.currentLevel, uiState.mode);
                gameStateRef.current.status = "running";
                setUiState({ ...gameStateRef.current });
              }}
              className="w-full py-3 rounded-xl bg-rose-500 text-white font-mono font-bold text-xs hover:bg-rose-400 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <IconRotate className="w-4 h-4" />
              <span>Retry Sprint {uiState.currentLevel}</span>
            </button>
          </div>
        </div>
      )}

      {/* Accessory Wardrobe Modal */}
      {isWardrobeOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="max-w-md w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-6 font-mono relative">
            <button
              onClick={() => setIsWardrobeOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <IconX className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <IconShirt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Duck&apos;s Wardrobe</h3>
                <p className="text-xs text-zinc-400">Equip unlocked accessories</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: "none", name: "Natural Fluffy Coat", desc: "Pure English Cream marshmallow vibes", icon: "🐾" },
                { id: "bucket-hat", name: "Adidas Bucket Hat", desc: "Fact #5 · +10 Charisma & street style", icon: "🧢" },
                { id: "bowtie", name: "Tech CEO Bowtie", desc: "+0.2× Multiplier boost for executive standups", icon: "👔" },
                { id: "bandana", name: "Adventure Bandana", desc: "Crimson polka-dot outdoor explorer gear", icon: "🧣" },
                { id: "rain-boots", name: "Yellow Mud Boots", desc: "100% Mud puddle immunity at the Dog Park!", icon: "🥾" },
              ].map((acc) => {
                const isUnlocked = uiState.unlockedAccessories.includes(acc.id as DuckAccessory);
                const isSelected = uiState.activeAccessory === acc.id;

                return (
                  <button
                    key={acc.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      gameStateRef.current = equipAccessory(gameStateRef.current, acc.id as DuckAccessory);
                      setUiState({ ...gameStateRef.current });
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand-cyan bg-brand-cyan/15 text-white shadow-md"
                        : isUnlocked
                        ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                        : "border-zinc-800/50 bg-zinc-900/30 text-zinc-600 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{acc.icon}</span>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-2">
                          <span>{acc.name}</span>
                          {!isUnlocked && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-400">Locked</span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400">{acc.desc}</div>
                      </div>
                    </div>
                    {isSelected && <IconCheck className="w-4 h-4 text-brand-cyan shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Polaroid Scrapbook Modal */}
      {isScrapbookOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="max-w-xl w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 font-mono relative">
            <button
              onClick={() => setIsScrapbookOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <IconX className="w-4 h-4" />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <IconBook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Duck&apos;s Polaroid Scrapbook</h3>
                  <p className="text-xs text-zinc-400">Real puppy milestones &amp; vector art</p>
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1">
                <button
                  onClick={() => setScrapbookViewMode("photo")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    scrapbookViewMode === "photo"
                      ? "bg-brand-cyan text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <IconPhoto className="w-3.5 h-3.5" />
                  <span>Real Photos 📷</span>
                </button>

                <button
                  onClick={() => setScrapbookViewMode("vector")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    scrapbookViewMode === "vector"
                      ? "bg-brand-cyan text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <IconPalette className="w-3.5 h-3.5" />
                  <span>Vector Art 🎨</span>
                </button>
              </div>
            </div>

            {/* Scrapbook Carousel Card */}
            {(() => {
              const currentFact = DUCK_FACTS[activeScrapbookIndex];
              const isUnlocked = uiState.unlockedFacts.includes(currentFact.level);
              const activeImageSource = scrapbookViewMode === "photo" ? currentFact.photoUrl : currentFact.svgUrl;

              return (
                <div className="rounded-2xl bg-white p-4 text-black shadow-2xl">
                  <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 mb-3 border border-zinc-200">
                    {isUnlocked ? (
                      <Image
                        src={activeImageSource}
                        alt={currentFact.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
                        <IconBone className="w-8 h-8 mb-2 opacity-40" />
                        <span className="text-xs font-mono font-bold">Locked Milestone</span>
                        <span className="text-[10px] font-sans mt-1">
                          Complete Sprint {currentFact.level} to unlock this milestone!
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-zinc-900">
                      {isUnlocked ? currentFact.title : `Sprint ${currentFact.level} Secret`}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-zinc-500">
                      Card {activeScrapbookIndex + 1} of {DUCK_FACTS.length}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-700 font-sans leading-relaxed">
                    {isUnlocked ? currentFact.fact : "Play through the campaign levels to reveal real photos, artwork, and stories about Duck."}
                  </p>

                  {isUnlocked && (
                    <p className="text-[11px] text-zinc-500 italic font-sans mt-2">
                      &ldquo;{currentFact.caption}&rdquo;
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Carousel Navigation */}
            <div className="mt-4 flex items-center justify-between">
              <button
                disabled={activeScrapbookIndex === 0}
                onClick={() => setActiveScrapbookIndex((i) => Math.max(0, i - 1))}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Previous
              </button>

              <div className="flex gap-1.5">
                {DUCK_FACTS.map((f, idx) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveScrapbookIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      activeScrapbookIndex === idx
                        ? "bg-brand-cyan scale-125"
                        : "bg-zinc-800 hover:bg-zinc-600"
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={activeScrapbookIndex === DUCK_FACTS.length - 1}
                onClick={() => setActiveScrapbookIndex((i) => Math.min(DUCK_FACTS.length - 1, i + 1))}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
