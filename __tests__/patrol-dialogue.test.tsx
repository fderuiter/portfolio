import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DialogueChoice } from "@/components/patrol/DialogueChoice";
import { SceneInteraction } from "@/components/patrol/SceneInteraction";
import {
  getUnlockedDialogueMoments,
  createDialogueChoiceEvent,
  type DialogueMoment,
  type PatrolScenario,
  type PatrolEvent,
} from "@/lib/patrol";

// Fixture dialogue moment mirroring the delegation beat wired into
// wrist-injury.ts / busy-scene.ts — three non-binary communication styles,
// none marked as the "correct" answer.
const testMoment: DialogueMoment = {
  id: "test-delegate",
  speaker: "Casey (Second-Year Patroller)",
  prompt: "What do you want me to do?",
  context: "Casey is ready to help but still new to the scene.",
  afterActionId: "assess-scene-safety",
  options: [
    {
      id: "opt-directive",
      text: "Grab the trauma pack and get vitals — read that back to me when you're set.",
      style: "directive",
      clarity: "high",
      closesLoop: true,
      response: "Casey repeats the request back and heads for the pack.",
      debriefNote:
        "Delegated with a specific task and asked for a closed-loop read-back.",
    },
    {
      id: "opt-collaborative",
      text: "Can you keep an eye on the slope above us while I get started?",
      style: "collaborative",
      clarity: "moderate",
      response: "Casey agrees and moves uphill to watch traffic.",
      debriefNote:
        "Split the workload without asking for explicit confirmation.",
    },
    {
      id: "opt-deferential",
      text: "Just help out however you can, I've got this.",
      style: "deferential",
      clarity: "low",
      response: "Casey hesitates, unsure exactly where to start.",
      debriefNote: "Left the task open-ended with no specific direction.",
    },
  ],
};

