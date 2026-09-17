/**
 * Procedural Web Audio API 8-Bit Chiptune Sound Synthesizer
 * Safe for SSR, Node, and headless test environments.
 */

import { useEffect } from "react";
import { getSoundEngine, SoundEngine } from "@/lib/audio/sound-engine";

export class RetroAudioEngine {
  private isMuted: boolean = false;
  private engine: SoundEngine;

  constructor(engine: SoundEngine = getSoundEngine()) {
    this.engine = engine;
  }

  private isSoundAllowed(): boolean {
    return !this.isMuted && this.engine.isSoundAllowed();
  }

  public stopAll(): void {
    this.engine.stopAll();
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
    this.engine.playTone({
      frequency: freq,
      duration: durationMs / 1000,
      type,
      volume,
    });
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
    this.engine.playTone({
      frequency: 400,
      endFrequency: 1200,
      duration: 0.15,
      type: "sawtooth",
      volume: 0.06,
    });
  }

  /**
   * High-impact Exploit blast sound.
   */
  public playExploitBlast(): void {
    if (!this.isSoundAllowed()) return;
    this.engine.playTone({
      frequency: 280,
      endFrequency: 60,
      duration: 0.25,
      type: "sawtooth",
      volume: 0.1,
    });
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

export function useRetroAudioCleanup(): void {
  useEffect(() => {
    return () => {
      retroAudio.stopAll();
    };
  }, []);
}
