import { getSoundEngine } from "@/lib/audio/sound-engine";

export type GameSoundName = "action" | "warning" | "success" | "failure";

/** Frequencies shared by game UIs; playback remains owned by SoundEngine. */
export const gameSoundFrequencies: Record<GameSoundName, number> = {
  action: 659.25,
  warning: 293.66,
  success: 880,
  failure: 196,
};

/**
 * Sparse operational cues for the Patrol Shift simulation.
 *
 * Radio traffic in Patrol Shift is text-first: these cues are effects layered
 * beneath the dispatch text, never a replacement for it. Playback is delegated
 * to the shared SoundEngine, which is muted by default and gates every cue
 * through its own reduced-motion / forced-colors bypass checks.
 */
export type PatrolSoundName =
  | "radioChirp"
  | "radioStatic"
  | "chairliftHum"
  | "skiOnSnow"
  | "sledMovement"
  | "patrolRoomAmbience";

/** Carrier frequencies for each patrol cue; playback remains owned by SoundEngine. */
export const patrolSoundFrequencies: Record<PatrolSoundName, number> = {
  radioChirp: 1244.51,
  radioStatic: 220,
  chairliftHum: 87.31,
  skiOnSnow: 174.61,
  sledMovement: 130.81,
  patrolRoomAmbience: 110,
};

interface PatrolCueShape {
  /** Note duration in seconds. */
  duration: number;
  /** Oscillator waveform. */
  type: OscillatorType;
  /** Cue-local gain multiplier, deliberately low so cues sit under the text. */
  volume: number;
  /** Optional pitch target for sweeps (e.g. the fall-away of a sled runner). */
  endFrequency?: number;
}

const patrolCueShapes: Record<PatrolSoundName, PatrolCueShape> = {
  radioChirp: { duration: 0.07, type: "square", volume: 0.12 },
  radioStatic: { duration: 0.18, type: "sawtooth", volume: 0.06 },
  chairliftHum: { duration: 0.9, type: "sine", volume: 0.05 },
  skiOnSnow: { duration: 0.32, type: "triangle", volume: 0.07 },
  sledMovement: {
    duration: 0.45,
    type: "triangle",
    volume: 0.08,
    endFrequency: 98,
  },
  patrolRoomAmbience: { duration: 1.4, type: "sine", volume: 0.04 },
};

/**
 * Play a single Patrol Shift cue through the shared SoundEngine.
 *
 * No-ops when sound is disallowed (muted, reduced motion, forced colors, or no
 * Web Audio support), so callers never need to guard the call site themselves.
 * Playback failures are swallowed: audio is optional polish and must never
 * block a shift from advancing.
 *
 * @param name - The patrol cue to play.
 * @returns True when the cue was handed to the SoundEngine, false when suppressed or failed.
 */
export function playPatrolCue(name: PatrolSoundName): boolean {
  const engine = getSoundEngine();
  if (!engine.isSoundAllowed()) return false;

  const shape = patrolCueShapes[name];
  try {
    engine.playTone({
      frequency: patrolSoundFrequencies[name],
      endFrequency: shape.endFrequency,
      duration: shape.duration,
      type: shape.type,
      volume: shape.volume,
    });
    return true;
  } catch {
    return false;
  }
}
