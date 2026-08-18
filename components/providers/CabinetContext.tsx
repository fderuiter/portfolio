"use client";

import React, { createContext, useContext, useCallback, useState, useSyncExternalStore } from "react";

export type CabinetDifficulty = "casual" | "standard" | "hardcore";

export interface CabinetAudioConfig {
  muted: boolean;
  volume: number; // 0.0 to 1.0
  sfxEnabled: boolean;
}

export interface CabinetSettings {
  difficulty: CabinetDifficulty;
  audio: CabinetAudioConfig;
}

export interface CabinetContextType extends CabinetSettings {
  setDifficulty: (difficulty: CabinetDifficulty) => void;
  setAudio: (audio: Partial<CabinetAudioConfig>) => void;
  resetSettings: () => void;
  isWizardOpen: boolean;
  openWizard: () => void;
  closeWizard: () => void;
  toggleWizard: () => void;
}

const STORAGE_KEYS = {
  DIFFICULTY: "cabinet_difficulty",
  MUTED: "cabinet_audio_muted",
  VOLUME: "cabinet_audio_volume",
  SFX: "cabinet_sfx_enabled",
} as const;

export const DEFAULT_CABINET_SETTINGS: CabinetSettings = {
  difficulty: "standard",
  audio: {
    muted: false,
    volume: 0.8,
    sfxEnabled: true,
  },
};

function getSafeStorageValue(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    if (typeof window.localStorage?.getItem === "function") {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Fail silently
  }
  return null;
}

function setSafeStorageValue(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.localStorage?.setItem === "function") {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Fail silently
  }
}

function removeSafeStorageValue(key: string): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.localStorage?.removeItem === "function") {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Fail silently
  }
}

let cachedSettings: CabinetSettings = { ...DEFAULT_CABINET_SETTINGS };
let rawDiffCache: string | null = undefined as unknown as null;
let rawMutedCache: string | null = undefined as unknown as null;
let rawVolumeCache: string | null = undefined as unknown as null;
let rawSfxCache: string | null = undefined as unknown as null;

export function readCabinetSettingsFromStorage(): CabinetSettings {
  if (typeof window === "undefined") return DEFAULT_CABINET_SETTINGS;

  const diffRaw = getSafeStorageValue(STORAGE_KEYS.DIFFICULTY);
  const mutedRaw = getSafeStorageValue(STORAGE_KEYS.MUTED);
  const volumeRaw = getSafeStorageValue(STORAGE_KEYS.VOLUME);
  const sfxRaw = getSafeStorageValue(STORAGE_KEYS.SFX);

  if (
    diffRaw === rawDiffCache &&
    mutedRaw === rawMutedCache &&
    volumeRaw === rawVolumeCache &&
    sfxRaw === rawSfxCache
  ) {
    return cachedSettings;
  }

  rawDiffCache = diffRaw;
  rawMutedCache = mutedRaw;
  rawVolumeCache = volumeRaw;
  rawSfxCache = sfxRaw;

  const difficulty: CabinetDifficulty =
    diffRaw === "casual" || diffRaw === "standard" || diffRaw === "hardcore"
      ? diffRaw
      : DEFAULT_CABINET_SETTINGS.difficulty;

  const muted = mutedRaw !== null ? mutedRaw === "true" : DEFAULT_CABINET_SETTINGS.audio.muted;
  const volume =
    volumeRaw !== null && !isNaN(parseFloat(volumeRaw))
      ? Math.max(0, Math.min(1, parseFloat(volumeRaw)))
      : DEFAULT_CABINET_SETTINGS.audio.volume;
  const sfxEnabled = sfxRaw !== null ? sfxRaw === "true" : DEFAULT_CABINET_SETTINGS.audio.sfxEnabled;

  cachedSettings = {
    difficulty,
    audio: {
      muted,
      volume,
      sfxEnabled,
    },
  };

  return cachedSettings;
}

