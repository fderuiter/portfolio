import type { PatrolScenario } from "../types";

/**
 * Scenario C — MVP content package (Issue #752).
 *
 * Purpose: a busy, crowded scene with multiple bystanders and a second
 * involved skier, exercising crowd/traffic management, delegation to a
 * responding patroller, radio communication, and operational judgment
 * under distraction — not just clinical assessment.
 *
 * Notice: Educational simulation prototype, not clinical guidance.
 * // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
 */
export const BUSY_SCENE_SCENARIO: PatrolScenario = {
  id: "cat-track-collision",
  title: "Crosstrail Collision at a Crowded Merge",
  subtitle: "Two-skier collision at a blind trail merge with a growing crowd",
  description:
    "Two skiers collided at a blind merge on Crosstrail Right. One is down with a leg injury; the other is shaken but on their feet. A crowd of onlookers is gathering and blocking sightlines for uphill traffic.",
  difficulty: "advanced",
  category: "trauma",
  estimatedMinutes: 25,
  location: "Crosstrail Right - Mid-Mountain Merge",
  coordinates: { x: 1320, y: 580, zone: "main" },
  dispatchPrompt:
    "All patrol, Base Dispatch. Two-skier collision at the Crosstrail Right merge, one down, reported leg injury. Crowd gathering. Respond 10-2, additional patroller en route.",
  environment: {
    // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
    weather: "Sunny, 30°F, busy holiday traffic",
    snowConditions: "Packed powder, high traffic Crosstrail merge",
    temperatureFahrenheit: 30,
    visibility: "Good, but sightlines blocked by the crowd",
    hazards: [
      "Blind uphill merge with continuous skier traffic",
      "Growing crowd of onlookers blocking sightlines",
      "Second involved skier standing in the traffic lane",
    ],
    sceneSafetyNotes:
      "Requires both uphill traffic control and active crowd management before patient care can proceed safely.",
  },
  patient: {
    // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
    complaint: "Severe pain in the left leg, unable to bear weight",
    mechanism:
      "Collided with another skier at the blind merge and fell awkwardly onto the left leg",
    levelOfConsciousness: "Alert & Oriented x4 (GCS 15)",
    findings: [
      "Deformity and swelling at the mid-shaft left tibia",
      "Distal pedal pulse present and strong",
    ],
    interventions: [
      "Left leg splinted",
      "Packaged in toboggan with hypothermia wrap",
    ],
    vitals: {
      heartRate: 92,
      respiration: 20,
      bpSystolic: 128,
      bpDiastolic: 84,
      spo2: 97,
      temperature: 98.6,
      gcs: 15,
      avpu: "A",
      pms: "intact",
    },
  },
  actors: [
    {
      id: "actor-other-skier",
      name: "Drew",
      role: "Other Skier Involved in Collision",
      notes: "On their feet, visibly shaken, no obvious injury reported.",
      statement:
        "I never saw them coming around the bend; I think I clipped their skis. I'm okay, just rattled. Is the other guest going to be alright?",
    },
    {
      id: "actor-morgan-partner",
      name: "Morgan",
      role: "Responding Patroller",
      notes:
        "Second patroller arriving shortly after scene safety is addressed.",
      statement: "I'm here. Where do you need me first?",
    },
  ],
  initialVitals: {
    // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
    heartRate: 92,
    respiration: 20,
    bpSystolic: 128,
    bpDiastolic: 84,
    spo2: 97,
    temperature: 98.6,
    gcs: 15,
    avpu: "A",
    pms: "intact",
  },
  // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
  // (vitalsCheck numbers, splint steps, and PMS findings within actions below)
  actions: [
    {
      id: "assess-scene-safety",
      label: "Assess & Secure Scene Safety",
      description:
        "Plant crossed skis above the blind merge to warn oncoming traffic before approaching either patient.",
      category: "assessment",
      costMinutes: 2,
      securesSceneSafety: true,
      reveals: {
        environment: {
          hazards: ["Uphill merge traffic warned by crossed skis"],
          sceneSafetyNotes: "Scene secured: merge traffic warned.",
        },
      },
    },
    {
      id: "manage-crowd",
      label: "Manage the Crowd",
      description:
        "Ask onlookers to step back off the trail and clear the sightline for approaching skiers.",
      category: "decision",
      costMinutes: 2,
      preconditions: ["assess-scene-safety"],
      reassessesSceneSafety: true,
      reveals: {
        environment: {
          hazards: ["Crowd moved off the trail, sightline restored"],
        },
      },
    },
    {
      id: "radio-request-assist",
      label: "Radio Base for Additional Traffic Control",
      description:
        "Call in the crowd and traffic situation so base can route another patroller or send signage.",
      category: "communication",
      costMinutes: 1,
      preconditions: ["assess-scene-safety"],
    },
    {
      id: "interview-patient",
      label: "Interview the Injured Skier",
      description: "Ask the injured skier what happened and where it hurts.",
      category: "assessment",
      costMinutes: 2,
      reveals: {
        patient: {
          complaint: "Severe pain in the left leg, unable to bear weight",
        },
      },
    },
    {
      id: "interview-other-skier",
      label: "Check on the Other Skier (Drew)",
      description:
        "Quickly assess whether Drew needs care too, and get their account of the collision.",
      category: "assessment",
      costMinutes: 2,
      reveals: {
        actors: [
          {
            id: "actor-other-skier",
            name: "Drew",
            role: "Other Skier Involved in Collision",
            notes: "On their feet, visibly shaken, no obvious injury reported.",
            statement:
              "I never saw them coming around the bend; I think I clipped their skis. I'm okay, just rattled. Is the other guest going to be alright?",
          },
        ],
        patient: {
          mechanism:
            "Collided with another skier at the blind merge and fell awkwardly onto the left leg",
        },
      },
    },
    {
      id: "primary-assessment",
      label: "Conduct Primary Assessment (ABCs / LOC)",
      description:
        "Check airway, breathing, circulation, and level of consciousness on the injured skier.",
      category: "assessment",
      costMinutes: 3,
      preconditions: ["assess-scene-safety"],
      reveals: {
        patient: {
          levelOfConsciousness: "Alert & Oriented x4 (GCS 15)",
          findings: [
            "Airway patent",
            "Breathing rapid but unlabored at 20/min",
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
        heartRate: 92,
        respiration: 20,
        bpSystolic: 128,
        bpDiastolic: 84,
        spo2: 97,
        temperature: 98.6,
        gcs: 15,
        avpu: "A",
        pms: "intact",
      },
      reveals: {
        patient: {
          vitals: {
            heartRate: 92,
            respiration: 20,
            bpSystolic: 128,
            bpDiastolic: 84,
            spo2: 97,
            temperature: 98.6,
            gcs: 15,
            avpu: "A",
            pms: "intact",
          },
        },
      },
    },
    {
      id: "secondary-assessment",
      label: "Focused Leg Exam & PMS Check",
      description:
        "Expose the injury, inspect for deformity and swelling, and verify distal pulse, motor, and sensation.",
      category: "assessment",
      costMinutes: 4,
      preconditions: ["primary-assessment"],
      reveals: {
        patient: {
          findings: [
            "Deformity and swelling at the mid-shaft left tibia",
            "Distal pedal pulse present and strong",
          ],
        },
      },
    },
    {
      id: "splint-leg",
      label: "Splint the Leg & Re-verify PMS",
      description:
        "Immobilize the leg joint-to-joint and re-check distal pulse, motor, and sensation afterward.",
      category: "treatment",
      costMinutes: 6,
      requiredEquipment: ["sam-splint", "cravats"],
      preconditions: ["secondary-assessment"],
      requiresSceneSafety: true,
      reveals: {
        patient: {
          interventions: ["Left leg splinted"],
        },
      },
    },
    {
      id: "package-for-transport",
      label: "Package in Toboggan",
      description:
        "Transfer onto the litter, insulate against the cold, and secure for transport through the crowd.",
      category: "transport",
      costMinutes: 5,
      preconditions: ["splint-leg"],
      requiresSceneSafety: true,
      reveals: {
        patient: {
          interventions: ["Packaged in toboggan with hypothermia wrap"],
        },
      },
    },
  ],
  dialogueMoments: [
    {
      id: "delegate-to-morgan",
      speaker: "Morgan (Responding Patroller)",
      prompt:
        "I'm here: what do you want me to do, the crowd or the other skier?",
      context:
        "Morgan arrives just as the crowd presses in further and Drew is still standing off to the side, visibly shaken.",
      afterActionId: "assess-scene-safety",
      options: [
        {
          id: "delegate-directive-closed-loop",
          text: "Take the crowd: get them back past that blue trail marker, then come find me once it's clear.",
          style: "directive",
          clarity: "high",
          closesLoop: true,
          response:
            'Morgan repeats "back past the blue marker" and moves straight to the crowd, checking back in once it\'s cleared.',
          debriefNote:
            "Gave a specific, bounded task and asked Morgan to close the loop once it was done.",
        },
        {
          id: "delegate-collaborative",
          text: "Can you check on Drew and get their account while I stay on the patient? Flag me if anything about Drew looks off.",
          style: "collaborative",
          clarity: "moderate",
          closesLoop: false,
          response:
            "Morgan heads to Drew, checks them over, and starts gathering the collision account without further direction.",
          debriefNote:
            "Split the workload with a clear rationale, without asking for explicit confirmation of the handoff.",
        },
        {
          id: "delegate-deferential",
          text: "Whatever seems most urgent to you. Use your judgment.",
          style: "deferential",
          clarity: "low",
          closesLoop: false,
          response:
            "Morgan hesitates a beat, glancing between the crowd and Drew, before picking the crowd on their own.",
          debriefNote:
            "Handed Morgan the judgment call outright: workable with an experienced partner, but left a newer one guessing.",
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
      score: 20,
      feedback: "Uphill merge traffic warned before patient contact began.",
    },
    {
      id: "rule-crowd-management",
      title: "Crowd & Traffic Management",
      category: "operations",
      passed: true,
      score: 20,
      feedback: "Onlookers moved off the trail and sightlines restored.",
    },
    {
      id: "rule-delegation",
      title: "Delegation & Teamwork",
      category: "communication",
      passed: true,
      score: 20,
      feedback: "Responding partner given clear direction amid a busy scene.",
    },
    {
      id: "rule-pms-evaluation",
      title: "Neurovascular Assessment",
      category: "clinical",
      passed: true,
      score: 20,
      feedback:
        "Distal pulse, motor, and sensory function checked before and after splinting.",
    },
    {
      id: "rule-packaging",
      title: "Immobilization & Packaging",
      category: "clinical",
      passed: true,
      score: 20,
      feedback:
        "Leg immobilized and patient packaged despite scene distractions.",
    },
  ],
};
