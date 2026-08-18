"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback, useSyncExternalStore } from "react";

export type AudioProfile = "8-bit" | "90s-retro" | "ambient";

interface AudioContextType {
  volume: number;
  muted: boolean;
  profile: AudioProfile;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  setProfile: (p: AudioProfile) => void;
  playNote: (frequency: number, duration: number, pan?: number) => void;
  playKeystroke: (charCode: number) => void;
  playAutocomplete: () => void;
  playSuccess: () => void;
  playSubmit: () => void;
  playError: () => void;
  playHover: (pan?: number) => void;
  playSkillHover: () => void;
  bypassActive: boolean;
}

const defaultAudioContext: AudioContextType = {
  volume: 0.3,
  muted: true,
  profile: "8-bit",
  setVolume: () => {},
  setMuted: () => {},
  setProfile: () => {},
  playNote: () => {},
  playKeystroke: () => {},
  playAutocomplete: () => {},
  playSuccess: () => {},
  playSubmit: () => {},
  playError: () => {},
  playHover: () => {},
  playSkillHover: () => {},
  bypassActive: false,
};

const AudioProviderContext = createContext<AudioContextType | null>(null);

const AUDIO_LISTENERS = new Set<() => void>();

function notifyAudioStoreChange() {
  AUDIO_LISTENERS.forEach((cb) => cb());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key && (e.key.startsWith("sound_") || e.key === "sound_a11y_bypass")) {
      notifyAudioStoreChange();
    }
  });
  window.addEventListener("portfolio-audio-change", notifyAudioStoreChange);
}

function subscribeAudioStore(callback: () => void) {
  AUDIO_LISTENERS.add(callback);
  return () => {
    AUDIO_LISTENERS.delete(callback);
  };
}

function getVolumeSnapshot(): number {
  if (typeof window === "undefined") return 0.3;
  try {
    if (typeof window.localStorage?.getItem === "function") {
      const saved = window.localStorage.getItem("sound_volume");
      if (saved !== null) {
        const val = parseFloat(saved);
        if (!isNaN(val)) return Math.max(0, Math.min(1, val));
      }
    }
  } catch {}
  return 0.3;
}

function getMutedSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (typeof window.localStorage?.getItem === "function") {
      const saved = window.localStorage.getItem("sound_muted");
      if (saved !== null) {
        return saved === "true";
      }
    }
  } catch {}
  return true;
}

function getProfileSnapshot(): AudioProfile {
  if (typeof window === "undefined") return "8-bit";
  try {
    if (typeof window.localStorage?.getItem === "function") {
      const saved = window.localStorage.getItem("sound_profile");
      if (saved === "8-bit" || saved === "90s-retro" || saved === "ambient") {
        return saved;
      }
    }
  } catch {}
  return "8-bit";
}

function getBypassSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const forcedColors = window.matchMedia?.("(forced-colors: active)").matches;
    const msHighContrast = window.matchMedia?.("(-ms-high-contrast: active)").matches;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const documentClasses = document.documentElement.className || "";
    const documentHtmlContrast = document.documentElement.getAttribute("data-contrast") || "";
    const savedBypass =
      typeof window.localStorage?.getItem === "function"
        ? window.localStorage.getItem("sound_a11y_bypass") === "true"
        : false;

    return !!(
      forcedColors ||
      msHighContrast ||
      prefersReducedMotion ||
      documentClasses.includes("high-contrast") ||
      documentClasses.includes("contrast") ||
      documentHtmlContrast === "high" ||
      savedBypass
    );
  } catch {
    return false;
  }
}

function getServerVolumeSnapshot(): number {
  return 0.3;
}
function getServerMutedSnapshot(): boolean {
  return true;
}
function getServerProfileSnapshot(): AudioProfile {
  return "8-bit";
}
function getServerBypassSnapshot(): boolean {
  return false;
}

