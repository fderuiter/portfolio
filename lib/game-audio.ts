export type GameSoundName = "action" | "warning" | "success" | "failure";

/** Frequencies shared by game UIs; playback remains owned by SoundEngine. */
export const gameSoundFrequencies: Record<GameSoundName, number> = {
  action: 659.25,
  warning: 293.66,
  success: 880,
  failure: 196,
};
