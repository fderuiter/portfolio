import type {
  DialogueMoment,
  DialogueOption,
  PatrolEvent,
  ScenarioAction,
} from "./types";

/**
 * Interpersonal dialogue & delegation system (Issue #752).
 *
 * Models radio, patient, and teammate communication as a choice between
 * `DialogueStyle`s rather than a binary correct/incorrect answer. Every
 * option is a legitimate way to communicate; they differ in clarity,
 * closed-loop confirmation, and teamwork framing, and the debrief note on
 * each option should stay descriptive rather than pass/fail.
 */

/**
 * Returns the dialogue moments from a scenario that are currently unlocked
 * given the actions already performed on scene.
 *
 * A moment with no `afterActionId` is available immediately; otherwise it
 * unlocks once the referenced action has been executed.
 */
export function getUnlockedDialogueMoments(
  moments: DialogueMoment[] | undefined,
  actionHistory: ScenarioAction[]
): DialogueMoment[] {
  if (!moments || moments.length === 0) return [];
  const executedIds = new Set(actionHistory.map((a) => a.id));
  return moments.filter(
    (moment) => !moment.afterActionId || executedIds.has(moment.afterActionId)
  );
}

/**
 * Looks up a single option within a dialogue moment by id.
 */
export function findDialogueOption(
  moment: DialogueMoment,
  optionId: string
): DialogueOption | undefined {
  return moment.options.find((option) => option.id === optionId);
}

/**
 * Builds the rich `PatrolEvent` recorded when a patroller selects a dialogue
 * option, carrying enough context (style, clarity, closed-loop status,
 * in-fiction response) for the M7 debrief to reference the specific moment
 * without re-deriving it from raw UI state.
 */
export function createDialogueChoiceEvent(
  scenarioId: string,
  moment: DialogueMoment,
  option: DialogueOption,
  timestamp: number = Date.now()
): PatrolEvent {
  return {
    timestamp,
    scenarioId,
    action: "DIALOGUE_CHOICE",
    type: "DIALOGUE_CHOICE",
    title: `Dialogue: ${moment.speaker}`,
    description: option.debriefNote,
    severity: "info",
    context: {
      momentId: moment.id,
      speaker: moment.speaker,
      prompt: moment.prompt,
      optionId: option.id,
      chosenText: option.text,
      style: option.style,
      clarity: option.clarity,
      closesLoop: option.closesLoop ?? false,
      response: option.response,
      debriefNote: option.debriefNote,
    },
  };
}
