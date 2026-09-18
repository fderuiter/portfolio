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
    title: "West Slopes Morning Sweep",
    subtitle: "Routine trail marker and boundary inspection",
    description:
      "Opening patrol sweep across Welch Village's West Slopes, starting at Cedar Fork. Verify trail signage, rope line integrity, and establish radio contact with mountain dispatch.",
    difficulty: "beginner",
    estimatedMinutes: 15,
    location: "Cedar Fork - West Slopes",
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
          "Check closure signage and rope line tension along the West Slopes boundary.",
        category: "assessment",
        costMinutes: 5,
      },
      {
        id: "hazard-marking",
        label: "Mark Trail Hazard",
        description:
          "Set up warning bamboo stakes and crossing poles above an exposed rock outcrop near Twister.",
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
    title: "Summit Weather Watch",
    subtitle: "Observation of summit wind conditions and ridge visibility",
    description:
      "Mid-morning weather check at Welch Village's summit station, top of the Belle Creek Quad. Monitor gust speed, icing on lift infrastructure, and fog encroachment.",
    difficulty: "beginner",
    estimatedMinutes: 10,
    location: "The Summit, Welch Village (1,060 ft)",
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

// PLACEHOLDER — needs OEC/NSP content review, see #744
export const OEC_SAMPLE_SCENARIO: PatrolScenario = {
  id: "upper-ridge-injury",
  title: "Dan's Dive Lower Extremity Trauma",
  subtitle: "Downhill skier collision with fall and lower extremity trauma",
  description:
    "Skier down on Dan's Dive, East Slopes. Witnesses report catching an outside edge on firm hardpack with a tumbling fall.",
  difficulty: "intermediate",
  estimatedMinutes: 20,
  location: "Dan's Dive - East Slopes",
  dispatchPrompt:
    "Patrol Base Dispatch: 10-50 skier down on Dan's Dive, East Slopes, reported lower extremity injury. Respond with Cascade 100 toboggan.",
  environment: {
    weather: "Overcast, 22°F, light wind",
    snowConditions: "Firm hardpack / groomed packed powder",
    temperatureFahrenheit: 22,
    visibility: "Moderate (flat light and glare)",
    hazards: [
      "Downhill skier traffic from the Cannon-Valley Quad runout",
      "Blind terrain roll 25 feet uphill",
    ],
    sceneSafetyNotes:
      "Requires uphill crossed skis or spotter to divert oncoming traffic.",
  },
  patient: {
    complaint: "Severe pain, swelling, and point tenderness in lower left leg",
    mechanism:
      "High-speed tumbling fall after catching outside ski edge; ski binding failed to release",
    levelOfConsciousness: "Alert & Oriented x4 (GCS 15)",
    findings: [
      "Deformity and localized swelling at mid-shaft tibia",
      "Distal PMS intact (strong dorsalis pedis pulse, motor and sensation intact)",
    ],
    interventions: [
      "SAM splint applied to lower extremity",
      "Insulated with wool blanket and toboggan tarp wrap",
    ],
    vitals: {
      heartRate: 76,
      respiration: 16,
      bpSystolic: 124,
      bpDiastolic: 82,
      spo2: 98,
      temperature: 98.4,
      gcs: 15,
      avpu: "A",
      pms: "intact",
    },
  },
  actors: [
    {
      id: "actor-witness-alex",
      name: "Alex",
      role: "Bystander / Ski Partner",
      notes: "Skied with patient; witnessed tumbling fall.",
      statement:
        "They were carving on hardpack, caught an outside edge, and took a hard tumble. Binding didn't release. No head strike.",
    },
    {
      id: "actor-partner-patroller",
      name: "Jordan",
      role: "Responding Patroller",
      notes: "Arrived on scene with Cascade 100 toboggan and trauma pack.",
      statement:
        "Sled anchored uphill with chain brake set. Splint kit and blanket ready.",
    },
  ],
  initialVitals: {
    heartRate: 76,
    respiration: 16,
    bpSystolic: 124,
    bpDiastolic: 82,
    spo2: 98,
    temperature: 98.4,
    gcs: 15,
    avpu: "A",
    pms: "intact",
  },
  actions: [
    {
      id: "assess-scene-safety",
      label: "Assess & Secure Scene Safety",
      description:
        "Plant crossed skis 25ft uphill to divert oncoming downhill skier traffic and establish a protected perimeter.",
      category: "assessment",
      costMinutes: 2,
      securesSceneSafety: true,
      reveals: {
        environment: {
          hazards: ["Downhill skier traffic diverted by uphill crossed skis"],
          sceneSafetyNotes: "Scene secured: uphill perimeter established.",
        },
      },
    },
    {
      id: "interview-witness",
      label: "Interview Witness (Alex)",
      description:
        "Inquire about speed, fall mechanics, loss of consciousness, and head strike.",
      category: "assessment",
      costMinutes: 2,
      reveals: {
        actors: [
          {
            id: "actor-witness-alex",
            name: "Alex",
            role: "Bystander / Ski Partner",
            notes: "Skied with patient; witnessed tumbling fall.",
            statement:
              "They were carving on hardpack, caught an outside edge, and took a hard tumble. Binding didn't release. No head strike.",
          },
        ],
        patient: {
          mechanism:
            "High-speed tumbling fall after catching outside ski edge; ski binding failed to release",
        },
      },
    },
    {
      id: "primary-assessment",
      label: "Conduct Primary Assessment (ABCs / LOC)",
      description:
        "Assess Airway, Breathing, Circulation, and Level of Consciousness (AVPU / GCS).",
      category: "assessment",
      costMinutes: 3,
      preconditions: ["assess-scene-safety"],
      reveals: {
        patient: {
          complaint:
            "Severe pain, swelling, and point tenderness in lower left leg",
          levelOfConsciousness: "Alert & Oriented x4 (GCS 15)",
          findings: [
            "Airway patent and clear",
            "Breathing unlabored at 16 breaths/min",
            "Radial pulse strong and regular",
          ],
        },
      },
    },
    {
      id: "check-vitals",
      label: "Measure Baseline Vital Signs",
      description:
        "Obtain pulse, respiration rate, blood pressure, SpO2, and skin temperature.",
      category: "assessment",
      costMinutes: 3,
      preconditions: ["primary-assessment"],
      vitalsCheck: {
        heartRate: 76,
        respiration: 16,
        bpSystolic: 124,
        bpDiastolic: 82,
        spo2: 98,
        temperature: 98.4,
        gcs: 15,
        avpu: "A",
        pms: "intact",
      },
      reveals: {
        patient: {
          vitals: {
            heartRate: 76,
            respiration: 16,
            bpSystolic: 124,
            bpDiastolic: 82,
            spo2: 98,
            temperature: 98.4,
            gcs: 15,
            avpu: "A",
            pms: "intact",
          },
        },
      },
    },
    {
      id: "secondary-assessment",
      label: "Focused Secondary Exam & Neurovascular (PMS) Check",
      description:
        "Expose injury site, inspect for deformity/swelling, and verify distal Pulse, Motor, and Sensory functions.",
      category: "assessment",
      costMinutes: 4,
      preconditions: ["primary-assessment"],
      reveals: {
        patient: {
          findings: [
            "Point tenderness and localized swelling at mid-shaft tibia",
            "Distal pedal pulse present and strong",
            "Motor and sensory function intact in toes bilaterally",
          ],
        },
      },
    },
    {
      id: "apply-splint",
      label: "Apply Rigid SAM Splint & Re-verify PMS",
      description:
        "Immobilize joint above and below injury; re-check distal pulse, motor, and sensation post-splinting.",
      category: "treatment",
      costMinutes: 6,
      requiredEquipment: ["sam-splint", "elastic-wrap", "cravats"],
      preconditions: ["secondary-assessment"],
      requiresSceneSafety: true,
      reveals: {
        patient: {
          interventions: [
            "SAM splint contoured and secured to lower left extremity",
            "Distal PMS re-checked and verified intact post-splinting",
          ],
        },
      },
    },
    {
      id: "package-patient",
      label: "Package in Toboggan with Hypothermia Wrap",
      description:
        "Transfer patient onto litter, apply wool blanket insulation, and secure tie-down straps in toboggan.",
      category: "transport",
      costMinutes: 5,
      preconditions: ["apply-splint"],
      requiresSceneSafety: true,
      reveals: {
        patient: {
          interventions: [
            "Packaged in Cascade 100 rescue toboggan",
            "Wool blanket and waterproof tarp hypothermia wrap applied",
          ],
        },
      },
    },
  ],
  debriefRules: [
    {
      id: "rule-scene-safety",
      title: "Scene Safety Protocol",
      category: "safety",
      passed: true,
      score: 30,
      feedback: "Uphill crossed skis placed before initiating patient contact.",
    },
    {
      id: "rule-pms-evaluation",
      title: "Neurovascular Assessment",
      category: "clinical",
      passed: true,
      score: 35,
      feedback:
        "Distal pulse, motor, and sensory functions assessed before and after splinting.",
    },
    {
      id: "rule-splint-package",
      title: "Immobilization & Packaging",
      category: "clinical",
      passed: true,
      score: 35,
      feedback:
        "Extremity immobilized and patient packaged with hypothermia protection.",
    },
  ],
};
