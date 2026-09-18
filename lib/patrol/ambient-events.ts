import { createSeededRandom } from "../game-utils";
import type { AmbientEvent, ShiftState } from "./types";

/**
 * Catalog of authentic Midwest/Welch Village operational mini-events.
 *
 * Implements the "it's not just medicine" operational pillar from Epic #744:
 * patrollers actively manage the mountain, assist guests, communicate with lifts,
 * and mark or mitigate hazards.
 */
export const AMBIENT_EVENTS_CATALOG: readonly AmbientEvent[] = [
  {
    id: "guest-directions",
    title: "Guest Asking Directions at Summit",
    location: "Summit Patrol Shack",
    sector: "The Back Bowl / Belle Creek Quad",
    coordinates: { x: 390, y: 65 },
    prompt:
      "A family on intermediate skis stops near the Summit Patrol Shack looking hesitant. They ask which way down avoids steep drop-offs while Belle Creek Quad is loading.",
    context:
      "Summit staging area, cold wind from the north. Skis staged at shack rack.",
    options: [
      {
        id: "direct-long-way-home",
        label: "Direct to Long Way Home",
        description:
          "Point them toward the gentle West Slopes cat-track green circle.",
        consequenceText:
          "You direct the family west toward Long Way Home, explaining the gentle grade to the Main Chalet. They thank you and ski off safely.",
        category: "communication",
        timeIncrementMinutes: 2,
        emittedEvent: {
          action: "ambient_guest_directions_long_way_home",
          context: {
            trail: "Long Way Home",
            location: "Long Way Home",
            guestAssisted: true,
            label: "Assisted family to Long Way Home",
          },
        },
      },
      {
        id: "provide-trail-map",
        label: "Provide Pocket Trail Map & Briefing",
        description:
          "Hand over a printed Welch Village pocket map and mark the safe West Slopes routes.",
        consequenceText:
          "You review the map with the family, marking the connection via Skilink and highlighting beginner routes. They feel reassured.",
        category: "communication",
        timeIncrementMinutes: 3,
        emittedEvent: {
          action: "ambient_guest_directions_map",
          context: {
            trail: "Long Way Home",
            location: "Summit Patrol Shack",
            guestAssisted: true,
            label: "Provided pocket trail map to guests",
          },
        },
      },
      {
        id: "escort-to-catwalk",
        label: "Escort to West Slopes Catwalk",
        description:
          "Personally lead them past the steep fall line to the start of the green groomer.",
        consequenceText:
          "You ski with the family to the catwalk entrance, ensuring they bypass The Great Gorge headwall cleanly.",
        category: "decision",
        timeIncrementMinutes: 5,
        emittedEvent: {
          action: "ambient_guest_directions_escort",
          context: {
            trail: "Long Way Home",
            location: "Long Way Home",
            guestAssisted: true,
            label: "Escorted beginner guests to catwalk",
          },
        },
      },
    ],
  },
  {
    id: "rope-ducking",
    title: "Rope-Ducker on Harley's Hollow",
    location: "Harley's Hollow",
    sector: "East Slopes",
    coordinates: { x: 545, y: 270 },
    prompt:
      "While patrolling East Slopes, you spot a snowboarder ducking under the caution rope at the upper treeline of Harley's Hollow into unmarked brush.",
    context:
      "East Slopes mid-mountain ridge, variable snowpack and exposed stumps outside boundary.",
    options: [
      {
        id: "intercept-and-educate",
        label: "Intercept & Re-route to Open Trail",
        description:
          "Signal the rider with your whistle and calmly guide them back to the groomed run.",
        consequenceText:
          "You call out to the rider and guide them back to Harley's Hollow groomer, explaining early-season stump hazards and resort boundary policy.",
        category: "communication",
        timeIncrementMinutes: 4,
        emittedEvent: {
          action: "ambient_rope_ducker_intercepted",
          context: {
            trail: "Harley's Hollow",
            location: "Harley's Hollow",
            guestAssisted: true,
            label: "Intercepted out-of-bounds snowboarder",
          },
        },
      },
      {
        id: "reinforce-rope-line",
        label: "Re-set Bamboo Poles & Danger Tape",
        description:
          "Drive fresh bamboo poles and re-tie high-visibility ribbon to prevent others from following.",
        consequenceText:
          "You reset two fallen bamboo stakes and string fresh high-vis tape across the gully entrance, securing the boundary closure.",
        category: "assessment",
        timeIncrementMinutes: 6,
        emittedEvent: {
          action: "mark-hazard_boundary_tape",
          context: {
            trail: "Harley's Hollow",
            location: "Harley's Hollow",
            label: "Marked hazard boundary on Harley's Hollow",
          },
        },
      },
      {
        id: "radio-dispatch-alert",
        label: "Notify Dispatch & Monitor Line",
        description:
          "Transmit a rider description on CH 1 and verify they exit safely near Cannon-Valley Quad.",
        consequenceText:
          "You advise Base Dispatch of the boundary encounter. Lift operators at Cannon-Valley Quad confirm visual contact as the rider reaches the base.",
        category: "communication",
        timeIncrementMinutes: 3,
        emittedEvent: {
          action: "ambient_boundary_dispatch_alert",
          context: {
            trail: "Harley's Hollow",
            location: "Harley's Hollow",
            label: "Logged out-of-bounds warning with dispatch",
          },
        },
      },
    ],
  },
  {
    id: "trail-debris",
    title: "Fallen Birch Branch on Long Way Home",
    location: "Long Way Home",
    sector: "West Slopes",
    coordinates: { x: 130, y: 290 },
    prompt:
      "A fresh birch limb has snapped in high winds and lies across the center turn of Long Way Home green circle, partially hidden around a blind bend.",
    context:
      "West Slopes switchback, frequent beginner traffic descending to Main Chalet.",
    options: [
      {
        id: "remove-debris",
        label: "Drag Branch to Tree Line",
        description:
          "Physically haul the limb into the woods and kick snow over the scuffed icy gouge.",
        consequenceText:
          "You drag the heavy birch limb off the active trail corridor into the trees and smooth out the rutted surface.",
        category: "decision",
        timeIncrementMinutes: 5,
        closedTrailsDelta: { remove: ["Long Way Home"] },
        emittedEvent: {
          action: "ambient_debris_cleared",
          context: {
            trail: "Long Way Home",
            location: "Long Way Home",
            label: "Cleared fallen birch branch from trail",
          },
        },
      },
      {
        id: "cross-skis-and-mark",
        label: "Mark Hazard with Crossed Bamboo",
        description:
          "Plant crossed hazard bamboo poles uphill of the blind curve to slow approaching skiers while calling trail crew.",
        consequenceText:
          "You plant crossed bamboo stakes 30 yards uphill with orange flagging, safely diverting traffic around the obstacle.",
        category: "assessment",
        timeIncrementMinutes: 4,
        emittedEvent: {
          action: "mark-hazard_trail_debris",
          context: {
            trail: "Long Way Home",
            location: "Long Way Home",
            label: "Marked hazard on Long Way Home",
          },
        },
      },
      {
        id: "temporary-trail-closure",
        label: "Temporarily Close Trail Section",
        description:
          "String closure ribbon at the top intersection until trail crew can chainsaw the log.",
        consequenceText:
          "You close upper Long Way Home and reroute beginner skiers via Cedar Fork until maintenance finishes removal.",
        category: "decision",
        timeIncrementMinutes: 6,
        closedTrailsDelta: { add: ["Long Way Home"] },
        emittedEvent: {
          action: "ambient_trail_temporarily_closed",
          context: {
            trail: "Long Way Home",
            location: "Long Way Home",
            label: "Temporarily closed Long Way Home for debris removal",
          },
        },
      },
    ],
  },
  {
    id: "lift-stoppage",
    title: "Temporary Stop on Belle Creek Quad Tower 4",
    location: "Belle Creek Quad Tower 4",
    sector: "The Back Bowl",
    coordinates: { x: 445, y: 215 },
    prompt:
      "Belle Creek Quad stops abruptly on Tower 4 over The Great Gorge. Passengers are suspended 25 feet above the snow. No smoke or mechanical alarm is visible.",
    context: "Mid-mountain steep line, wind gusts 15 mph. Temperature 18°F.",
    options: [
      {
        id: "radio-lift-ops",
        label: "Radio Lift Maintenance on CH 1",
        description:
          "Check in with lift operators for status code and estimated restart time.",
        consequenceText:
          "Base Lift Ops confirms a misload at the bottom terminal. The safety gate was reset and the line restarts within two minutes.",
        category: "communication",
        timeIncrementMinutes: 3,
        emittedEvent: {
          action: "ambient_lift_status_radio_check",
          context: {
            trail: "Belle Creek Quad",
            location: "Belle Creek Quad Tower 4",
            label: "Communicated lift stop with maintenance",
          },
        },
      },
      {
        id: "reassure-passengers",
        label: "Voice Contact with Suspended Guests",
        description:
          "Ski under Tower 4, project voice to chair riders, and advise them to remain seated with bars down.",
        consequenceText:
          "You call up to the riders on chairs 18 and 19, reassuring them that patrol is below and the stoppage is brief. They give a thumbs up.",
        category: "communication",
        timeIncrementMinutes: 4,
        emittedEvent: {
          action: "ambient_lift_passengers_reassured",
          context: {
            trail: "Belle Creek Quad",
            location: "Belle Creek Quad Tower 4",
            guestAssisted: true,
            label: "Reassured suspended lift guests at Tower 4",
          },
        },
      },
      {
        id: "stage-evac-sled",
        label: "Stage Rescue Toboggan at Lift Base",
        description:
          "Pre-position a Cascade toboggan and backup rope kit at Belle Creek bottom terminal as a precaution.",
        consequenceText:
          "You stage the rescue toboggan at the Belle Creek terminal. The line resumes normal speed before any evacuation protocol is needed.",
        category: "decision",
        timeIncrementMinutes: 5,
        equipmentLocation: "Belle Creek Terminal",
        emittedEvent: {
          action: "ambient_evac_sled_staged",
          context: {
            trail: "Belle Creek Quad",
            location: "Belle Creek Quad Tower 4",
            label: "Staged rescue sled at Belle Creek Terminal",
          },
        },
      },
    ],
  },
  {
    id: "radio-status-check",
    title: "Base Dispatch Staging Check",
    location: "Base Aid Room",
    sector: "Base Area / CH 1",
    coordinates: { x: 360, y: 470 },
    prompt:
      "Base Dispatch calls: 'Patrol 1, Dispatch — verify current location, radio readability, and toboggan readiness for afternoon rush.'",
    context: "Welch Village dispatch desk, 154.570 MHz CH 1 repeater check.",
    options: [
      {
        id: "confirm-summit-station",
        label: "Transmit 10-4 & Confirm Summit Staging",
        description:
          "Confirm loud and clear, staging at Summit Patrol Shack with Cascade sled pre-rigged.",
        consequenceText:
          "You transmit: 'Patrol 1, 10-4. Reading you five by five. Staged at Summit Shack, sled rigged and ready.' Dispatch acknowledges 10-4.",
        category: "communication",
        timeIncrementMinutes: 2,
        equipmentLocation: "Summit Shack",
        emittedEvent: {
          action: "ambient_radio_check_summit",
          context: {
            trail: "Summit",
            location: "Summit Shack",
            label: "Confirmed radio readiness and Summit staging",
          },
        },
      },
      {
        id: "relocate-mid-mountain",
        label: "Reposition Sled to Mid-Mountain Cache",
        description:
          "Inform dispatch you are moving equipment to the Mid-Mountain Cache to cover East and West Slopes.",
        consequenceText:
          "You advise Dispatch of repositioning. You tow the rescue sled to the Mid-Mountain Cache, cutting response times across sectors.",
        category: "decision",
        timeIncrementMinutes: 6,
        equipmentLocation: "Mid-Mountain Cache",
        emittedEvent: {
          action: "ambient_equipment_relocated_mid_mountain",
          context: {
            trail: "Harley's Hollow",
            location: "Mid-Mountain Cache",
            label: "Repositioned rescue toboggan to Mid-Mountain Cache",
          },
        },
      },
      {
        id: "report-surface-conditions",
        label: "Report Snow & Surface Conditions",
        description:
          "Radio an operational surface report: firm groomed corduroy on West Slopes, wind-scoured ice on upper The Great Gorge.",
        consequenceText:
          "Dispatch logs your condition report and notifies groomers to touch up the ice patches before the evening shift.",
        category: "communication",
        timeIncrementMinutes: 3,
        emittedEvent: {
          action: "ambient_surface_report_transmitted",
          context: {
            trail: "The Great Gorge",
            location: "Base Aid Room",
            label: "Transmitted snow condition report to dispatch",
          },
        },
      },
    ],
  },
];

