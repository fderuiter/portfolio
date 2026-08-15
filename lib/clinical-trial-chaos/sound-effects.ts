/**
 * Audio helpers for retro chiptune SFX and procedural synth BGM in Clinical Trial Chaos.
 * Uses Web Audio oscillator synthesis with graceful degradation and zero external assets.
 */
import { clamp } from "../game-utils";

let globalAudioCtx: AudioContext | null = null;
let bgmTimer: NodeJS.Timeout | number | null = null;
let bgmStep = 0;
let bgmTempoMs = 280; // milliseconds per beat
let isBgmPlaying = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!globalAudioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

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

/** Sound: Incorrect multi-choice option chosen (low blunt double-tap) */
export function playChoiceIncorrectSound() {
  playSyntheticTone(220, 0.1, "sawtooth", 0.18);
  setTimeout(() => playSyntheticTone(180, 0.15, "sawtooth", 0.2), 90);
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

/** Sound: Power-Up Activated (triumphant 4-note retro fan-fare) */
export function playPowerUpSound() {
  const notes = [440, 554.37, 659.25, 880];
  notes.forEach((freq, idx) => {
    setTimeout(() => playSyntheticTone(freq, 0.12, "sine", 0.22), idx * 60);
  });
}

/** Sound: Pneumatic chute delivery whoosh */
export function playPneumaticChuteSound() {
  playSyntheticTone(300, 0.18, "triangle", 0.15);
  setTimeout(() => playSyntheticTone(600, 0.12, "sine", 0.12), 60);
}

// 8-Bit Chiptune Melody Arpeggio Scale for Procedural BGM
const BGM_MELODY = [
  261.63, 329.63, 392.0, 523.25, // C4, E4, G4, C5
  293.66, 349.23, 440.0, 587.33, // D4, F4, A4, D5
  329.63, 392.0, 493.88, 659.25, // E4, G4, B4, E5
  261.63, 392.0, 523.25, 659.25, // C4, G4, C5, E5
];

const BGM_BASS = [130.81, 146.83, 164.81, 130.81]; // C3, D3, E3, C3

/**
 * Starts the procedural retro 8-bit chiptune background synth loop.
 */
export function startProceduralBGM(initialTempoMs = 280) {
  if (isBgmPlaying) return;
  isBgmPlaying = true;
  bgmTempoMs = initialTempoMs;
  bgmStep = 0;

  const tickBgm = () => {
    if (!isBgmPlaying) return;

    // Play melody note
    const noteFreq = BGM_MELODY[bgmStep % BGM_MELODY.length];
    playSyntheticTone(noteFreq, 0.08, "triangle", 0.05);

    // Play bass note every 4 steps
    if (bgmStep % 4 === 0) {
      const bassFreq = BGM_BASS[Math.floor(bgmStep / 4) % BGM_BASS.length];
      playSyntheticTone(bassFreq, 0.18, "square", 0.04);
    }

    bgmStep++;
    bgmTimer = setTimeout(tickBgm, bgmTempoMs);
  };

  tickBgm();
}

/**
 * Updates procedural BGM tempo based on auditor suspicion & excitement.
 */
export function updateBGMTempo(suspicion: number) {
  // Scales from 280ms (relaxed) down to 160ms (intense frenzy)
  const clampedSusp = clamp(suspicion, 0, 100);
  bgmTempoMs = Math.round(280 - (clampedSusp / 100) * 120);
}

/**
 * Stops procedural background music.
 */
export function stopProceduralBGM() {
  isBgmPlaying = false;
  if (bgmTimer) {
    clearTimeout(bgmTimer as NodeJS.Timeout);
    bgmTimer = null;
  }
}
