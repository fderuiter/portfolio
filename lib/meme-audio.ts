/**
 * Synthesized Web Audio Sound Effects for Memes, Easter Eggs, and Soundboard
 */

import { useEffect } from "react";
import { getSoundEngine } from "@/lib/audio/sound-engine";

export function stopAllMemeSounds(): void {
  getSoundEngine().stopAll();
}

export function useMemeAudioCleanup(): void {
  useEffect(() => {
    return () => {
      stopAllMemeSounds();
    };
  }, []);
}

export function isSoundAllowed(): boolean {
  return getSoundEngine().isSoundAllowed();
}

export type MemeSoundType =
  | "bark"
  | "laser"
  | "friday-alarm"
  | "matrix-glitch"
  | "teapot-whistle"
  | "modem"
  | "fda-siren"
  | "level-up"
  | "fanfare";

export function getMemeSoundDuration(type: MemeSoundType): number {
  switch (type) {
    case "modem":
      return 1250;
    case "teapot-whistle":
      return 850;
    case "bark":
      return 450;
    case "friday-alarm":
      return 400;
    case "level-up":
    case "fanfare":
      return 380;
    case "fda-siren":
      return 280;
    case "laser":
    case "matrix-glitch":
    default:
      return 220;
  }
}

function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer | null {
  try {
    if (typeof ctx.createBuffer !== "function") return null;
    const sampleRate = ctx.sampleRate || 44100;
    const bufferSize = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    if (typeof buffer.getChannelData === "function") {
      const data = buffer.getChannelData(0);
      if (data) {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }
    }
    return buffer;
  } catch {
    return null;
  }
}

