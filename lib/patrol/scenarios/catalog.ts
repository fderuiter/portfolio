import type { PatrolScenario } from "../types";

/**
 * Scaffold catalog of Patrol Shift operational scenarios for M1 foundation architecture.
 *
 * Notice: This software is an educational simulation prototype (Issues #744 / #747).
 * It does NOT provide clinical advice, medical protocol guidance, or certified emergency training.
 * Private implementation file stored inside internal package subfolder.
 */
export const INITIAL_PATROL_SCENARIOS: PatrolScenario[] = [
  {
    id: "pine-ridge-sweep",
    title: "Pine Ridge Morning Sweep",
    subtitle: "Routine trail marker and boundary inspection",
    description:
      "Opening patrol sweep across Pine Ridge. Verify trail signage, rope line integrity, and establish radio contact with mountain dispatch.",
    difficulty: "beginner",
    estimatedMinutes: 15,
    location: "Pine Ridge Glades - Chair 4",
    actions: [
      {
        id: "radio-check",
        label: "Establish Radio Comms",
        description:
          "Perform repeater check with Patrol Base dispatch on primary channel.",
        category: "communication",
        costMinutes: 2,
      },
      {
        id: "boundary-inspection",
        label: "Inspect Boundary Ropes",
        description:
          "Check closure signage and rope line tension along glade boundary.",
        category: "assessment",
        costMinutes: 5,
      },
      {
        id: "hazard-marking",
        label: "Mark Trail Hazard",
        description:
          "Set up warning bamboo stakes and crossing poles above exposed rock outcrop.",
        category: "decision",
        costMinutes: 5,
        requiredEquipment: ["bamboo-poles", "warning-signs"],
      },
      {
        id: "log-sweep-completion",
        label: "Log Trail Opening",
        description:
          "Transmit trail clearance confirmation to dispatch to approve opening.",
        category: "communication",
        costMinutes: 3,
      },
    ],
    debriefRules: [
      {
        id: "rule-comms",
        title: "Dispatch Communication",
        category: "protocol",
        passed: true,
        score: 50,
        feedback: "Radio contact established and maintained with Patrol Base.",
      },
      {
        id: "rule-hazard-marking",
        title: "Trail Safety Standards",
        category: "protocol",
        passed: true,
        score: 50,
        feedback:
          "Boundary hazards marked and trail opened according to operational protocols.",
      },
    ],
  },
  {
    id: "summit-weather-monitoring",
    title: "Summit Ridge Weather Monitor",
    subtitle: "Observation of summit wind conditions and ridge visibility",
    description:
      "Mid-morning weather check at Summit Ridge top station. Monitor gust speed, icing on lift infrastructure, and fog encroachment.",
    difficulty: "beginner",
    estimatedMinutes: 10,
    location: "Summit Ridge Top Station",
    actions: [
      {
        id: "anemometer-reading",
        label: "Record Anemometer Reading",
        description:
          "Log continuous 2-minute wind speed and peak gust velocity.",
        category: "assessment",
        costMinutes: 3,
      },
      {
        id: "lift-clearance",
        label: "Inspect Terminal Clearance",
        description: "Verify chairlift unload ramp grade and surface traction.",
        category: "assessment",
        costMinutes: 4,
      },
      {
        id: "advisory-broadcast",
        label: "Transmit Weather Advisory",
        description:
          "Report ridge conditions and visibility assessment to mountain operations.",
        category: "communication",
        costMinutes: 3,
      },
    ],
    debriefRules: [
      {
        id: "rule-weather-log",
        title: "Weather Documentation",
        category: "protocol",
        passed: true,
        score: 100,
        feedback:
          "Wind readings and ramp conditions accurately reported to mountain operations.",
      },
    ],
  },
];