describe("Patrol Shift — M6 Interpersonal Dialogue & Delegation System (Issue #752)", () => {
  afterEach(cleanup);

  describe("1. lib/patrol/dialogue.ts pure logic", () => {
    it("locks a dialogue moment until its prerequisite action has been executed", () => {
      expect(getUnlockedDialogueMoments([testMoment], [])).toHaveLength(0);

      const safetyAction = { id: "assess-scene-safety", label: "Assess Scene" };
      expect(
        getUnlockedDialogueMoments([testMoment], [safetyAction])
      ).toHaveLength(1);
    });

    it("unlocks moments with no afterActionId immediately", () => {
      const immediateMoment: DialogueMoment = {
        ...testMoment,
        afterActionId: undefined,
      };
      expect(getUnlockedDialogueMoments([immediateMoment], [])).toHaveLength(1);
    });

    it("builds a rich PatrolEvent carrying style/clarity/closed-loop context for the chosen option", () => {
      const option = testMoment.options[0];
      const event = createDialogueChoiceEvent(
        "wrist-injury-lower-park",
        testMoment,
        option,
        1000
      );

      expect(event.action).toBe("DIALOGUE_CHOICE");
      expect(event.type).toBe("DIALOGUE_CHOICE");
      expect(event.scenarioId).toBe("wrist-injury-lower-park");
      expect(event.timestamp).toBe(1000);
      expect(event.context).toMatchObject({
        momentId: testMoment.id,
        speaker: testMoment.speaker,
        optionId: option.id,
        style: "directive",
        clarity: "high",
        closesLoop: true,
        response: option.response,
        debriefNote: option.debriefNote,
      });
    });
  });

  describe("2. DialogueChoice component rendering & selection", () => {
    it("renders the speaker, prompt, context, and every option with no response shown yet", () => {
      render(<DialogueChoice scenarioId="test-scenario" moment={testMoment} />);

      expect(screen.getByTestId("dialogue-moment-test-delegate")).toBeDefined();
      expect(
        screen.getByText(/Casey \(Second-Year Patroller\)/i)
      ).toBeDefined();
      expect(screen.getByText(/What do you want me to do\?/i)).toBeDefined();
      expect(
        screen.getByText(/ready to help but still new to the scene/i)
      ).toBeDefined();

      for (const option of testMoment.options) {
        expect(
          screen.getByTestId(`dialogue-option-${option.id}`)
        ).toBeDefined();
        expect(screen.getByText(option.text)).toBeDefined();
      }

      expect(screen.queryByTestId("dialogue-response")).toBeNull();
    });

    it("selects an option via mouse/touch click, logs a PatrolEvent, and reveals the response", () => {
      const onChoose = vi.fn();
      render(
        <DialogueChoice
          scenarioId="wrist-injury-lower-park"
          moment={testMoment}
          onChoose={onChoose}
        />
      );

      const collaborativeBtn = screen.getByTestId(
        "dialogue-option-opt-collaborative"
      );
      fireEvent.click(collaborativeBtn);

      expect(onChoose).toHaveBeenCalledTimes(1);
      const [event, option] = onChoose.mock.calls[0] as [
        PatrolEvent,
        (typeof testMoment.options)[number],
      ];
      expect(event.action).toBe("DIALOGUE_CHOICE");
      expect(event.context?.optionId).toBe("opt-collaborative");
      expect(option.id).toBe("opt-collaborative");

      expect(screen.getByTestId("dialogue-response").textContent).toContain(
        "Casey agrees and moves uphill to watch traffic."
      );
      expect(collaborativeBtn.getAttribute("aria-pressed")).toBe("true");
    });

    it("selects an option via keyboard (Enter) and locks out the remaining options", () => {
      const onChoose = vi.fn();
      render(
        <DialogueChoice
          scenarioId="wrist-injury-lower-park"
          moment={testMoment}
          onChoose={onChoose}
        />
      );

      const directiveBtn = screen.getByTestId("dialogue-option-opt-directive");
      directiveBtn.focus();
      expect(document.activeElement).toBe(directiveBtn);

      fireEvent.keyDown(directiveBtn, { key: "Enter", code: "Enter" });

      expect(onChoose).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("dialogue-response")).toBeDefined();

      const deferentialBtn = screen.getByTestId(
        "dialogue-option-opt-deferential"
      ) as HTMLButtonElement;
      expect(deferentialBtn.disabled).toBe(true);

      // A locked-out option cannot be selected afterward.
      fireEvent.click(deferentialBtn);
      expect(onChoose).toHaveBeenCalledTimes(1);
    });

    it("supports Space key activation in addition to Enter", () => {
      const onChoose = vi.fn();
      render(
        <DialogueChoice
          scenarioId="wrist-injury-lower-park"
          moment={testMoment}
          onChoose={onChoose}
        />
      );

      const btn = screen.getByTestId("dialogue-option-opt-directive");
      fireEvent.keyDown(btn, { key: " ", code: "Space" });
      expect(onChoose).toHaveBeenCalledTimes(1);
    });

    it("renders as already resolved when a resolvedOptionId is supplied", () => {
      render(
        <DialogueChoice
          scenarioId="wrist-injury-lower-park"
          moment={testMoment}
          resolvedOptionId="opt-collaborative"
        />
      );

      expect(screen.getByTestId("dialogue-response").textContent).toContain(
        "Casey agrees and moves uphill to watch traffic."
      );
      const directiveBtn = screen.getByTestId(
        "dialogue-option-opt-directive"
      ) as HTMLButtonElement;
      expect(directiveBtn.disabled).toBe(true);
    });

    it("verifies minimum 44x44px touch targets on every dialogue option button", () => {
      render(<DialogueChoice scenarioId="test-scenario" moment={testMoment} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
      for (const btn of buttons) {
        expect(btn.className).toMatch(/min-h-\[44px\]/);
        expect(btn.className).toMatch(/min-w-\[44px\]/);
      }
    });
  });

  describe("3. Wired into SceneInteraction for on-scene play", () => {
    const wiredScenario: PatrolScenario = {
      id: "wired-test-scenario",
      title: "Wired Dialogue Test",
      actions: [
        {
          id: "assess-scene-safety",
          label: "Assess Scene Safety",
          category: "assessment",
          securesSceneSafety: true,
        },
      ],
      dialogueMoments: [testMoment],
      debriefRules: [],
    };

    it("does not render the dialogue moment until its prerequisite action is executed", () => {
      render(
        <SceneInteraction
          scenario={wiredScenario}
          actionHistory={[]}
          onExecuteAction={() => {}}
          onPrepareTransport={() => {}}
        />
      );

      expect(screen.queryByTestId("scene-dialogue-moments")).toBeNull();
    });

    it("renders the unlocked dialogue moment and forwards the logged event via onDialogueChoice", () => {
      const onDialogueChoice = vi.fn();
      render(
        <SceneInteraction
          scenario={wiredScenario}
          actionHistory={[wiredScenario.actions[0]]}
          activeEvents={[]}
          onExecuteAction={() => {}}
          onPrepareTransport={() => {}}
          onDialogueChoice={onDialogueChoice}
        />
      );

      expect(screen.getByTestId("scene-dialogue-moments")).toBeDefined();
      const btn = screen.getByTestId("dialogue-option-opt-directive");
      fireEvent.click(btn);

      expect(onDialogueChoice).toHaveBeenCalledTimes(1);
      const loggedEvent = onDialogueChoice.mock.calls[0][0] as PatrolEvent;
      expect(loggedEvent.action).toBe("DIALOGUE_CHOICE");
      expect(loggedEvent.scenarioId).toBe("wired-test-scenario");
      expect(loggedEvent.context?.optionId).toBe("opt-directive");
    });

    it("pre-resolves a dialogue moment from prior shift events so it renders as already answered", () => {
      const priorEvent: PatrolEvent = {
        timestamp: Date.now(),
        scenarioId: "wired-test-scenario",
        action: "DIALOGUE_CHOICE",
        context: { momentId: "test-delegate", optionId: "opt-collaborative" },
      };

      render(
        <SceneInteraction
          scenario={wiredScenario}
          actionHistory={[wiredScenario.actions[0]]}
          activeEvents={[priorEvent]}
          onExecuteAction={() => {}}
          onPrepareTransport={() => {}}
        />
      );

      expect(screen.getByTestId("dialogue-response").textContent).toContain(
        "Casey agrees and moves uphill to watch traffic."
      );
    });
  });
});
