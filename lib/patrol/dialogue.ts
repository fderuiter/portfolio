/**
 * Stub dialogue system for patrol dispatch, patient interviews, and radio communications.
 */

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options?: Array<{
    label: string;
    nextNodeId: string;
  }>;
}

export function createSampleDialogue(): DialogueNode[] {
  return [
    {
      id: "dispatch-init",
      speaker: "Dispatch",
      text: "Patrol 1, dispatch. We have a reported skier down on Pine Ridge. How copy?",
      options: [
        {
          label: "Copy dispatch, en route from Chair 4 summit.",
          nextNodeId: "dispatch-enroute",
        },
        {
          label: "Say again dispatch, bad reception.",
          nextNodeId: "dispatch-repeat",
        },
      ],
    },
    {
      id: "dispatch-enroute",
      speaker: "Dispatch",
      text: "Understood Patrol 1. Bystander reports knee injury, conscious and alert.",
    },
    {
      id: "dispatch-repeat",
      speaker: "Dispatch",
      text: "Repeating: Skier down Pine Ridge glades, lower leg injury. Acknowledge.",
    },
  ];
}