/**
 * Selects an ambient operational event deterministically using createSeededRandom.
 *
 * Filters out already resolved events in the current shift cycle so patrollers
 * experience variety across all encounters without immediate back-to-back repeats.
 *
 * @param state Current shift state containing resolved event history.
 * @param seed Optional numeric seed for deterministic PRNG selection.
 * @returns An AmbientEvent or null if the catalog is empty.
 */
export function selectAmbientEvent(
  state: ShiftState,
  seed?: number
): AmbientEvent | null {
  if (AMBIENT_EVENTS_CATALOG.length === 0) return null;

  const resolved = state.resolvedAmbientEvents ?? [];
  const catalogSize = AMBIENT_EVENTS_CATALOG.length;

  // Determine events resolved in the current cycle
  const currentCycleIndex = resolved.length % catalogSize;
  const currentCycleResolved =
    currentCycleIndex === 0 && resolved.length > 0
      ? []
      : resolved.slice(resolved.length - currentCycleIndex);

  const cycleSet = new Set(currentCycleResolved);
  let candidates = AMBIENT_EVENTS_CATALOG.filter((e) => !cycleSet.has(e.id));

  // If starting a new cycle after at least one full cycle, prevent immediate repeat of the last resolved
  if (currentCycleIndex === 0 && resolved.length > 0) {
    const lastResolved = resolved[resolved.length - 1];
    const withoutLast = candidates.filter((e) => e.id !== lastResolved);
    if (withoutLast.length > 0) {
      candidates = withoutLast;
    }
  }

  if (candidates.length === 0) {
    candidates = [...AMBIENT_EVENTS_CATALOG];
  }

  // Derive deterministic PRNG
  const effectiveSeed =
    seed !== undefined
      ? seed
      : (state.timeElapsedMinutes * 1000 +
          (state.incidentsCompleted + 1) * 101 +
          resolved.length * 13 +
          7) >>>
        0;

  const rng = createSeededRandom(effectiveSeed);
  const index = Math.floor(rng() * candidates.length);
  return candidates[index] ?? candidates[0] ?? null;
}