const listeners = new Set<() => void>();

function subscribeCabinetStore(callback: () => void) {
  listeners.add(callback);

  const handleStorage = (e: StorageEvent) => {
    if (
      !e.key ||
      e.key === STORAGE_KEYS.DIFFICULTY ||
      e.key === STORAGE_KEYS.MUTED ||
      e.key === STORAGE_KEYS.VOLUME ||
      e.key === STORAGE_KEYS.SFX
    ) {
      // Invalidate cache so readCabinetSettingsFromStorage recalculates
      rawDiffCache = undefined as unknown as null;
      callback();
    }
  };

  const handleCustomChange = () => {
    rawDiffCache = undefined as unknown as null;
    callback();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
    window.addEventListener("cabinet-settings-changed", handleCustomChange);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cabinet-settings-changed", handleCustomChange);
    }
  };
}

function notifyCabinetStore() {
  rawDiffCache = undefined as unknown as null;
  readCabinetSettingsFromStorage();
  listeners.forEach((cb) => cb());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cabinet-settings-changed"));
  }
}

function getCabinetSnapshot(): CabinetSettings {
  return readCabinetSettingsFromStorage();
}

function getCabinetServerSnapshot(): CabinetSettings {
  return DEFAULT_CABINET_SETTINGS;
}

const CabinetContext = createContext<CabinetContextType | null>(null);

export function CabinetProvider({ children }: { children: React.ReactNode }) {
  const settings = useSyncExternalStore(
    subscribeCabinetStore,
    getCabinetSnapshot,
    getCabinetServerSnapshot
  );

  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const setDifficulty = useCallback((difficulty: CabinetDifficulty) => {
    setSafeStorageValue(STORAGE_KEYS.DIFFICULTY, difficulty);
    notifyCabinetStore();
  }, []);

  const setAudio = useCallback((audioUpdates: Partial<CabinetAudioConfig>) => {
    const current = readCabinetSettingsFromStorage().audio;
    const updated = { ...current, ...audioUpdates };

    if (audioUpdates.muted !== undefined) {
      setSafeStorageValue(STORAGE_KEYS.MUTED, String(updated.muted));
    }
    if (audioUpdates.volume !== undefined) {
      setSafeStorageValue(STORAGE_KEYS.VOLUME, String(updated.volume));
    }
    if (audioUpdates.sfxEnabled !== undefined) {
      setSafeStorageValue(STORAGE_KEYS.SFX, String(updated.sfxEnabled));
    }
    notifyCabinetStore();
  }, []);

  const resetSettings = useCallback(() => {
    removeSafeStorageValue(STORAGE_KEYS.DIFFICULTY);
    removeSafeStorageValue(STORAGE_KEYS.MUTED);
    removeSafeStorageValue(STORAGE_KEYS.VOLUME);
    removeSafeStorageValue(STORAGE_KEYS.SFX);
    notifyCabinetStore();
  }, []);

  const openWizard = useCallback(() => setIsWizardOpen(true), []);
  const closeWizard = useCallback(() => setIsWizardOpen(false), []);
  const toggleWizard = useCallback(() => setIsWizardOpen((prev) => !prev), []);

  const value: CabinetContextType = {
    ...settings,
    setDifficulty,
    setAudio,
    resetSettings,
    isWizardOpen,
    openWizard,
    closeWizard,
    toggleWizard,
  };

  return <CabinetContext.Provider value={value}>{children}</CabinetContext.Provider>;
}

export function useCabinet(): CabinetContextType {
  const context = useContext(CabinetContext);
  if (!context) {
    return {
      ...DEFAULT_CABINET_SETTINGS,
      setDifficulty: () => {},
      setAudio: () => {},
      resetSettings: () => {},
      isWizardOpen: false,
      openWizard: () => {},
      closeWizard: () => {},
      toggleWizard: () => {},
    };
  }
  return context;
}
