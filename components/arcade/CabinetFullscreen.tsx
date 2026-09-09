"use client";

import { createContext, useContext } from "react";
import { useFullscreen } from "@/hooks/useFullscreen";

// A cabinet owns the fullscreen boundary, including the game's external controls.
export const CabinetFullscreenContext = createContext<
  (() => Promise<void>) | null
>(null);

export function useGameFullscreen(...args: Parameters<typeof useFullscreen>) {
  const toggleCabinet = useContext(CabinetFullscreenContext);
  const standalone = useFullscreen(args[0], {
    ...args[1],
    enableKeyShortcut: !toggleCabinet && args[1]?.enableKeyShortcut !== false,
  });
  return toggleCabinet
    ? { ...standalone, isFullscreen: false, toggleFullscreen: toggleCabinet }
    : standalone;
}