export function playMemeSound(
  type: "bark" | "laser" | "friday-alarm" | "matrix-glitch" | "teapot-whistle" | "modem" | "fda-siren" | "level-up" | "fanfare"
): void {
  const engine = getSoundEngine();
  if (!engine.isSoundAllowed()) return;
  const ctx = engine.getAudioContext();
  if (!ctx) return;

  const masterVol = engine.getVolume();
  if (masterVol <= 0) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  switch (type) {
    case "bark": {
      // Synthesize a playful two-stage puppy bark ("yip-woof!")
      // Stage 1: Quick high-frequency "yip"
      const osc1 = engine.trackSource(ctx.createOscillator());
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(450, now);
      osc1.frequency.exponentialRampToValueAtTime(620, now + 0.04);
      osc1.frequency.exponentialRampToValueAtTime(360, now + 0.11);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.28 * masterVol, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      let node1: AudioNode = gain1;
      if (typeof ctx.createBiquadFilter === "function") {
        const filter1 = ctx.createBiquadFilter();
        filter1.type = "bandpass";
        filter1.frequency.setValueAtTime(1200, now);
        filter1.Q.setValueAtTime(2.2, now);
        gain1.connect(filter1);
        node1 = filter1;
      }
      node1.connect(ctx.destination);
      osc1.connect(gain1);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Breath puff for Stage 1
      const noiseBuf1 = createNoiseBuffer(ctx, 0.1);
      if (noiseBuf1 && typeof ctx.createBufferSource === "function" && typeof ctx.createBiquadFilter === "function") {
        const noiseSource1 = engine.trackSource(ctx.createBufferSource());
        const noiseGain1 = ctx.createGain();
        const noiseFilter1 = ctx.createBiquadFilter();

        noiseSource1.buffer = noiseBuf1;
        noiseFilter1.type = "bandpass";
        noiseFilter1.frequency.setValueAtTime(1600, now);
        noiseFilter1.Q.setValueAtTime(1.5, now);

        noiseGain1.gain.setValueAtTime(0.08 * masterVol, now);
        noiseGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        noiseSource1.connect(noiseFilter1);
        noiseFilter1.connect(noiseGain1);
        noiseGain1.connect(ctx.destination);

        noiseSource1.start(now);
        noiseSource1.stop(now + 0.1);
      }

      // Stage 2: Richer "woof" body
      const t2 = now + 0.15;
      const osc2 = engine.trackSource(ctx.createOscillator());
      const osc2Harmonic = engine.trackSource(ctx.createOscillator());
      const gain2 = ctx.createGain();
      const harmonicGain2 = ctx.createGain();

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(340, t2);
      osc2.frequency.exponentialRampToValueAtTime(490, t2 + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(210, t2 + 0.22);

      osc2Harmonic.type = "sine";
      osc2Harmonic.frequency.setValueAtTime(680, t2);
      osc2Harmonic.frequency.exponentialRampToValueAtTime(980, t2 + 0.06);
      osc2Harmonic.frequency.exponentialRampToValueAtTime(420, t2 + 0.22);

      gain2.gain.setValueAtTime(0.001, t2);
      gain2.gain.linearRampToValueAtTime(0.32 * masterVol, t2 + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.24);

      harmonicGain2.gain.setValueAtTime(0.001, t2);
      harmonicGain2.gain.linearRampToValueAtTime(0.12 * masterVol, t2 + 0.03);
      harmonicGain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.22);

      let node2: AudioNode = gain2;
      if (typeof ctx.createBiquadFilter === "function") {
        const filter2 = ctx.createBiquadFilter();
        filter2.type = "bandpass";
        filter2.frequency.setValueAtTime(950, t2);
        filter2.Q.setValueAtTime(1.8, t2);
        gain2.connect(filter2);
        harmonicGain2.connect(filter2);
        node2 = filter2;
      } else {
        harmonicGain2.connect(ctx.destination);
      }

      node2.connect(ctx.destination);
      osc2.connect(gain2);
      osc2Harmonic.connect(harmonicGain2);

      osc2.start(t2);
      osc2Harmonic.start(t2);
      osc2.stop(t2 + 0.25);
      osc2Harmonic.stop(t2 + 0.25);

      // Breath puff for Stage 2
      const noiseBuf2 = createNoiseBuffer(ctx, 0.18);
      if (noiseBuf2 && typeof ctx.createBufferSource === "function" && typeof ctx.createBiquadFilter === "function") {
        const noiseSource2 = engine.trackSource(ctx.createBufferSource());
        const noiseGain2 = ctx.createGain();
        const noiseFilter2 = ctx.createBiquadFilter();

        noiseSource2.buffer = noiseBuf2;
        noiseFilter2.type = "bandpass";
        noiseFilter2.frequency.setValueAtTime(1100, t2);
        noiseFilter2.Q.setValueAtTime(1.2, t2);

        noiseGain2.gain.setValueAtTime(0.07 * masterVol, t2);
        noiseGain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.18);

        noiseSource2.connect(noiseFilter2);
        noiseFilter2.connect(noiseGain2);
        noiseGain2.connect(ctx.destination);

        noiseSource2.start(t2);
        noiseSource2.stop(t2 + 0.19);
      }
      break;
    }

    case "laser": {
      // Frequency sweep downward for laser raycast
      const osc = engine.trackSource(ctx.createOscillator());
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
      gain.gain.setValueAtTime(0.25 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
      break;
    }

    case "friday-alarm": {
      // High-low alternating siren pulse
      const osc = engine.trackSource(ctx.createOscillator());
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      osc.frequency.setValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.2 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
      break;
    }

    case "matrix-glitch": {
      // Rapid stepped cyber tones
      [300, 600, 450, 900, 1200].forEach((freq, idx) => {
        const osc = engine.trackSource(ctx.createOscillator());
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        gain.gain.setValueAtTime(0.15 * masterVol, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.03 + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.05);
      });
      break;
    }

    case "teapot-whistle": {
      // Authentic boiling kettle whistle with steam vortex flutter & pressure release
      const whistleOsc = engine.trackSource(ctx.createOscillator());
      const whistleHarmonic = engine.trackSource(ctx.createOscillator());
      const whistleGain = ctx.createGain();
      const harmonicGain = ctx.createGain();

      whistleOsc.type = "sine";
      whistleOsc.frequency.setValueAtTime(1750, now);
      whistleOsc.frequency.linearRampToValueAtTime(2150, now + 0.45);
      whistleOsc.frequency.linearRampToValueAtTime(2280, now + 0.65);
      whistleOsc.frequency.exponentialRampToValueAtTime(1900, now + 0.82);

      whistleHarmonic.type = "sine";
      whistleHarmonic.frequency.setValueAtTime(3500, now);
      whistleHarmonic.frequency.linearRampToValueAtTime(4300, now + 0.45);
      whistleHarmonic.frequency.exponentialRampToValueAtTime(3800, now + 0.82);

      // Tremolo / air flutter LFO
      const lfo = engine.trackSource(ctx.createOscillator());
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(6.5, now);
      lfoGain.gain.setValueAtTime(28, now);
      lfo.connect(whistleOsc.frequency);

      whistleGain.gain.setValueAtTime(0.001, now);
      whistleGain.gain.linearRampToValueAtTime(0.18 * masterVol, now + 0.25);
      whistleGain.gain.linearRampToValueAtTime(0.24 * masterVol, now + 0.55);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);

      harmonicGain.gain.setValueAtTime(0.001, now);
      harmonicGain.gain.linearRampToValueAtTime(0.04 * masterVol, now + 0.35);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);

      whistleOsc.connect(whistleGain);
      whistleHarmonic.connect(harmonicGain);
      whistleGain.connect(ctx.destination);
      harmonicGain.connect(ctx.destination);

      lfo.start(now);
      whistleOsc.start(now);
      whistleHarmonic.start(now);
      lfo.stop(now + 0.84);
      whistleOsc.stop(now + 0.84);
      whistleHarmonic.stop(now + 0.84);

      // Steam hiss layer
      const steamBuf = createNoiseBuffer(ctx, 0.85);
      if (steamBuf && typeof ctx.createBufferSource === "function" && typeof ctx.createBiquadFilter === "function") {
        const steamSource = engine.trackSource(ctx.createBufferSource());
        const steamGain = ctx.createGain();
        const steamFilter = ctx.createBiquadFilter();

        steamSource.buffer = steamBuf;
        steamFilter.type = "bandpass";
        steamFilter.frequency.setValueAtTime(2400, now);
        steamFilter.frequency.linearRampToValueAtTime(3200, now + 0.55);
        steamFilter.Q.setValueAtTime(1.8, now);

        steamGain.gain.setValueAtTime(0.01 * masterVol, now);
        steamGain.gain.linearRampToValueAtTime(0.09 * masterVol, now + 0.35);
        steamGain.gain.linearRampToValueAtTime(0.08 * masterVol, now + 0.65);
        steamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.83);

        steamSource.connect(steamFilter);
        steamFilter.connect(steamGain);
        steamGain.connect(ctx.destination);

        steamSource.start(now);
        steamSource.stop(now + 0.85);
      }
      break;
    }

    case "modem": {
      // Authentic condensed 56k dialup handshake (~1.2s sequence)
      // Stage 1: 2100Hz V.8 / V.25 Answer Tone
      const oscAnswer = engine.trackSource(ctx.createOscillator());
      const gainAnswer = ctx.createGain();
      oscAnswer.type = "sine";
      oscAnswer.frequency.setValueAtTime(2100, now);

      gainAnswer.gain.setValueAtTime(0.001, now);
      gainAnswer.gain.linearRampToValueAtTime(0.18 * masterVol, now + 0.02);
      gainAnswer.gain.setValueAtTime(0.18 * masterVol, now + 0.19);
      gainAnswer.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      oscAnswer.connect(gainAnswer);
      gainAnswer.connect(ctx.destination);
      oscAnswer.start(now);
      oscAnswer.stop(now + 0.23);

      // Stage 2: Dual-frequency carrier negotiation chirps
      const tNegotiation = now + 0.24;
      const oscNeg1 = engine.trackSource(ctx.createOscillator());
      const oscNeg2 = engine.trackSource(ctx.createOscillator());
      const gainNeg = ctx.createGain();

      oscNeg1.type = "sawtooth";
      oscNeg2.type = "square";

      oscNeg1.frequency.setValueAtTime(980, tNegotiation);
      oscNeg1.frequency.setValueAtTime(1650, tNegotiation + 0.08);
      oscNeg1.frequency.setValueAtTime(1300, tNegotiation + 0.16);
      oscNeg1.frequency.setValueAtTime(2100, tNegotiation + 0.24);

      oscNeg2.frequency.setValueAtTime(1180, tNegotiation);
      oscNeg2.frequency.setValueAtTime(840, tNegotiation + 0.08);
      oscNeg2.frequency.setValueAtTime(1950, tNegotiation + 0.16);
      oscNeg2.frequency.setValueAtTime(1200, tNegotiation + 0.24);

      gainNeg.gain.setValueAtTime(0.001, tNegotiation);
      gainNeg.gain.linearRampToValueAtTime(0.14 * masterVol, tNegotiation + 0.02);
      gainNeg.gain.setValueAtTime(0.14 * masterVol, tNegotiation + 0.28);
      gainNeg.gain.exponentialRampToValueAtTime(0.001, tNegotiation + 0.32);

      oscNeg1.connect(gainNeg);
      oscNeg2.connect(gainNeg);
      gainNeg.connect(ctx.destination);

      oscNeg1.start(tNegotiation);
      oscNeg2.start(tNegotiation);
      oscNeg1.stop(tNegotiation + 0.33);
      oscNeg2.stop(tNegotiation + 0.33);

      // Stage 3: Screeching V.90/V.34 carrier training noise burst
      const tScreech = now + 0.56;
      const noiseBuf = createNoiseBuffer(ctx, 0.7);
      if (noiseBuf && typeof ctx.createBufferSource === "function" && typeof ctx.createBiquadFilter === "function") {
        const noiseSource = engine.trackSource(ctx.createBufferSource());
        const noiseGain = ctx.createGain();
        const noiseFilter = ctx.createBiquadFilter();

        noiseSource.buffer = noiseBuf;
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(2200, tScreech);
        noiseFilter.frequency.linearRampToValueAtTime(2800, tScreech + 0.25);
        noiseFilter.frequency.linearRampToValueAtTime(1900, tScreech + 0.55);
        noiseFilter.Q.setValueAtTime(1.4, tScreech);

        noiseGain.gain.setValueAtTime(0.001, tScreech);
        noiseGain.gain.linearRampToValueAtTime(0.2 * masterVol, tScreech + 0.03);
        noiseGain.gain.setValueAtTime(0.2 * masterVol, tScreech + 0.52);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, tScreech + 0.68);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseSource.start(tScreech);
        noiseSource.stop(tScreech + 0.69);
      }

      // Add AM sideband grit for baud rate scrambling texture
      const baudCarrier = engine.trackSource(ctx.createOscillator());
      const baudModulator = engine.trackSource(ctx.createOscillator());
      const baudGain = ctx.createGain();
      const modGain = ctx.createGain();

      baudCarrier.type = "sawtooth";
      baudCarrier.frequency.setValueAtTime(1800, tScreech);
      baudCarrier.frequency.linearRampToValueAtTime(2400, tScreech + 0.3);
      baudCarrier.frequency.linearRampToValueAtTime(1600, tScreech + 0.6);

      baudModulator.type = "square";
      baudModulator.frequency.setValueAtTime(160, tScreech);
      baudModulator.frequency.linearRampToValueAtTime(280, tScreech + 0.4);

      modGain.gain.setValueAtTime(0.08 * masterVol, tScreech);
      baudGain.gain.setValueAtTime(0.001, tScreech);
      baudGain.gain.linearRampToValueAtTime(0.12 * masterVol, tScreech + 0.03);
      baudGain.gain.setValueAtTime(0.12 * masterVol, tScreech + 0.52);
      baudGain.gain.exponentialRampToValueAtTime(0.001, tScreech + 0.68);

      baudModulator.connect(modGain);
      modGain.connect(baudGain.gain);
      baudCarrier.connect(baudGain);
      baudGain.connect(ctx.destination);

      baudModulator.start(tScreech);
      baudCarrier.start(tScreech);
      baudModulator.stop(tScreech + 0.69);
      baudCarrier.stop(tScreech + 0.69);
      break;
    }

    case "fda-siren": {
      // Harsh buzzer tone
      const osc = engine.trackSource(ctx.createOscillator());
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.3 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
      break;
    }

    case "level-up":
    case "fanfare": {
      // Arpeggiated C-Major triumphant chord (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = engine.trackSource(ctx.createOscillator());
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.18 * masterVol, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.13);
      });
      break;
    }
  }
}
