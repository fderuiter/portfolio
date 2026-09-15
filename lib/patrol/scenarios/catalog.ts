import type { PatrolScenario } from "../types";

/**
 * Initial catalog of Patrol Shift scenarios.
 * Private implementation file stored inside internal package subfolder.
 */
export const INITIAL_PATROL_SCENARIOS: PatrolScenario[] = [
  {
    id: "pine-ridge-trauma",
    title: "Pine Ridge Trauma",
    subtitle: "High-speed collision on a black diamond run",
    description:
      "A skier collided with a tree near the Pine Ridge glades. Dispatch reports lower extremity deformity and severe pain.",
    difficulty: "intermediate",
    estimatedMinutes: 25,
    location: "Pine Ridge Glades - Chair 4",
    initialVitals: {
      heartRate: 112,
      respiration: 22,
      bpSystolic: 128,
      bpDiastolic: 82,
      spo2: 96,
      temperature: 36.5,
      gcs: 15,
    },
    actions: [
      {
        id: "scene-sizeup",
        label: "Scene Size-Up & Safety",
        description:
          "Set up crossed skis above incident site and assess scene hazards.",
        category: "assessment",
        costMinutes: 2,
      },
      {
        id: "primary-assessment",
        label: "Primary Assessment (ABCDE)",
        description:
          "Assess airway, breathing, circulation, disability, and exposure.",
        category: "assessment",
        costMinutes: 3,
      },
      {
        id: "c-spine-stabilization",
        label: "C-Spine Stabilization",
        description:
          "Manually stabilize cervical spine and apply cervical collar.",
        category: "treatment",
        costMinutes: 2,
        requiredEquipment: ["c-collar"],
      },
      {
        id: "splint-extremity",
        label: "Apply Traction / Rigid Splint",
        description: "Immobilize fractured limb before transport.",
        category: "treatment",
        costMinutes: 8,
        requiredEquipment: ["traction-splint"],
      },
      {
        id: "toboggan-transport",
        label: "Toboggan Transport",
        description:
          "Secure patient on backboard in toboggan and transport to Patrol Base.",
        category: "transport",
        costMinutes: 10,
        requiredEquipment: ["toboggan", "backboard"],
      },
    ],
    debriefRules: [
      {
        id: "rule-scene-safety",
        title: "Scene Safety First",
        category: "protocol",
        passed: true,
        score: 20,
        feedback: "Crossed skis deployed prior to entering the incident zone.",
      },
      {
        id: "rule-cspine",
        title: "C-Spine Management",
        category: "clinical",
        passed: true,
        score: 30,
        feedback: "C-spine stabilized early during primary assessment.",
      },
    ],
  },
  {
    id: "summit-hypothermia",
    title: "Summit Ridge Hypothermia",
    subtitle: "Exposed stranded snowboarder in sub-zero winds",
    description:
      "Cold exposure case near Summit Ridge after rider lost orientation in heavy fog.",
    difficulty: "beginner",
    estimatedMinutes: 15,
    location: "Summit Ridge Top Station",
    initialVitals: {
      heartRate: 58,
      respiration: 12,
      bpSystolic: 102,
      bpDiastolic: 64,
      spo2: 94,
      temperature: 33.8,
      gcs: 14,
    },
    actions: [
      {
        id: "passive-rewarming",
        label: "Passive Active Rewarming",
        description:
          "Remove wet clothing, wrap in heat blankets and space bag.",
        category: "treatment",
        costMinutes: 5,
        requiredEquipment: ["wool-blanket", "heat-pack"],
      },
    ],
    debriefRules: [
      {
        id: "rule-rewarming",
        title: "Gentle Handling & Rewarming",
        category: "clinical",
        passed: true,
        score: 50,
        feedback:
          "Patient kept horizontal and handled gently to prevent ventricular fibrillation.",
      },
    ],
  },
];
