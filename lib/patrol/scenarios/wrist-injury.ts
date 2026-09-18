import type { PatrolScenario } from "../types";

/**
 * Scenario A — MVP content package (Issue #752).
 *
 * Purpose: a straightforward, low-ambiguity injury that introduces the
 * basic scene workflow (safety, interview, assessment, treatment,
 * packaging), simple two-person teamwork via a delegation dialogue moment,
 * and the transition into toboggan transport. Intended as the first
 * scenario most players encounter.
 *
 * Notice: Educational simulation prototype, not clinical guidance.
 * // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
 */
export const WRIST_INJURY_SCENARIO: PatrolScenario = {
  id: "wrist-injury-lower-park",
  title: "Lower Park FOOSH Wrist Injury",
  subtitle: "Beginner-terrain fall with an isolated wrist injury",
  description:
    "A guest fell while stepping off the Lower Park carpet lift and put an arm out to catch themselves. Alert, cooperative, and complaining only of wrist pain.",
  difficulty: "beginner",
  category: "trauma",
  estimatedMinutes: 12,
  location: "Lower Park Beginner Carpet - Unload Zone",
  dispatchPrompt:
    "Patrol 2, Base Dispatch. Guest down at the Lower Park carpet unload, reported wrist injury after a fall. Alert and able to talk. Respond 10-2.",
  environment: {
    // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
    weather: "Clear, 28°F, calm wind",
    snowConditions: "Machine-groomed corduroy, beginner grade",
    temperatureFahrenheit: 28,
    visibility: "Good",
    hazards: ["Carpet lift unload traffic", "Beginner skiers merging nearby"],
    sceneSafetyNotes:
      "Low-speed zone, but unload traffic needs to be routed around the patient.",
  },
  patient: {
    // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
    complaint: "Pain and swelling in the right wrist",
    mechanism:
      "Fell backward off the carpet lift and caught themselves with an outstretched right hand",
    levelOfConsciousness: "Alert & Oriented x4 (GCS 15)",
    findings: [
      "Mild swelling over the distal right wrist",
      "No obvious deformity",
      "Distal PMS intact",
    ],
    interventions: [
      "Wrist splinted in position found",
      "Arm placed in a sling for comfort",
    ],
    vitals: {
      heartRate: 82,
      respiration: 16,
      bpSystolic: 118,
      bpDiastolic: 76,
      spo2: 99,
      temperature: 98.2,
      gcs: 15,
      avpu: "A",
      pms: "intact",
    },
  },
  actors: [
    {
      id: "actor-casey-partner",
      name: "Casey",
      role: "Second-Year Patroller",
      notes:
        "Responds as a second set of hands; still building confidence on scene.",
      statement:
        "First one on scene after you — ready to help, just say what you need.",
    },
  ],
  initialVitals: {
    // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
    heartRate: 82,
    respiration: 16,
    bpSystolic: 118,
    bpDiastolic: 76,
    spo2: 99,
    temperature: 98.2,
    gcs: 15,
    avpu: "A",
    pms: "intact",
  },
  // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
  // (vitalsCheck numbers, splint/sling steps, and PMS findings within actions below)
  actions: [
    {
      id: "assess-scene-safety",
      label: "Assess & Secure Scene Safety",
      description:
        "Position yourself and gear to route unload traffic around the patient at the base of the carpet.",
      category: "assessment",
      costMinutes: 1,
      securesSceneSafety: true,
      reveals: {
        environment: {
          hazards: ["Carpet unload traffic routed around the scene"],
          sceneSafetyNotes: "Scene secured: unload lane clear of the patient.",
        },
      },
    },
    {
      id: "interview-patient",
      label: "Interview the Patient",
      description:
        "Ask what happened, where it hurts, and whether they can move their fingers.",
      category: "assessment",
      costMinutes: 2,
      reveals: {
        patient: {
          mechanism:
            "Fell backward off the carpet lift and caught themselves with an outstretched right hand",
        },
      },
    },
    {
      id: "primary-assessment",
      label: "Conduct Primary Assessment (ABCs / LOC)",
      description:
        "Check airway, breathing, circulation, and level of consciousness before focusing on the wrist.",
      category: "assessment",
      costMinutes: 2,
      preconditions: ["assess-scene-safety"],
      reveals: {
        patient: {
          complaint: "Pain and swelling in the right wrist",
          levelOfConsciousness: "Alert & Oriented x4 (GCS 15)",
          findings: [
            "Airway patent and clear",
            "Breathing unlabored at 16 breaths/min",
          ],
        },
      },
    },
    {
      id: "check-vitals",
      label: "Measure Baseline Vital Signs",
      description: "Obtain pulse, respiration, blood pressure, and SpO2.",
      category: "assessment",
      costMinutes: 2,
      preconditions: ["primary-assessment"],
      vitalsCheck: {
        heartRate: 82,
        respiration: 16,
        bpSystolic: 118,
        bpDiastolic: 76,
        spo2: 99,
        temperature: 98.2,
        gcs: 15,
        avpu: "A",
        pms: "intact",
      },
      reveals: {
        patient: {
          vitals: {
            heartRate: 82,
            respiration: 16,
            bpSystolic: 118,
            bpDiastolic: 76,
            spo2: 99,
            temperature: 98.2,
            gcs: 15,
            avpu: "A",
            pms: "intact",
          },
        },
      },
    },
    {
      id: "secondary-assessment",
      label: "Focused Wrist Exam & PMS Check",
      description:
        "Expose the wrist, check for deformity and swelling, and verify distal pulse, motor, and sensation.",
      category: "assessment",
      costMinutes: 3,
      preconditions: ["primary-assessment"],
      reveals: {
        patient: {
          findings: [
            "Mild swelling over the distal right wrist",
            "No obvious deformity",
            "Distal PMS intact",
          ],
        },
      },
    },
    {
      id: "splint-wrist",
      label: "Splint the Wrist & Re-verify PMS",
      description:
        "Apply a padded splint immobilizing the wrist in position found, then re-check distal PMS.",
      category: "treatment",
      costMinutes: 5,
      requiredEquipment: ["sam-splint", "elastic-wrap"],
      preconditions: ["secondary-assessment"],
      requiresSceneSafety: true,
      reveals: {
        patient: {
          interventions: ["Wrist splinted in position found"],
        },
      },
    },
    {
      id: "package-for-transport",
      label: "Sling the Arm & Prepare for Toboggan",
      description:
        "Place the splinted arm in a sling, insulate against the cold, and settle the patient for the ride down.",
      category: "transport",
      costMinutes: 3,
      preconditions: ["splint-wrist"],
      requiresSceneSafety: true,
      reveals: {
        patient: {
          interventions: ["Arm placed in a sling for comfort"],
        },
      },
    },
  ],
  dialogueMoments: [
    {
      id: "delegate-to-casey",
      speaker: "Casey (Second-Year Patroller)",
      prompt: "What do you want me to do?",
      context:
        "Casey jogs up with the pack right after you've secured the scene — willing to help, still building confidence on what to do without being told directly.",
      afterActionId: "assess-scene-safety",
      options: [
        {
          id: "delegate-directive-closed-loop",
          text: "Grab the wrist splint kit from the pack and bring it over — repeat that back to me so I know you've got it.",
          style: "directive",
          clarity: "high",
          closesLoop: true,
          response:
            'Casey repeats "splint kit from the pack" back, confirms, and returns with it in under a minute.',
          debriefNote:
            "Gave a specific task and asked for a read-back — a clear, closed-loop handoff that left no room for guessing.",
        },
        {
          id: "delegate-collaborative",
          text: "I've got the patient — can you keep the unload lane clear so nobody skis through while we work?",
          style: "collaborative",
          clarity: "moderate",
          closesLoop: false,
          response:
            "Casey nods and moves to the unload lane, waving guests around the scene without needing further direction.",
          debriefNote:
            "Split the workload and explained the reasoning, without asking Casey to confirm understanding back.",
        },
        {
          id: "delegate-deferential",
          text: "Just help out however you can, I've got this.",
          style: "deferential",
          clarity: "low",
          closesLoop: false,
          response:
            "Casey hovers nearby, unsure whether to grab gear, manage traffic, or just watch, and ends up doing a little of each.",
          debriefNote:
            "Left the task open-ended — Casey stayed willing to help but had no specific direction to act on.",
        },
      ],
    },
  ],
  debriefRules: [
    {
      id: "rule-scene-safety",
      title: "Scene Safety Protocol",
      category: "safety",
      passed: true,
      score: 25,
      feedback:
        "Unload lane routed around the patient before hands-on assessment began.",
    },
    {
      id: "rule-pms-evaluation",
      title: "Neurovascular Assessment",
      category: "clinical",
      passed: true,
      score: 30,
      feedback:
        "Distal pulse, motor, and sensory function checked before and after splinting.",
    },
    {
      id: "rule-splint-package",
      title: "Immobilization & Packaging",
      category: "clinical",
      passed: true,
      score: 25,
      feedback:
        "Wrist immobilized and arm supported before toboggan transport.",
    },
    {
      id: "rule-teamwork-delegation",
      title: "Delegation & Teamwork",
      category: "communication",
      passed: true,
      score: 20,
      feedback:
        "Engaged the responding partner with a specific task rather than leaving them without direction.",
    },
  ],
};
