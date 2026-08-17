/**
 * Synthesized Web Audio Sound Effects for Memes, Easter Eggs, and Soundboard
 */

let globalAudioCtx: AudioContext | null = null;

function getMemeAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
  }
  return globalAudioCtx;
}

export function isSoundAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.localStorage?.getItem === "function") {
    if (window.localStorage.getItem("sound_muted") === "true") return false;
    if (window.localStorage.getItem("sound_a11y_bypass") === "true") return false;
  }
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia?.("(forced-colors: active)").matches) return false;
  return true;
}

export function playMemeSound(
  type: "bark" | "laser" | "friday-alarm" | "matrix-glitch" | "teapot-whistle" | "modem" | "fda-siren" | "level-up" | "fanfare"
): void {
  if (!isSoundAllowed()) return;
  const ctx = getMemeAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  switch (type) {
    case "bark": {
      // Synthesize a playful two-tone puppy woof
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
      break;
    }

    case "laser": {
      // Frequency sweep downward for laser raycast
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
      break;
    }

    case "friday-alarm": {
      // High-low alternating siren pulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      osc.frequency.setValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
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
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        gain.gain.setValueAtTime(0.15, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.03 + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.05);
      });
      break;
    }

    case "teapot-whistle": {
      // Ascending whistle tone for RFC 418
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.25);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.31);
      break;
    }

    case "modem": {
      // Simulated 56k negotiation dual-tone burst
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sawtooth";
      osc2.type = "square";
      osc1.frequency.setValueAtTime(1209, now);
      osc2.frequency.setValueAtTime(697, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.29);
      osc2.stop(now + 0.29);
      break;
    }

    case "fda-siren": {
      // Harsh buzzer tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.3, now);
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
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
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
