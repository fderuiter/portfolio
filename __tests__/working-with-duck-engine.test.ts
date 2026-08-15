import { describe, it, expect } from "vitest";
import {
  createInitialDuckGameState,
  stepDuckGame,
  throwBall,
  applySqueakyToy,
  applyKongToy,
  giveTreat,
  scrubBelly,
  startDraggingDuck,
  dragDuckTo,
  releaseDuck,
  enterDogPark,
  throwParkBall,
  tapParkWhistle,
  exitDogPark,
  advanceToNextLevel,
  calculateGoodBoyMultiplier,
  SPRINTS,
  DUCK_FACTS,
  BACK_DOOR_BOUNDS,
} from "@/lib/working-with-duck-engine";

describe("Working With Duck - Deterministic Game Engine", () => {
  it("should initialize default state correctly for Campaign Level 1", () => {
    const state = createInitialDuckGameState(1, "campaign");
    expect(state.status).toBe("idle");
    expect(state.currentLevel).toBe(1);
    expect(state.mode).toBe("campaign");
    expect(state.workProgress).toBe(0);
    expect(state.targetWorkProgress).toBe(100);
    expect(state.excitement).toBe(15);
    expect(state.bladder).toBe(10);
    expect(state.naughtyVsGood).toBe(15);
    expect(state.duck.state).toBe("IDLE_ROAM");
    expect(state.hazards).toHaveLength(4);
    expect(state.unlockedFacts).toContain(1);
  });

  it("should advance work progress when Duck is calm and game is running", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";

    state = stepDuckGame(state);
    expect(state.ticks).toBe(1);
    expect(state.workProgress).toBeGreaterThan(0);
    expect(state.totalScore).toBeGreaterThan(0);
  });

  it("should calculate correct Good Boy multipliers across tug-of-war spectrum", () => {
    expect(calculateGoodBoyMultiplier(90)).toBe(2.5);
    expect(calculateGoodBoyMultiplier(60)).toBe(2.0);
    expect(calculateGoodBoyMultiplier(25)).toBe(1.5);
    expect(calculateGoodBoyMultiplier(5)).toBe(1.2);
    expect(calculateGoodBoyMultiplier(-20)).toBe(1.0);
    expect(calculateGoodBoyMultiplier(-60)).toBe(0.7);
  });

  it("should halt work progress during active puppy emergencies (Zoomies, Potty, Sneaky Chew)", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.duck.state = "ZOOMIES";

    const initialWork = state.workProgress;
    state = stepDuckGame(state);
    expect(state.workProgress).toBe(initialWork);
  });

  it("should trigger Zoomies when Excitement reaches 100%", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.excitement = 99.5;

    state = stepDuckGame(state);
    expect(state.duck.state).toBe("ZOOMIES");
    expect(state.soundCueQueue).toContain("bark");
  });

  it("should trigger urgent Potty Sniffing when Bladder reaches 100%", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.bladder = 99.5;

    state = stepDuckGame(state);
    expect(state.duck.state).toBe("SNIFFING_POTTY");
    expect(state.duck.sniffCountdown).toBeGreaterThan(0);
  });

  it("should successfully relieve Duck when dragged to the Back Door", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.bladder = 90;
    state.duck.state = "SNIFFING_POTTY";

    state = startDraggingDuck(state);
    expect(state.duck.state).toBe("DRAGGED");

    state = dragDuckTo(state, BACK_DOOR_BOUNDS.x + 20, BACK_DOOR_BOUNDS.y + 20);
    state = releaseDuck(state);

    expect(state.bladder).toBe(0);
    expect(state.naughtyVsGood).toBeGreaterThan(15);
    expect(state.duck.state).toBe("IDLE_ROAM");
  });

  it("should throw ball and redirect Duck to fetch ball", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";

    state = throwBall(state, 500, 300);
    expect(state.ball?.active).toBe(true);
    expect(state.duck.state).toBe("FETCHING_BALL");
  });

  it("should deploy Kong toy to settle Duck down and reduce excitement", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.excitement = 50;

    state = applyKongToy(state, 400, 250);
    expect(state.excitement).toBeLessThan(50);
    expect(state.duck.stateTimer).toBe(180);
  });

  it("should redirect Duck and save targeted hazard when using Squeaky Toy", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.duck.state = "SNEAKY_CHEW";
    state.activeHazardTarget = "resume";

    state = applySqueakyToy(state, 300, 200);
    expect(state.duck.state).toBe("IDLE_ROAM");
    expect(state.activeHazardTarget).toBeNull();
    expect(state.activeSkillToast?.badge).toBe("Resume Intact!");
    expect(state.naughtyVsGood).toBeGreaterThan(15);
  });

  it("should handle 'No Take, Only Throw' treat trading", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.duck.state = "NO_TAKE_THROW";
    state.duck.isCarryingBall = true;

    state = giveTreat(state);
    expect(state.duck.isCarryingBall).toBe(false);
    expect(state.duck.state).toBe("IDLE_ROAM");
    expect(state.totalScore).toBeGreaterThan(0);
  });

  it("should reward belly rubs during The Flop with floating hearts and reduced excitement", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.duck.state = "THE_FLOP";
    state.excitement = 50;

    state = scrubBelly(state, state.duck.x, state.duck.y);
    expect(state.bellyRubScrubCount).toBe(1);
    expect(state.excitement).toBeLessThan(50);
    expect(state.particles.some((p) => p.shape === "heart")).toBe(true);
  });

  it("should transition to Dog Park, throw ball, whistle recall, and return with Tired Puppy buff", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.excitement = 80;

    state = enterDogPark(state);
    expect(state.inDogPark).toBe(true);
    expect(state.parkState.status).toBe("aim");

    state = throwParkBall(state, 10, 0);
    expect(state.parkState.status).toBe("thrown");

    state = tapParkWhistle(state);
    expect(state.parkState.whistleTaps).toBe(1);

    // Complete park trip
    state = exitDogPark(state, true);
    expect(state.inDogPark).toBe(false);
    expect(state.excitement).toBe(0);
    expect(state.calmBuffTimer).toBe(1200);
  });

  it("should trigger Level Victory and transition to Nap Time upon completing target work", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.workProgress = state.targetWorkProgress - 0.01;

    state = stepDuckGame(state);
    expect(state.status).toBe("won");
    expect(state.duck.state).toBe("NAP_TIME");
    expect(state.latestUnlockedFact?.title).toBe(DUCK_FACTS[0].title);
  });

  it("should advance to Sprint 2 and 3 seamlessly", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state = advanceToNextLevel(state);
    expect(state.currentLevel).toBe(2);
    expect(state.targetWorkProgress).toBe(SPRINTS[1].targetWork);

    state = advanceToNextLevel(state);
    expect(state.currentLevel).toBe(3);
    expect(state.targetWorkProgress).toBe(SPRINTS[2].targetWork);
  });

  it("should include valid photoUrl and svgUrl for all 10 milestones in DUCK_FACTS", () => {
    expect(DUCK_FACTS).toHaveLength(10);
    DUCK_FACTS.forEach((fact) => {
      expect(fact.photoUrl).toMatch(/^\/duck\/duck-.*\.jpg$/);
      expect(fact.svgUrl).toMatch(/^\/duck\/duck-.*\.svg$/);
      expect(fact.title.length).toBeGreaterThan(0);
      expect(fact.fact.length).toBeGreaterThan(0);
      expect(fact.caption.length).toBeGreaterThan(0);
    });
  });

  it("should increase combo streak and reward extra points during rapid treat trades", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.duck.state = "NO_TAKE_THROW";

    state = giveTreat(state);
    expect(state.comboStreak).toBe(1);
    expect(state.totalScore).toBe(30);

    state.duck.state = "NO_TAKE_THROW";
    state = giveTreat(state);
    expect(state.comboStreak).toBe(2);
    expect(state.totalScore).toBe(30 + 60);
  });

  it("should decay combo streak when comboTimer expires", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.comboStreak = 3;
    state.comboTimer = 1;

    state = stepDuckGame(state);
    expect(state.comboTimer).toBe(0);
    expect(state.comboStreak).toBe(0);
  });

  it("should fail the game when naughtyVsGood drops below -90", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.naughtyVsGood = -95;

    state = stepDuckGame(state);
    expect(state.status).toBe("failed");
    expect(state.soundCueQueue).toContain("fail");
  });

  it("should initialize Endless Mode with boundless target work", () => {
    const state = createInitialDuckGameState(1, "endless");
    expect(state.mode).toBe("endless");
    expect(state.targetWorkProgress).toBe(999999);
  });

  it("should handle mud puddle collision during Dog Park retrieve sprint", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state = enterDogPark(state);
    state.parkState.status = "retrieving";
    // Place duck inside the first mud puddle
    state.parkState.duckX = state.parkState.puddles[0].x;
    state.parkState.duckY = state.parkState.puddles[0].y;

    state = stepDuckGame(state);
    expect(state.parkState.status).toBe("muddy");
    expect(state.soundCueQueue).toContain("fail");
  });

  it("should properly save all four portfolio hazards with correct skill toasts", () => {
    const hazardIds = ["resume", "server-cable", "clinical-db", "garmin-watch"] as const;
    hazardIds.forEach((id) => {
      let state = createInitialDuckGameState(1, "campaign");
      state.status = "running";
      state.duck.state = "SNEAKY_CHEW";
      state.activeHazardTarget = id;

      state = applySqueakyToy(state, 400, 200);
      expect(state.activeHazardTarget).toBeNull();
      expect(state.activeSkillToast).not.toBeNull();
      expect(state.activeSkillToast?.badge.length).toBeGreaterThan(0);
      expect(state.activeSkillToast?.text.length).toBeGreaterThan(0);
    });
  });

  it("should trigger surprise delivery knock or squirrel events over time", () => {
    let state = createInitialDuckGameState(1, "campaign");
    state.status = "running";
    state.duck.state = "IDLE_ROAM";
    state.ticks = 479; // next tick is 480

    state = stepDuckGame(state);
    expect(state.activeSurpriseEvent).not.toBeNull();
    expect(["amazon-delivery", "squirrel-window"]).toContain(state.activeSurpriseEvent?.type);
    expect(state.floatingAlerts.length).toBeGreaterThan(0);
  });
});
