/**
 * Audio helpers for retro chiptune SFX in Clinical Trial Chaos.
 * Uses Web Audio oscillator synthesis with graceful degradation.
 */

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!globalAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        globalAudioCtx = new AudioCtxClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a short custom synthetic beep/tone.
 */
export function playSyntheticTone(
  frequency: number,
  durationSeconds: number,
  type: OscillatorType = "square",
  gainLevel = 0.15
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSeconds);
  } catch {
    // Ignore audio errors in restricted browser contexts
  }
}

/** Sound: Stamp / Validation Success (quick ascending 2-tone) */
export function playValidationSound() {
  playSyntheticTone(523.25, 0.08, "triangle", 0.18); // C5
  setTimeout(() => {
    playSyntheticTone(659.25, 0.1, "triangle", 0.18); // E5
  }, 70);
}

/** Sound: 21 CFR Electronic Signature Verified (bright chime) */
export function playSignatureVerifiedSound() {
  playSyntheticTone(659.25, 0.1, "sine", 0.2); // E5
  setTimeout(() => playSyntheticTone(880.0, 0.12, "sine", 0.2), 80); // A5
  setTimeout(() => playSyntheticTone(1046.5, 0.25, "triangle", 0.25), 180); // C6
}

/** Sound: Error / Query Rejection (buzzing low tone) */
export function playAuditErrorBuzz() {
  playSyntheticTone(164.81, 0.22, "sawtooth", 0.2); // E3
}

/** Sound: Protocol Amendment Siren Alert */
export function playAmendmentSirenSound() {
  playSyntheticTone(880, 0.15, "square", 0.2);
  setTimeout(() => playSyntheticTone(440, 0.18, "square", 0.22), 140);
  setTimeout(() => playSyntheticTone(880, 0.15, "square", 0.2), 300);
}

/** Sound: FDA Form 483 Issued Alarm (alarm horn) */
export function playForm483AlarmSound() {
  playSyntheticTone(220, 0.35, "sawtooth", 0.3);
  setTimeout(() => playSyntheticTone(185, 0.5, "sawtooth", 0.3), 320);
}
