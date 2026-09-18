import type { PatrolScenario } from "../types";

/**
 * Scenario B — MVP content package (Issue #752).
 *
 * Purpose: a patient who insists they're fine after a fall, with subtle
 * findings that don't fully add up. Reinforces reassessment over time,
 * admitting uncertainty rather than forcing a confident call either way,
 * and a resource-request decision (does this warrant an ALS meet at the
 * base?) framed as a communication-style choice, not a right/wrong answer.
 *
 * Notice: Educational simulation prototype, not clinical guidance.
 * // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
 */
export const AMBIGUOUS_PATIENT_SCENARIO: PatrolScenario = {
  id: "ambiguous-glade-fall",
  title: "Glade Fall — Ambiguous Presentation",
  subtitle: "Low-speed tumble; patient insists they're fine",
  description:
    "A skier took a low-speed tumble in the glades and got up on their own before anyone reached them. They say they're fine, but a nearby skier who saw it thought they seemed briefly dazed.",
  difficulty: "intermediate",
  category: "medical",
  estimatedMinutes: 18,
  location: "North Glades - Mid-Mountain",
  dispatchPrompt:
    "Patrol 6, Base Dispatch. Report of a skier down in the North Glades, reportedly up and walking. Guest reports may be minor — respond and assess.",
  environment: {
    // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
    weather: "Overcast, 24°F, flat light",
    snowConditions: "Packed powder with soft glade texture",
    temperatureFahrenheit: 24,
    visibility: "Reduced (flat light limits depth perception)",
    hazards: [
      "Flat light obscuring terrain contours",
      "Scattered trees limiting sightlines",
    ],
    sceneSafetyNotes:
      "Low traffic area, but flat light means uphill skiers may not see the scene until close.",
  },
  patient: {
    // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
    complaint:
      "Patient minimizes symptoms; denies pain, reports feeling 'a little off'",
    mechanism:
      "Low-speed tumble in the glades; uncertain whether the head contacted the snow",
    levelOfConsciousness:
      "Alert, but slow to answer some questions (GCS 15 on exam)",
    findings: [
      "No visible external trauma",
      "Answers are slightly delayed and occasionally repeated",
      "Mild nausea reported after standing up",
    ],
    interventions: ["Kept seated and monitored while findings were gathered"],
    vitals: {
      heartRate: 74,
      respiration: 14,
      bpSystolic: 116,
      bpDiastolic: 74,
      spo2: 98,
      temperature: 98.0,
      gcs: 15,
      avpu: "A",
      pms: "intact",
    },
  },
  actors: [
    {
      id: "actor-witness-jamie",
      name: "Jamie",
      role: "Bystander / Nearby Skier",
      notes: "Was several turns behind and saw the fall from a distance.",
      statement:
        "They went down pretty slow, nothing dramatic, but it took them a second longer than I'd expect to get back up. Might be nothing.",
    },
  ],
  initialVitals: {
    // PLACEHOLDER-CONTENT-REVIEW: needs OEC/NSP review, see #744
    heartRate: 74,
    respiration: 14,
    bpSystolic: 116,
    bpDiastolic: 74,
    spo2: 98,
    temperature: 98.0,
    gcs: 15,
    avpu: "A",
    pms: "intact",
  },
  actions: [
    {
      id: "assess-scene-safety",
      label: "Assess & Secure Scene Safety",
      description:
        "Position uphill in the flat light to give approaching skiers time to see the scene.",
      category: "assessment",
      costMinutes: 1,
      securesSceneSafety: true,
      reveals: {
        environment: {
          hazards: ["Uphill approach marked despite flat light"],
          sceneSafetyNotes: "Scene secured: uphill visibility addressed.",
        },
      },
    },
    {
      id: "interview-patient",
      label: "Interview the Patient",
      description:
        "Ask what happened and how they're feeling — listen for how they describe it, not just what they say.",
      category: "assessment",
      costMinutes: 2,
      reveals: {
        patient: {
          complaint:
            "Patient minimizes symptoms; denies pain, reports feeling 'a little off'",
        },
      },
    },
    {
      id: "interview-witness",
      label: "Interview Witness (Jamie)",
      description:
        "Ask Jamie what the fall looked like and how quickly the patient got back up.",
      category: "assessment",
      costMinutes: 2,
      reveals: {
        actors: [
          {
            id: "actor-witness-jamie",
            name: "Jamie",
            role: "Bystander / Nearby Skier",
            notes: "Was several turns behind and saw the fall from a distance.",
            statement:
              "They went down pretty slow, nothing dramatic, but it took them a second longer than I'd expect to get back up. Might be nothing.",
          },
        ],
        patient: {
          mechanism:
            "Low-speed tumble in the glades; uncertain whether the head contacted the snow",
        },
      },
    },
    {
      id: "primary-assessment",
      label: "Conduct Primary Assessment (ABCs / LOC)",
      description:
        "Check airway, breathing, circulation, and level of consciousness.",
      category: "assessment",
      costMinutes: 2,
      preconditions: ["assess-scene-safety"],
      reveals: {
        patient: {
          levelOfConsciousness:
            "Alert, but slow to answer some questions (GCS 15 on exam)",
          findings: ["Airway patent", "Breathing unlabored at 14/min"],
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
        heartRate: 74,
        respiration: 14,
        bpSystolic: 116,
        bpDiastolic: 74,
        spo2: 98,
        temperature: 98.0,
        gcs: 15,
        avpu: "A",
        pms: "intact",
      },
      reveals: {
        patient: {
          vitals: {
            heartRate: 74,
            respiration: 14,
            bpSystolic: 116,
            bpDiastolic: 74,
            spo2: 98,
            temperature: 98.0,
            gcs: 15,
            avpu: "A",
            pms: "intact",
          },
        },
      },
    },
    {
      id: "secondary-assessment",
      label: "Focused Neuro Check",
      description:
        "Look for external trauma and check orientation, memory of the fall, and response times.",
      category: "assessment",
      costMinutes: 3,
      preconditions: ["primary-assessment"],
      reveals: {
        patient: {
          findings: [
            "No visible external trauma",
            "Answers are slightly delayed and occasionally repeated",
          ],
        },
      },
    },
    {
      id: "reassess-patient-status",
      label: "Reassess After a Few Minutes",
      description:
        "Give it a few minutes, then repeat the questions to see whether the patient's answers have changed.",
      category: "assessment",
      costMinutes: 4,
      preconditions: ["secondary-assessment"],
      reveals: {
        patient: {
          findings: [
            "On re-check, still slightly slow to answer",
            "Mild nausea reported after standing up",
          ],
        },
      },
    },
    {
      id: "package-for-transport",
      label: "Package for Toboggan Transport",
      description:
        "Settle the patient into the toboggan with insulation for the ride down.",
      category: "transport",
      costMinutes: 4,
      preconditions: ["reassess-patient-status"],
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
      id: "escalate-to-dispatch",
      speaker: "Base Dispatch",
      prompt:
        "Patrol 6, radio check — what's your patient status, and are you requesting additional resources?",
      context:
        "The findings so far are subtle enough that it isn't obvious whether this needs anything beyond a routine transport.",
      afterActionId: "reassess-patient-status",
      options: [
        {
          id: "escalate-confident-no-request",
          text: "Patient's alert and oriented, vitals are stable — we'll self-transport, no additional resources needed.",
          style: "directive",
          clarity: "high",
          closesLoop: false,
          response: "Dispatch logs it and stands down — no ALS requested.",
          debriefNote:
            "Reported a clear, confident status and declined backup, without mentioning the delayed responses noted on re-check.",
        },
        {
          id: "escalate-candid-request",
          text: "Vitals are stable, but I'm seeing delayed responses on re-check and I'm not fully certain this isn't something more — can we get ALS to meet us at the base?",
          style: "candid",
          clarity: "high",
          closesLoop: true,
          response:
            "Dispatch acknowledges, repeats the ALS request back, and confirms a rig will meet the toboggan at the base.",
          debriefNote:
            "Named the uncertainty directly, described the specific finding driving it, and requested backup with a confirmed read-back.",
        },
        {
          id: "escalate-downplay",
          text: "Should be fine, just took a tumble — we'll bring them down and see how they're doing.",
          style: "deferential",
          clarity: "low",
          closesLoop: false,
          response:
            "Dispatch acknowledges, but has nothing concrete to prepare for at the base.",
          debriefNote:
            "Left the patient's status and any next steps unspecified, so base had nothing to act on either way.",
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
      feedback: "Uphill visibility addressed given flat-light conditions.",
    },
    {
      id: "rule-reassessment",
      title: "Ongoing Reassessment",
      category: "clinical",
      passed: true,
      score: 30,
      feedback:
        "Patient status was re-checked over time rather than accepted at first pass.",
    },
    {
      id: "rule-uncertainty-communication",
      title: "Uncertainty & Resource Communication",
      category: "communication",
      passed: true,
      score: 30,
      feedback:
        "Radio traffic to base reflected the actual confidence level in the assessment.",
    },
    {
      id: "rule-packaging",
      title: "Packaging & Transport Prep",
      category: "clinical",
      passed: true,
      score: 20,
      feedback:
        "Patient packaged for transport after reassessment was complete.",
    },
  ],
};
