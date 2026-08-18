"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { safeStorage } from "@/lib/safe-storage";

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

export function useAudio() {
  const context = useContext(AudioProviderContext);
  return context || defaultAudioContext;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [volume, setVolumeState] = useState(0.3);
  const [muted, setMutedState] = useState(true);
  const [profile, setProfileState] = useState<AudioProfile>("8-bit");
  const [bypassActive, setBypassActive] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load settings on client side once mounted asynchronously to prevent react-hooks/set-state-in-effect error
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedVolume = safeStorage.getItem<string | number>("sound_volume");
    const savedMuted = safeStorage.getItem<string | boolean>("sound_muted");
    const savedProfile = safeStorage.getItem<string>("sound_profile");

    setTimeout(() => {
      if (savedVolume !== null && savedVolume !== undefined) {
        setVolumeState(typeof savedVolume === "number" ? savedVolume : parseFloat(String(savedVolume)));
      }
      if (savedMuted !== null && savedMuted !== undefined) {
        setMutedState(savedMuted === true || savedMuted === "true");
      }
      if (savedProfile !== null && savedProfile !== undefined) {
        setProfileState(String(savedProfile) as AudioProfile);
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkBypass = () => {
      const forcedColors = window.matchMedia?.("(forced-colors: active)").matches;
      const msHighContrast = window.matchMedia?.("(-ms-high-contrast: active)").matches;
      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const documentClasses = document.documentElement.className || "";
      const documentHtmlContrast = document.documentElement.getAttribute("data-contrast") || "";

      const shouldBypass = !!(
        forcedColors ||
        msHighContrast ||
        prefersReducedMotion ||
        documentClasses.includes("high-contrast") ||
        documentClasses.includes("contrast") ||
        documentHtmlContrast === "high" ||
        localStorage.getItem("sound_a11y_bypass") === "true"
      );
      setBypassActive(shouldBypass);
    };

    checkBypass();

    const mqForced = window.matchMedia?.("(forced-colors: active)");
    const mqMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    mqForced?.addEventListener?.("change", checkBypass);
    mqMotion?.addEventListener?.("change", checkBypass);

    return () => {
      mqForced?.removeEventListener?.("change", checkBypass);
      mqMotion?.removeEventListener?.("change", checkBypass);
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

  const playNote = (frequency: number, duration: number, pan?: number) => {
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
  };

  const playKeystroke = (charCode: number) => {
    if (muted || bypassActive) return;
    const pentatonicScale = [
      130.81, 146.83, 164.81, 196.00, 220.00,
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00
    ];
    const idx = charCode % pentatonicScale.length;
    playNote(pentatonicScale[idx], 0.05);
  };

  const playAutocomplete = () => {
    if (muted || bypassActive) return;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playNote(freq, 0.08);
      }, idx * 60);
    });
  };

  const playSuccess = () => {
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
  };

  const playSubmit = () => {
    if (muted || bypassActive) return;
    playNote(523.25, 0.06);
    setTimeout(() => {
      playNote(659.25, 0.08);
    }, 50);
  };

  const playError = () => {
    if (muted || bypassActive) return;
    playNote(311.13, 0.08);
    setTimeout(() => {
      playNote(233.08, 0.12);
    }, 60);
  };

  const playHover = (pan?: number) => {
    if (muted || bypassActive) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches) return;
    const freq = profile === "ambient" ? 440.00 : 880.00;
    playNote(freq, 0.02, pan);
  };

  const playSkillHover = () => {
    if (muted || bypassActive) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches) return;
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00];
    const randomFreq = notes[Math.floor(Math.random() * notes.length)];
    playNote(randomFreq, 0.1);
  };

  const handleSetVolume = (v: number) => {
    const val = Math.max(0, Math.min(1, v));
    setVolumeState(val);
    if (typeof window !== "undefined") {
      safeStorage.setItem("sound_volume", val, { expirable: false });
    }
  };

  const handleSetMuted = (m: boolean) => {
    setMutedState(m);
    if (typeof window !== "undefined") {
      safeStorage.setItem("sound_muted", m, { expirable: false });
    }
    if (!m) {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    }
  };

  const handleSetProfile = (p: AudioProfile) => {
    setProfileState(p);
    if (typeof window !== "undefined") {
      safeStorage.setItem("sound_profile", p, { expirable: false });
    }
    
    // Play sound confirmation for swapped profile
    setTimeout(() => {
      let confirmFreq = 523.25; // C5
      if (p === "ambient") {
        confirmFreq = 329.63; // E4
      } else if (p === "90s-retro") {
        confirmFreq = 440.00; // A4
      }
      playNote(confirmFreq, 0.15);
    }, 10);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [volume, muted, profile, bypassActive]);

  return (
    <AudioProviderContext.Provider value={value}>
      {children}
    </AudioProviderContext.Provider>
  );
}