export function useAudio() {
  const context = useContext(AudioProviderContext);
  return context || defaultAudioContext;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const volume = useSyncExternalStore(subscribeAudioStore, getVolumeSnapshot, getServerVolumeSnapshot);
  const muted = useSyncExternalStore(subscribeAudioStore, getMutedSnapshot, getServerMutedSnapshot);
  const profile = useSyncExternalStore(subscribeAudioStore, getProfileSnapshot, getServerProfileSnapshot);
  const bypassActive = useSyncExternalStore(subscribeAudioStore, getBypassSnapshot, getServerBypassSnapshot);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqForced = window.matchMedia?.("(forced-colors: active)");
    const mqMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    const handleChange = () => notifyAudioStoreChange();

    mqForced?.addEventListener?.("change", handleChange);
    mqMotion?.addEventListener?.("change", handleChange);

    return () => {
      mqForced?.removeEventListener?.("change", handleChange);
      mqMotion?.removeEventListener?.("change", handleChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  const getAudioContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    return audioCtxRef.current;
  };

  const playNote = useCallback((frequency: number, duration: number, pan?: number) => {
    if (muted || bypassActive) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    let type: OscillatorType = "sine";
    let attack = 0.1;
    let decay = 0.1;
    let sustain = 0.5;
    let release = 0.1;
    let profileVolume = 0.5;

    if (profile === "8-bit") {
      type = "square";
      attack = 0.005;
      decay = 0.08;
      sustain = 0.1;
      release = 0.1;
      profileVolume = 0.25;
    } else if (profile === "90s-retro") {
      type = "sawtooth";
      attack = 0.02;
      decay = 0.15;
      sustain = 0.25;
      release = 0.2;
      profileVolume = 0.2;
    } else if (profile === "ambient") {
      type = "sine";
      attack = 0.2;
      decay = 0.3;
      sustain = 0.5;
      release = 0.5;
      profileVolume = 0.55;
    }

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    const now = ctx.currentTime;
    const targetGain = volume * profileVolume;

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(targetGain, now + attack);
    env.gain.linearRampToValueAtTime(targetGain * sustain, now + attack + decay);

    const sustainEndTime = now + attack + decay + duration;
    env.gain.setValueAtTime(targetGain * sustain, sustainEndTime);
    env.gain.linearRampToValueAtTime(0, sustainEndTime + release);

    let lastNode: AudioNode = env;

    if (typeof pan === "number" && ctx.createStereoPanner) {
      try {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
        lastNode.connect(panner);
        lastNode = panner;
      } catch { {} }
    }

    lastNode.connect(ctx.destination);
    osc.connect(env);

    osc.start(now);
    const totalDuration = attack + decay + duration + release;
    osc.stop(now + totalDuration + 0.1);

    setTimeout(() => {
      try {
        osc.disconnect();
        env.disconnect();
      } catch { {} }
    }, (totalDuration + 0.5) * 1000);
  }, [muted, bypassActive, profile, volume]);

  const playKeystroke = useCallback((charCode: number) => {
    if (muted || bypassActive) return;
    const pentatonicScale = [
      130.81, 146.83, 164.81, 196.00, 220.00,
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00
    ];
    const idx = charCode % pentatonicScale.length;
    playNote(pentatonicScale[idx], 0.05);
  }, [muted, bypassActive, playNote]);

  const playAutocomplete = useCallback(() => {
    if (muted || bypassActive) return;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playNote(freq, 0.08);
      }, idx * 60);
    });
  }, [muted, bypassActive, playNote]);

  const playSuccess = useCallback(() => {
    if (muted || bypassActive) return;
    if (profile === "ambient") {
      const notes = [261.63, 329.63, 392.00, 493.88];
      notes.forEach((freq) => {
        playNote(freq, 0.4);
      });
    } else {
      const notes = [329.63, 392.00, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playNote(freq, 0.12);
        }, idx * 80);
      });
    }
  }, [muted, bypassActive, profile, playNote]);

  const playSubmit = useCallback(() => {
    if (muted || bypassActive) return;
    playNote(523.25, 0.06);
    setTimeout(() => {
      playNote(659.25, 0.08);
    }, 50);
  }, [muted, bypassActive, playNote]);

  const playError = useCallback(() => {
    if (muted || bypassActive) return;
    playNote(311.13, 0.08);
    setTimeout(() => {
      playNote(233.08, 0.12);
    }, 60);
  }, [muted, bypassActive, playNote]);

  const playHover = useCallback((pan?: number) => {
    if (muted || bypassActive) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches) return;
    const freq = profile === "ambient" ? 440.00 : 880.00;
    playNote(freq, 0.02, pan);
  }, [muted, bypassActive, profile, playNote]);

  const playSkillHover = useCallback(() => {
    if (muted || bypassActive) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches) return;
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00];
    const randomFreq = notes[Math.floor(Math.random() * notes.length)];
    playNote(randomFreq, 0.1);
  }, [muted, bypassActive, playNote]);

  const handleSetVolume = useCallback((v: number) => {
    const val = Math.max(0, Math.min(1, v));
    try {
      if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
        window.localStorage.setItem("sound_volume", String(val));
        window.dispatchEvent(new CustomEvent("portfolio-audio-change"));
      }
    } catch {}
    notifyAudioStoreChange();
  }, []);

  const handleSetMuted = useCallback((m: boolean) => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
        window.localStorage.setItem("sound_muted", String(m));
        window.dispatchEvent(new CustomEvent("portfolio-audio-change"));
      }
    } catch {}
    notifyAudioStoreChange();
    if (!m) {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    }
  }, []);

  const handleSetProfile = useCallback((p: AudioProfile) => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage?.setItem === "function") {
        window.localStorage.setItem("sound_profile", p);
        window.dispatchEvent(new CustomEvent("portfolio-audio-change"));
      }
    } catch {}
    notifyAudioStoreChange();

    setTimeout(() => {
      let confirmFreq = 523.25; // C5
      if (p === "ambient") {
        confirmFreq = 329.63; // E4
      } else if (p === "90s-retro") {
        confirmFreq = 440.00; // A4
      }
      playNote(confirmFreq, 0.15);
    }, 10);
  }, [playNote]);

  const value = React.useMemo(() => ({
    volume,
    muted,
    profile,
    setVolume: handleSetVolume,
    setMuted: handleSetMuted,
    setProfile: handleSetProfile,
    playNote,
    playKeystroke,
    playAutocomplete,
    playSuccess,
    playSubmit,
    playError,
    playHover,
    playSkillHover,
    bypassActive
  }), [volume, muted, profile, bypassActive, handleSetVolume, handleSetMuted, handleSetProfile, playNote, playKeystroke, playAutocomplete, playSuccess, playSubmit, playError, playHover, playSkillHover]);

  return (
    <AudioProviderContext.Provider value={value}>
      {children}
    </AudioProviderContext.Provider>
  );
}
