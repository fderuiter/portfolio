/**
 * Procedural Web Audio API 8-Bit Chiptune Sound Synthesizer
 * Safe for SSR, Node, and headless test environments.
 */

/**
 * Procedural Web Audio API 8-Bit Chiptune Sound Synthesizer
 * Safe for SSR, Node, and headless test environments.
 */

import { useEffect } from "react";
import {
  getGovernedAudioContext,
  getGovernedVolume,
  isGovernedSoundAllowed,
  registerAudioCleanup,
} from "@/components/providers/AudioProvider";

export class RetroAudioEngine {
  private isMuted: boolean = false;
  private activeSources = new Set<AudioScheduledSourceNode>();

  private getContext(): AudioContext | null {
    return getGovernedAudioContext();
  }

  private isSoundAllowed(): boolean {
    return !this.isMuted && isGovernedSoundAllowed();
  }

  private trackSource<T extends AudioScheduledSourceNode>(source: T): T {
    this.activeSources.add(source);
    try {
      source.addEventListener("ended", () => {
        this.activeSources.delete(source);
      });
    } catch {}
    return source;
  }

  public stopAll(): void {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    });
    this.activeSources.clear();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopAll();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a customizable synthesized frequency pulse.
   */
  public playTone(
    freq: number,
    durationMs: number = 80,
    type: OscillatorType = "square",
    volume: number = 0.08
  ): void {
    if (!this.isSoundAllowed()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const masterVolume = getGovernedVolume();
      const effectiveVolume = Math.max(0.0001, volume * masterVolume);

      const osc = this.trackSource(ctx.createOscillator());
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Ignore audio scheduling exceptions
    }
  }

  /**
   * Subnet step movement blip.
   */
  public playStep(): void {
    this.playTone(220, 40, "triangle", 0.04);
  }

  /**
   * Port Scan frequency ramp.
   */
  public playPortScan(): void {
    if (!this.isSoundAllowed()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const masterVolume = getGovernedVolume();
      const osc = this.trackSource(ctx.createOscillator());
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.06 * masterVolume, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  /**
   * High-impact Exploit blast sound.
   */
  public playExploitBlast(): void {
    if (!this.isSoundAllowed()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const masterVolume = getGovernedVolume();
      const osc = this.trackSource(ctx.createOscillator());
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.1 * masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  /**
   * Critical CVE hit arpeggio.
   */
  public playCriticalHit(): void {
    this.playTone(523.25, 60, "square", 0.08); // C5
    setTimeout(() => this.playTone(659.25, 60, "square", 0.08), 50); // E5
    setTimeout(() => this.playTone(783.99, 120, "square", 0.09), 100); // G5
  }

  /**
   * Hex terminal bypass success fanfare.
   */
  public playHackSuccess(): void {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 90, "sine", 0.08);
      }, idx * 70);
    });
  }

  /**
   * Security Alert / IDS alarm pulse.
   */
  public playAlertPulse(): void {
    this.playTone(880, 100, "square", 0.06);
    setTimeout(() => this.playTone(440, 100, "square", 0.06), 110);
  }

  /**
   * Item / Crypto pickup chime.
   */
  public playPickup(): void {
    this.playTone(587.33, 50, "sine", 0.07);
    setTimeout(() => this.playTone(880, 80, "sine", 0.07), 40);
  }
}

export const retroAudio = new RetroAudioEngine();

registerAudioCleanup(() => {
  retroAudio.stopAll();
});

export function useRetroAudioCleanup(): void {
  useEffect(() => {
    return () => {
      retroAudio.stopAll();
    };
  }, []);
}
