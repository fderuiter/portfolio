/**
 * Working With Duck - Deterministic Game Engine & State Machine
 * Zero external framework dependencies. 60 FPS deterministic loop.
 */

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

export const MIN_DUCK_X = 40;
export const MAX_DUCK_X = CANVAS_WIDTH - 40;
export const MIN_DUCK_Y = 40;
export const MAX_DUCK_Y = CANVAS_HEIGHT - 40;

export const DESK_BOUNDS = { x: 80, y: 150, width: 170, height: 160 };
export const RUG_BOUNDS = { x: 320, y: 150, width: 230, height: 180 };
export const DOG_BED_BOUNDS = { x: 640, y: 70, width: 120, height: 100 };
export const BACK_DOOR_BOUNDS = { x: 690, y: 360, width: 90, height: 110 };

export type DuckBehaviorState =
  | "IDLE_ROAM"
  | "SNIFFING_POTTY"
  | "SNEAKY_CHEW"
  | "NO_TAKE_THROW"
  | "THE_FLOP"
  | "ZOOMIES"
  | "FETCHING_BALL"
  | "DRAGGED"
  | "NAP_TIME";

export type InventoryItem = "tennis-ball" | "kong" | "squeaky-toy" | "treat";

export type PortfolioHazardType = "resume" | "server-cable" | "clinical-db" | "garmin-watch";

export interface PortfolioHazard {
  id: PortfolioHazardType;
  name: string;
  x: number;
  y: number;
  radius: number;
  skillBadge: string;
  saveTooltip: string;
  isChewed: boolean;
}

export interface MudPuddle {
  x: number;
  y: number;
  radius: number;
}

export interface ParkBone {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface Squirrel {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  decay: number;
  size: number;
  shape: "heart" | "circle" | "sweat" | "star" | "spark" | "bone";
}

export interface FloatingAlert {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface DuckFact {
  id: number;
  level: number;
  title: string;
  fact: string;
  photoUrl: string;
  svgUrl: string;
  caption: string;
}

export interface GameSprint {
  level: number;
  title: string;
  subtitle: string;
  targetWork: number;
  impulseInterval: number; // ticks between impulses
  description: string;
}

export const DUCK_FACTS: DuckFact[] = [
  {
    id: 1,
    level: 1,
    title: "The Little Prince",
    fact: "Even as a young puppy, Duck sat upright with royal marshmallow posture, observing every line of code with quiet wisdom.",
    photoUrl: "/duck/duck-prince.jpg",
    svgUrl: "/duck/duck-prince.svg",
    caption: "Sitting so proper like a stuffed teddy bear against the green wall.",
  },
  {
    id: 2,
    level: 2,
    title: "The Pant Leg Bandit",
    fact: "Duck's favorite puppy sprint activity: gently anchoring Fred's pant leg and Crocs to prevent unauthorized departures from the desk.",
    photoUrl: "/duck/duck-pantleg.jpg",
    svgUrl: "/duck/duck-pantleg.svg",
    caption: "Soulful eyes while executing a gentle pant-leg hold.",
  },
  {
    id: 3,
    level: 3,
    title: "The Soulful Puppy Gaze",
    fact: "Duck's puppy eyes possess a 100% success rate in treat negotiations, peer code reviews, and extra dog park trips.",
    photoUrl: "/duck/duck-puppy-eyes.jpg",
    svgUrl: "/duck/duck-puppy-eyes.svg",
    caption: "Paws forward, dark button nose, and pure puppy innocence.",
  },
  {
    id: 4,
    level: 4,
    title: "Couch Zoomies Explorer",
    fact: "Duck conquered the striped couch mountain in record time, sporting his signature open-mouthed puppy grin.",
    photoUrl: "/duck/duck-couch.jpg",
    svgUrl: "/duck/duck-couch.svg",
    caption: "Full speed couch patrol with floppy golden cream ears.",
  },
  {
    id: 5,
    level: 5,
    title: "The Adidas Bucket Hat Hypebeast",
    fact: "Duck takes sun protection and street style seriously. The black bucket hat provides +10 charisma on sunny afternoon walks.",
    photoUrl: "/duck/duck-hat.jpg",
    svgUrl: "/duck/duck-hat.svg",
    caption: "Squinting happily in the sun with tongue lolling out.",
  },
  {
    id: 6,
    level: 6,
    title: "The Giant Marshmallow Armful",
    fact: "Duck is an English Cream Golden Retriever who still firmly believes he is a pocket-sized lap dog that can be carried everywhere.",
    photoUrl: "/duck/duck-carried.jpg",
    svgUrl: "/duck/duck-carried.svg",
    caption: "Fred holding Duck (and his oversized bear paws) during daily standup.",
  },
  {
    id: 7,
    level: 7,
    title: "The Post-Zoomies Bathtub Surrender",
    fact: "After an intense sprint of mud puddle splashing, Duck accepts his fate in the bathtub with maximum chin-resting resignation.",
    photoUrl: "/duck/duck-bath.jpg",
    svgUrl: "/duck/duck-bath.svg",
    caption: "Zero regrets. 100% clean coat after code review.",
  },
  {
    id: 8,
    level: 8,
    title: "Synchronized Grass Flop in the Dog Park",
    fact: "Duck's signature move: whenever an architecture debate gets too intense, he initiates an immediate full-body grass flop.",
    photoUrl: "/duck/duck-flop.jpg",
    svgUrl: "/duck/duck-flop.svg",
    caption: "Paws up, zero worries, and 100% test coverage.",
  },
  {
    id: 9,
    level: 9,
    title: "Chief Happiness Officer at Full Speed",
    fact: "Duck's zoomie speed has been clocked at 28 Mbps (Marshmallows per second). Merge conflicts simply bounce off him.",
    photoUrl: "/duck/duck-happy.jpg",
    svgUrl: "/duck/duck-happy.svg",
    caption: "Ears flapping in the breeze, celebrating a zero-downtime deploy.",
  },
  {
    id: 10,
    level: 10,
    title: "Executive Co-Pilot & Commute Specialist",
    fact: "Equipped with his official harness, Duck inspects all git branches before they merge into main.",
    photoUrl: "/duck/duck-car.jpg",
    svgUrl: "/duck/duck-car.svg",
    caption: "Always ready for the next engineering adventure.",
  },
];

export const SPRINTS: GameSprint[] = [
  {
    level: 1,
    title: "Sprint 1: Onboarding & Setup",
    subtitle: "Gentle puppy impulses · Learn the tools",
    targetWork: 100,
    impulseInterval: 280,
    description: "Keep Duck entertained with toys and watch the back door clock while getting your developer environment configured.",
  },
  {
    level: 2,
    title: "Sprint 2: Production Hotfix",
    subtitle: "Faster impulses · Sneaky cable chews & delivery knocks",
    targetWork: 150,
    impulseInterval: 220,
    description: "Production bug in flight! Watch out for the Amazon delivery knock and protect the API server cluster wire.",
  },
  {
    level: 3,
    title: "Sprint 3: Major Release Launch",
    subtitle: "High excitement · Window squirrels & rapid potty runs",
    targetWork: 220,
    impulseInterval: 170,
    description: "Launch day deadline! Zoomies are imminent. Take strategic dog park breaks to wear Duck out for the ultimate Nap Time.",
  },
];

export const INITIAL_HAZARDS: PortfolioHazard[] = [
  {
    id: "resume",
    name: "Fred's Resume Folder",
    x: 270,
    y: 85,
    radius: 24,
    skillBadge: "Resume Intact!",
    saveTooltip: "Fred has 8+ years building resilient distributed systems.",
    isChewed: false,
  },
  {
    id: "server-cable",
    name: "API Server Cluster Wire",
    x: 130,
    y: 380,
    radius: 26,
    skillBadge: "Zero Downtime!",
    saveTooltip: "Real-time Redis telemetry and fault-tolerant serverless APIs.",
    isChewed: false,
  },
  {
    id: "clinical-db",
    name: "21 CFR Part 11 Audit Script",
    x: 480,
    y: 85,
    radius: 24,
    skillBadge: "Audit Compliant!",
    saveTooltip: "Strict CDISC SDTM/ADaM compliance and tamper-proof electronic signatures.",
    isChewed: false,
  },
  {
    id: "garmin-watch",
    name: "32KB Garmin Watch Prototype",
    x: 530,
    y: 390,
    radius: 24,
    skillBadge: "Memory Protected!",
    saveTooltip: "High-performance Monkey C embedded systems with tight 32KB RAM budgets.",
    isChewed: false,
  },
];

export type SoundCue =
  | "tippy-tap"
  | "squeak"
  | "bark"
  | "belly-rub"
  | "whistle"
  | "snore"
  | "ding"
  | "fail"
  | "door-knock"
  | "squirrel-chirp"
  | "hiccup"
  | "combo-fanfare";

export interface WorkingWithDuckState {
  status: "idle" | "running" | "paused" | "failed" | "won";
  mode: "campaign" | "endless";
  currentLevel: number;
  workProgress: number;
  targetWorkProgress: number;
  excitement: number; // 0 to 100
  bladder: number; // 0 to 100
  naughtyVsGood: number; // -100 to +100
  multiplier: number; // 1.0 to 2.5
  ticks: number;
  totalScore: number;
  calmBuffTimer: number; // Ticks remaining for calm buff
  lastImpulseTick: number;
  bellyRubScrubCount: number;
  bellyRubProgress: number; // 0 to 100%

  comboStreak: number;
  comboTimer: number;
  activeSurpriseEvent: {
    type: "amazon-delivery" | "squirrel-window" | "puppy-hiccups";
    timer: number;
    maxTimer: number;
    resolved: boolean;
  } | null;

  duck: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    targetX: number;
    targetY: number;
    state: DuckBehaviorState;
    stateTimer: number;
    maxStateTimer: number;
    angle: number;
    isCarryingBall: boolean;
    circleAngle: number;
    sniffCountdown: number; // 0 to 210 (3.5 seconds at 60fps)
  };

  selectedItem: InventoryItem;
  ball: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
  } | null;

  hazards: PortfolioHazard[];
  activeHazardTarget: PortfolioHazardType | null;

  particles: Particle[];
  floatingAlerts: FloatingAlert[];
  nextParticleId: number;
  nextAlertId: number;

  inDogPark: boolean;
  parkState: {
    status: "aim" | "thrown" | "retrieving" | "success" | "muddy";
    ballX: number;
    ballY: number;
    ballVx: number;
    ballVy: number;
    duckX: number;
    duckY: number;
    duckVx: number;
    duckVy: number;
    duckAngle: number;
    puddles: MudPuddle[];
    bones: ParkBone[];
    bonesCollected: number;
    whistleTaps: number;
    timer: number;
  };

  unlockedFacts: number[];
  latestUnlockedFact: DuckFact | null;
  highScore: number;
  activeSkillToast: { badge: string; text: string; timer: number } | null;
  soundCueQueue: Array<SoundCue>;
  tutorialStep: number;
}

export function clampBounds(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(MIN_DUCK_X, Math.min(MAX_DUCK_X, x)),
    y: Math.max(MIN_DUCK_Y, Math.min(MAX_DUCK_Y, y)),
  };
}

export function createInitialDuckGameState(level = 1, mode: "campaign" | "endless" = "campaign"): WorkingWithDuckState {
  const sprint = SPRINTS.find((s) => s.level === level) || SPRINTS[0];
  return {
    status: "idle",
    mode,
    currentLevel: level,
    workProgress: 0,
    targetWorkProgress: mode === "endless" ? 999999 : sprint.targetWork,
    excitement: 15,
    bladder: 10,
    naughtyVsGood: 15,
    multiplier: 1.2,
    ticks: 0,
    totalScore: 0,
    calmBuffTimer: 0,
    lastImpulseTick: 0,
    bellyRubScrubCount: 0,
    bellyRubProgress: 0,
    comboStreak: 0,
    comboTimer: 0,
    activeSurpriseEvent: null,

    duck: {
      x: 430,
      y: 240,
      vx: 0,
      vy: 0,
      targetX: 430,
      targetY: 240,
      state: "IDLE_ROAM",
      stateTimer: 120,
      maxStateTimer: 120,
      angle: 0,
      isCarryingBall: false,
      circleAngle: 0,
      sniffCountdown: 0,
    },

    selectedItem: "tennis-ball",
    ball: null,

    hazards: INITIAL_HAZARDS.map((h) => ({ ...h })),
    activeHazardTarget: null,

    particles: [],
    floatingAlerts: [],
    nextParticleId: 1,
    nextAlertId: 1,

    inDogPark: false,
    parkState: {
      status: "aim",
      ballX: 100,
      ballY: 250,
      ballVx: 0,
      ballVy: 0,
      duckX: 80,
      duckY: 250,
      duckVx: 0,
      duckVy: 0,
      duckAngle: 0,
      puddles: [
        { x: 360, y: 160, radius: 36 },
        { x: 480, y: 320, radius: 40 },
        { x: 620, y: 190, radius: 34 },
      ],
      bones: [
        { id: 1, x: 280, y: 150, collected: false },
        { id: 2, x: 440, y: 240, collected: false },
        { id: 3, x: 580, y: 310, collected: false },
      ],
      bonesCollected: 0,
      whistleTaps: 0,
      timer: 0,
    },

    unlockedFacts: [1],
    latestUnlockedFact: null,
    highScore: 0,
    activeSkillToast: null,
    soundCueQueue: [],
    tutorialStep: level === 1 ? 1 : 0,
  };
}

/**
 * Calculate Good Boy multiplier from the tug-of-war scale
 */
export function calculateGoodBoyMultiplier(naughtyVsGood: number): number {
  if (naughtyVsGood >= 80) return 2.5;
  if (naughtyVsGood >= 50) return 2.0;
  if (naughtyVsGood >= 20) return 1.5;
  if (naughtyVsGood >= 0) return 1.2;
  if (naughtyVsGood >= -40) return 1.0;
  return 0.7; // Slow progress when very naughty
}

/**
 * Deterministic Game Step Loop (60 FPS)
 */
export function stepDuckGame(state: WorkingWithDuckState): WorkingWithDuckState {
  if (state.status !== "running") {
    return state;
  }

  const nextTicks = state.ticks + 1;
  const soundCues: Array<SoundCue> = [];

  // 1. If currently in the Dog Park mini-game, delegate to stepParkGame
  if (state.inDogPark) {
    return stepParkGame(state);
  }

  const sprint = SPRINTS.find((s) => s.level === state.currentLevel) || SPRINTS[0];
  const impulseRate = sprint.impulseInterval;

  // 2. Multipliers & Calm Buff
  const nextCalmBuff = Math.max(0, state.calmBuffTimer - 1);
  const baseMultiplier = calculateGoodBoyMultiplier(state.naughtyVsGood);
  const comboBonus = state.comboStreak >= 2 ? 0.3 * Math.min(3, state.comboStreak) : 0;
  const effectiveMultiplier = nextCalmBuff > 0 ? baseMultiplier + 0.5 + comboBonus : baseMultiplier + comboBonus;

  // 3. Work Progress Advance (Only when Duck is NOT causing an active emergency)
  const isEmergency =
    state.duck.state === "SNIFFING_POTTY" ||
    state.duck.state === "SNEAKY_CHEW" ||
    state.duck.state === "ZOOMIES";

  let nextWorkProgress = state.workProgress;
  let nextScore = state.totalScore;

  if (!isEmergency && state.duck.state !== "NAP_TIME") {
    const workIncrement = 0.08 * effectiveMultiplier;
    nextWorkProgress = Math.min(state.targetWorkProgress, state.workProgress + workIncrement);
    nextScore += Math.round(1 * effectiveMultiplier);
  }

  // Win condition check
  if (nextWorkProgress >= state.targetWorkProgress && state.duck.state !== "NAP_TIME") {
    return handleLevelVictory(state, soundCues);
  }

  // Fail condition check (Tug-of-war reaches extreme red)
  if (state.naughtyVsGood <= -90) {
    soundCues.push("fail");
    return {
      ...state,
      status: "failed",
      soundCueQueue: [...state.soundCueQueue, ...soundCues],
    };
  }

  // 4. Meters Natural Evolution (Paused or slowed during Calm Buff)
  const excitementRate = nextCalmBuff > 0 ? 0.02 : 0.08 + state.currentLevel * 0.02;
  const bladderRate = nextCalmBuff > 0 ? 0.02 : 0.05 + state.currentLevel * 0.015;

  let nextExcitement = Math.min(100, Math.max(0, state.excitement + excitementRate));
  let nextBladder = Math.min(100, Math.max(0, state.bladder + bladderRate));
  let nextNaughtyVsGood = state.naughtyVsGood;
  let activeToast = state.activeSkillToast ? { ...state.activeSkillToast, timer: state.activeSkillToast.timer - 1 } : null;
  if (activeToast && activeToast.timer <= 0) {
    activeToast = null;
  }

  // Combo timer evolution
  const nextComboTimer = Math.max(0, state.comboTimer - 1);
  const nextComboStreak = nextComboTimer > 0 ? state.comboStreak : 0;

  // Surprise event timer evolution
  let activeSurprise = state.activeSurpriseEvent ? { ...state.activeSurpriseEvent, timer: state.activeSurpriseEvent.timer - 1 } : null;
  if (activeSurprise && activeSurprise.timer <= 0) {
    activeSurprise = null;
  }

  // 5. Duck Physics & Autonomous AI
  const duck = { ...state.duck };
  let particles = [...state.particles];
  let alerts = [...state.floatingAlerts];
  let activeHazardTarget = state.activeHazardTarget;
  const hazards = state.hazards.map((h) => ({ ...h }));

  // Randomly trigger surprise event during calm roam
  if (!activeSurprise && nextTicks % 500 === 0 && duck.state === "IDLE_ROAM") {
    const roll = Math.random();
    if (roll < 0.5) {
      activeSurprise = { type: "amazon-delivery", timer: 300, maxTimer: 300, resolved: false };
      soundCues.push("door-knock");
      alerts.push({
        id: state.nextAlertId + 99,
        x: BACK_DOOR_BOUNDS.x,
        y: BACK_DOOR_BOUNDS.y + 20,
        text: "📦 Amazon Delivery Knock!",
        color: "#f59e0b",
        alpha: 1,
        vy: -1.2,
      });
    } else {
      activeSurprise = { type: "squirrel-window", timer: 300, maxTimer: 300, resolved: false };
      soundCues.push("squirrel-chirp");
      alerts.push({
        id: state.nextAlertId + 99,
        x: 400,
        y: 50,
        text: "🐿️ Squirrel at Window!",
        color: "#38bdf8",
        alpha: 1,
        vy: -1.2,
      });
    }
  }

  // Check 100% Excitement -> Trigger Zoomies
  if (nextExcitement >= 99 && duck.state !== "ZOOMIES" && duck.state !== "DRAGGED" && duck.state !== "NAP_TIME") {
    duck.state = "ZOOMIES";
    duck.stateTimer = 240; // 4 seconds of wild zoomies
    duck.maxStateTimer = 240;
    duck.vx = 6.5;
    duck.vy = 5.5;
    soundCues.push("bark");
    alerts.push({
      id: state.nextAlertId,
      x: duck.x,
      y: duck.y - 30,
      text: "⚡ ZOOMIES!!!",
      color: "#f59e0b",
      alpha: 1,
      vy: -1.2,
    });
  }

  // Check 100% Bladder -> Trigger Potty Sniff Countdown
  if (nextBladder >= 99 && duck.state !== "SNIFFING_POTTY" && duck.state !== "DRAGGED" && duck.state !== "NAP_TIME") {
    duck.state = "SNIFFING_POTTY";
    duck.sniffCountdown = 210; // 3.5 seconds at 60fps
    duck.circleAngle = 0;
    soundCues.push("bark");
    alerts.push({
      id: state.nextAlertId,
      x: duck.x,
      y: duck.y - 30,
      text: "🚽 Urgent Potty Sniffing!",
      color: "#ef4444",
      alpha: 1,
      vy: -1.5,
    });
  }

  // Behavior State Machine Logic
  switch (duck.state) {
    case "IDLE_ROAM": {
      duck.stateTimer -= 1;

      // Move toward target
      const dx = duck.targetX - duck.x;
      const dy = duck.targetY - duck.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        const speed = 1.6;
        duck.vx = (dx / dist) * speed;
        duck.vy = (dy / dist) * speed;
        duck.x += duck.vx;
        duck.y += duck.vy;
        duck.angle = Math.atan2(dy, dx);

        if (nextTicks % 22 === 0) {
          soundCues.push("tippy-tap");
        }
      } else {
        duck.vx = 0;
        duck.vy = 0;
      }

      // Pick new wander target when timer runs out
      if (duck.stateTimer <= 0) {
        duck.targetX = 220 + Math.random() * 360;
        duck.targetY = 120 + Math.random() * 240;
        duck.stateTimer = 100 + Math.floor(Math.random() * 120);
        duck.maxStateTimer = duck.stateTimer;
      }

      // Periodic random impulse generation
      if (nextTicks - state.lastImpulseTick > impulseRate) {
        const impulseChoice = Math.random();
        if (impulseChoice < 0.4) {
          // Sneaky chew event
          const randomHazard = hazards[Math.floor(Math.random() * hazards.length)];
          duck.state = "SNEAKY_CHEW";
          duck.targetX = randomHazard.x;
          duck.targetY = randomHazard.y;
          duck.stateTimer = 240; // 4 seconds to save
          duck.maxStateTimer = 240;
          activeHazardTarget = randomHazard.id;
          soundCues.push("bark");
          alerts.push({
            id: state.nextAlertId + 1,
            x: duck.x,
            y: duck.y - 25,
            text: `⚠️ Targeting ${randomHazard.name}!`,
            color: "#f97316",
            alpha: 1,
            vy: -1.2,
          });
        } else if (impulseChoice < 0.7) {
          // The Flop (Belly rubs invitation)
          duck.state = "THE_FLOP";
          duck.stateTimer = 360; // 6 seconds flop window
          duck.maxStateTimer = 360;
          duck.vx = 0;
          duck.vy = 0;
          alerts.push({
            id: state.nextAlertId + 2,
            x: duck.x,
            y: duck.y - 30,
            text: "❤️ Flopped! Scrub belly!",
            color: "#ec4899",
            alpha: 1,
            vy: -1.0,
          });
        }
      }
      break;
    }

    case "SNIFFING_POTTY": {
      duck.sniffCountdown -= 1;
      duck.circleAngle += 0.12;
      duck.x += Math.cos(duck.circleAngle) * 1.5;
      duck.y += Math.sin(duck.circleAngle) * 1.5;
      duck.angle = duck.circleAngle;

      if (duck.sniffCountdown <= 0) {
        // Accidental indoor puddle!
        nextNaughtyVsGood = Math.max(-100, nextNaughtyVsGood - 30);
        nextBladder = 0;
        duck.state = "IDLE_ROAM";
        duck.stateTimer = 90;
        duck.maxStateTimer = 90;
        soundCues.push("fail");
        alerts.push({
          id: state.nextAlertId + 3,
          x: duck.x,
          y: duck.y - 25,
          text: "💦 Pee on the rug! (-30 pts)",
          color: "#ef4444",
          alpha: 1,
          vy: -1.5,
        });
      }
      break;
    }

    case "SNEAKY_CHEW": {
      const targetHazard = hazards.find((h) => h.id === activeHazardTarget);
      if (targetHazard) {
        const dx = targetHazard.x - duck.x;
        const dy = targetHazard.y - duck.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 12) {
          duck.vx = (dx / dist) * 2.2;
          duck.vy = (dy / dist) * 2.2;
          duck.x += duck.vx;
          duck.y += duck.vy;
          duck.angle = Math.atan2(dy, dx);
        } else {
          // Reached item, start chewing!
          duck.stateTimer -= 1;
          if (duck.stateTimer <= 0) {
            // Chewed item
            targetHazard.isChewed = true;
            nextNaughtyVsGood = Math.max(-100, nextNaughtyVsGood - 25);
            duck.state = "IDLE_ROAM";
            duck.stateTimer = 90;
            duck.maxStateTimer = 90;
            activeHazardTarget = null;
            soundCues.push("fail");
            alerts.push({
              id: state.nextAlertId + 4,
              x: duck.x,
              y: duck.y - 25,
              text: `💥 Chewed ${targetHazard.name}! (-25 pts)`,
              color: "#ef4444",
              alpha: 1,
              vy: -1.5,
            });
          }
        }
      } else {
        duck.state = "IDLE_ROAM";
        duck.stateTimer = 90;
        duck.maxStateTimer = 90;
      }
      break;
    }

    case "THE_FLOP": {
      duck.stateTimer -= 1;
      duck.vx = 0;
      duck.vy = 0;

      // Emit gentle heart sparkles
      if (nextTicks % 30 === 0) {
        particles.push({
          id: state.nextParticleId + particles.length,
          x: duck.x + (Math.random() - 0.5) * 30,
          y: duck.y - 10 + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.8 - Math.random() * 0.6,
          alpha: 1,
          color: "#f472b6",
          decay: 0.02,
          size: 8,
          shape: "heart",
        });
      }

      if (duck.stateTimer <= 0) {
        duck.state = "IDLE_ROAM";
        duck.stateTimer = 90;
        duck.maxStateTimer = 90;
      }
      break;
    }

    case "NO_TAKE_THROW": {
      // Duck wiggles playfully with the ball
      duck.vx = Math.sin(nextTicks * 0.05) * 0.8;
      duck.vy = Math.cos(nextTicks * 0.05) * 0.8;
      duck.x += duck.vx;
      duck.y += duck.vy;
      duck.angle = Math.atan2(duck.vy, duck.vx);

      duck.stateTimer -= 1;
      // If not traded after timeout, Duck drops the ball near Fred's desk
      if (duck.stateTimer <= 0) {
        duck.isCarryingBall = false;
        duck.state = "IDLE_ROAM";
        duck.stateTimer = 90;
        duck.maxStateTimer = 90;
        alerts.push({
          id: state.nextAlertId + 7,
          x: duck.x,
          y: duck.y - 25,
          text: "🎾 Dropped ball near desk!",
          color: "#a3e635",
          alpha: 1,
          vy: -1.0,
        });
      }
      break;
    }

    case "ZOOMIES": {
      duck.stateTimer -= 1;
      duck.x += duck.vx;
      duck.y += duck.vy;

      // Hard-clamp wall bounce resolution: strictly push inwards and set sign
      if (duck.x <= 50) {
        duck.x = 50;
        duck.vx = Math.abs(duck.vx);
        soundCues.push("bark");
      } else if (duck.x >= CANVAS_WIDTH - 50) {
        duck.x = CANVAS_WIDTH - 50;
        duck.vx = -Math.abs(duck.vx);
        soundCues.push("bark");
      }

      if (duck.y <= 50) {
        duck.y = 50;
        duck.vy = Math.abs(duck.vy);
        soundCues.push("bark");
      } else if (duck.y >= CANVAS_HEIGHT - 50) {
        duck.y = CANVAS_HEIGHT - 50;
        duck.vy = -Math.abs(duck.vy);
        soundCues.push("bark");
      }

      duck.angle = Math.atan2(duck.vy, duck.vx);

      // Zoomie smoke/spark particles
      particles.push({
        id: state.nextParticleId + particles.length,
        x: duck.x,
        y: duck.y,
        vx: -duck.vx * 0.2,
        vy: -duck.vy * 0.2,
        alpha: 0.8,
        color: "#fef08a",
        decay: 0.05,
        size: 6,
        shape: "circle",
      });

      if (duck.stateTimer <= 0) {
        duck.state = "IDLE_ROAM";
        duck.stateTimer = 100;
        duck.maxStateTimer = 100;
        nextExcitement = 50; // Zoomies exhausted some energy
      }
      break;
    }

    case "FETCHING_BALL": {
      if (state.ball && state.ball.active) {
        const dx = state.ball.x - duck.x;
        const dy = state.ball.y - duck.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 14) {
          const speed = 5.2;
          duck.vx = (dx / dist) * speed;
          duck.vy = (dy / dist) * speed;
          duck.x += duck.vx;
          duck.y += duck.vy;
          duck.angle = Math.atan2(dy, dx);
        } else {
          // Caught ball! Transition to "No Take, Only Throw"
          duck.isCarryingBall = true;
          duck.state = "NO_TAKE_THROW";
          duck.stateTimer = 480; // 8 seconds to trade
          duck.maxStateTimer = 480;
          nextExcitement = Math.max(0, nextExcitement - 25);
          nextNaughtyVsGood = Math.min(100, nextNaughtyVsGood + 15);
          soundCues.push("bark");
          alerts.push({
            id: state.nextAlertId + 5,
            x: duck.x,
            y: duck.y - 25,
            text: "🎾 Caught ball! (Click Duck to trade treat)",
            color: "#38bdf8",
            alpha: 1,
            vy: -1.2,
          });
        }
      } else {
        duck.state = "IDLE_ROAM";
        duck.stateTimer = 90;
        duck.maxStateTimer = 90;
      }
      break;
    }

    case "DRAGGED": {
      // Position is clamped during dragDuckTo
      break;
    }

    case "NAP_TIME": {
      duck.x = DOG_BED_BOUNDS.x + DOG_BED_BOUNDS.width / 2;
      duck.y = DOG_BED_BOUNDS.y + DOG_BED_BOUNDS.height / 2;
      duck.vx = 0;
      duck.vy = 0;
      if (nextTicks % 60 === 0) {
        soundCues.push("snore");
        particles.push({
          id: state.nextParticleId + particles.length,
          x: duck.x - 20,
          y: duck.y - 15,
          vx: -0.3,
          vy: -0.7,
          alpha: 1,
          color: "#c084fc",
          decay: 0.015,
          size: 10,
          shape: "star",
        });
      }
      break;
    }
  }

  // Universal Hard Boundary Clamping for Duck in Office
  const clamped = clampBounds(duck.x, duck.y);
  duck.x = clamped.x;
  duck.y = clamped.y;

  // 6. Update Particles & Alerts
  particles = particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      alpha: p.alpha - p.decay,
    }))
    .filter((p) => p.alpha > 0.02);

  alerts = alerts
    .map((a) => ({
      ...a,
      y: a.y + a.vy,
      alpha: a.alpha - 0.018,
    }))
    .filter((a) => a.alpha > 0.05);

  return {
    ...state,
    ticks: nextTicks,
    workProgress: nextWorkProgress,
    totalScore: nextScore,
    excitement: nextExcitement,
    bladder: nextBladder,
    naughtyVsGood: nextNaughtyVsGood,
    multiplier: effectiveMultiplier,
    calmBuffTimer: nextCalmBuff,
    comboStreak: nextComboStreak,
    comboTimer: nextComboTimer,
    activeSurpriseEvent: activeSurprise,
    duck,
    hazards,
    activeHazardTarget,
    particles,
    floatingAlerts: alerts,
    activeSkillToast: activeToast,
    nextParticleId: state.nextParticleId + particles.length + 1,
    nextAlertId: state.nextAlertId + alerts.length + 1,
    soundCueQueue: [...state.soundCueQueue, ...soundCues],
  };
}

/**
 * Handle Level Victory & Transition to Nap Time
 */
function handleLevelVictory(
  state: WorkingWithDuckState,
  soundCues: Array<SoundCue>
): WorkingWithDuckState {
  const currentFact = DUCK_FACTS.find((f) => f.level === state.currentLevel) || DUCK_FACTS[0];
  const unlocked = Array.from(new Set([...state.unlockedFacts, state.currentLevel]));
  soundCues.push("ding");
  soundCues.push("snore");

  return {
    ...state,
    status: "won",
    workProgress: state.targetWorkProgress,
    excitement: 0,
    naughtyVsGood: Math.min(100, state.naughtyVsGood + 40),
    totalScore: state.totalScore + 250,
    highScore: Math.max(state.highScore, state.totalScore + 250),
    unlockedFacts: unlocked,
    latestUnlockedFact: currentFact,
    duck: {
      ...state.duck,
      state: "NAP_TIME",
      x: DOG_BED_BOUNDS.x + DOG_BED_BOUNDS.width / 2,
      y: DOG_BED_BOUNDS.y + DOG_BED_BOUNDS.height / 2,
      vx: 0,
      vy: 0,
    },
    soundCueQueue: [...state.soundCueQueue, ...soundCues],
  };
}

/**
 * Player Action: Throw Tennis Ball (Drains Excitement)
 */
export function throwBall(state: WorkingWithDuckState, targetX: number, targetY: number): WorkingWithDuckState {
  if (state.duck.state === "NAP_TIME" || state.inDogPark) return state;

  const clampedTarget = clampBounds(targetX, targetY);

  return {
    ...state,
    ball: {
      x: clampedTarget.x,
      y: clampedTarget.y,
      vx: 0,
      vy: 0,
      active: true,
    },
    duck: {
      ...state.duck,
      state: "FETCHING_BALL",
      targetX: clampedTarget.x,
      targetY: clampedTarget.y,
    },
    soundCueQueue: [...state.soundCueQueue, "squeak"],
  };
}

/**
 * Player Action: Use Squeaky Toy to Recall and Redirect Duck (Instant Attention)
 */
export function applySqueakyToy(state: WorkingWithDuckState, x: number, y: number): WorkingWithDuckState {
  let nextNaughtyVsGood = state.naughtyVsGood;
  let activeToast = state.activeSkillToast;
  let activeHazard = state.activeHazardTarget;
  let comboStreak = state.comboStreak;
  let nextScore = state.totalScore;
  const soundCues: Array<SoundCue> = ["squeak"];
  const clamped = clampBounds(x, y);

  // If Duck was targeting a portfolio hazard, redirect and save the item!
  if (state.duck.state === "SNEAKY_CHEW" && activeHazard) {
    const savedHazard = state.hazards.find((h) => h.id === activeHazard);
    if (savedHazard) {
      savedHazard.isChewed = false;
      nextNaughtyVsGood = Math.min(100, nextNaughtyVsGood + 30);
      comboStreak += 1;
      nextScore += 50 * comboStreak;
      if (comboStreak >= 3) {
        soundCues.push("combo-fanfare");
      }
      activeToast = {
        badge: savedHazard.skillBadge,
        text: savedHazard.saveTooltip,
        timer: 180,
      };
    }
    activeHazard = null;
  }

  return {
    ...state,
    totalScore: nextScore,
    comboStreak,
    comboTimer: 180,
    excitement: Math.max(0, state.excitement - 15),
    naughtyVsGood: nextNaughtyVsGood,
    activeHazardTarget: activeHazard,
    activeSkillToast: activeToast,
    duck: {
      ...state.duck,
      state: "IDLE_ROAM",
      targetX: clamped.x,
      targetY: clamped.y,
      stateTimer: 120,
      maxStateTimer: 120,
    },
    soundCueQueue: [...state.soundCueQueue, ...soundCues],
  };
}

/**
 * Player Action: Use Kong Chew Toy (Distracts from Hazards & Calms)
 */
export function applyKongToy(state: WorkingWithDuckState, x: number, y: number): WorkingWithDuckState {
  const clamped = clampBounds(x, y);
  let activeHazard = state.activeHazardTarget;
  let activeToast = state.activeSkillToast;
  let nextScore = state.totalScore;
  let nextNaughty = Math.min(100, state.naughtyVsGood + 20);

  if (state.duck.state === "SNEAKY_CHEW" && activeHazard) {
    const savedHazard = state.hazards.find((h) => h.id === activeHazard);
    if (savedHazard) {
      savedHazard.isChewed = false;
      nextNaughty = Math.min(100, nextNaughty + 25);
      nextScore += 60;
      activeToast = {
        badge: savedHazard.skillBadge,
        text: savedHazard.saveTooltip,
        timer: 180,
      };
    }
    activeHazard = null;
  }

  return {
    ...state,
    totalScore: nextScore,
    excitement: Math.max(0, state.excitement - 25),
    naughtyVsGood: nextNaughty,
    comboTimer: 180,
    activeHazardTarget: activeHazard,
    activeSkillToast: activeToast,
    duck: {
      ...state.duck,
      state: "IDLE_ROAM",
      targetX: clamped.x,
      targetY: clamped.y,
      stateTimer: 200, // Settles down chewing Kong for longer
      maxStateTimer: 200,
    },
    soundCueQueue: [...state.soundCueQueue, "ding"],
  };
}

/**
 * Player Action: Trade Treat for Ball ("No Take, Only Throw") or Direct Treat Reward
 */
export function giveTreat(state: WorkingWithDuckState): WorkingWithDuckState {
  if (state.duck.state === "NO_TAKE_THROW") {
    const comboStreak = state.comboStreak + 1;
    const soundCues: Array<SoundCue> = ["ding"];
    if (comboStreak >= 3) {
      soundCues.push("combo-fanfare");
    }

    return {
      ...state,
      comboStreak,
      comboTimer: 180,
      naughtyVsGood: Math.min(100, state.naughtyVsGood + 25),
      excitement: Math.max(0, state.excitement - 10),
      totalScore: state.totalScore + 35 * comboStreak,
      duck: {
        ...state.duck,
        isCarryingBall: false,
        state: "IDLE_ROAM",
        stateTimer: 90,
        maxStateTimer: 90,
      },
      floatingAlerts: [
        ...state.floatingAlerts,
        {
          id: state.nextAlertId,
          x: state.duck.x,
          y: state.duck.y - 25,
          text: `🍖 Ball Traded! (${comboStreak > 1 ? comboStreak + "× Combo! " : ""}+${35 * comboStreak} pts)`,
          color: "#22c55e",
          alpha: 1,
          vy: -1.2,
        },
      ],
      soundCueQueue: [...state.soundCueQueue, ...soundCues],
    };
  }

  // Regular treat gives gentle excitement drop & Good Boy points
  return {
    ...state,
    excitement: Math.max(0, state.excitement - 8),
    naughtyVsGood: Math.min(100, state.naughtyVsGood + 10),
    soundCueQueue: [...state.soundCueQueue, "ding"],
  };
}

/**
 * Player Action: Scrub Cursor over Duck during The Flop (Belly Rubs)
 */
export function scrubBelly(state: WorkingWithDuckState, x: number, y: number): WorkingWithDuckState {
  if (state.duck.state !== "THE_FLOP") return state;

  const dx = x - state.duck.x;
  const dy = y - state.duck.y;
  if (Math.hypot(dx, dy) > 50) return state;

  const nextScrubCount = state.bellyRubScrubCount + 1;
  const nextProgress = Math.min(100, state.bellyRubProgress + 8);
  const newParticles = [...state.particles];
  const soundCues: Array<SoundCue> = [];

  if (nextScrubCount % 5 === 0) {
    soundCues.push("belly-rub");
  }

  newParticles.push({
    id: state.nextParticleId + nextScrubCount,
    x: state.duck.x + (Math.random() - 0.5) * 30,
    y: state.duck.y + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 1.2,
    vy: -1.4 - Math.random() * 0.8,
    alpha: 1,
    color: "#ec4899",
    decay: 0.025,
    size: 10,
    shape: "heart",
  });

  // Check if Belly Rub complete (100%)
  if (nextProgress >= 100) {
    soundCues.push("combo-fanfare");
    return {
      ...state,
      bellyRubScrubCount: 0,
      bellyRubProgress: 0,
      excitement: 0,
      naughtyVsGood: Math.min(100, state.naughtyVsGood + 30),
      totalScore: state.totalScore + 100,
      calmBuffTimer: 600, // 10 seconds of pure calm buff
      duck: {
        ...state.duck,
        state: "IDLE_ROAM",
        stateTimer: 120,
        maxStateTimer: 120,
      },
      floatingAlerts: [
        ...state.floatingAlerts,
        {
          id: state.nextAlertId,
          x: state.duck.x,
          y: state.duck.y - 30,
          text: "💖 Belly Rub Complete! (+100 pts & Calm Buff)",
          color: "#ec4899",
          alpha: 1,
          vy: -1.5,
        },
      ],
      particles: newParticles,
      soundCueQueue: [...state.soundCueQueue, ...soundCues],
    };
  }

  const nextExcitement = Math.max(0, state.excitement - 2.5);
  const nextNaughtyVsGood = Math.min(100, state.naughtyVsGood + 1.2);

  return {
    ...state,
    bellyRubScrubCount: nextScrubCount,
    bellyRubProgress: nextProgress,
    excitement: nextExcitement,
    naughtyVsGood: nextNaughtyVsGood,
    particles: newParticles,
    soundCueQueue: [...state.soundCueQueue, ...soundCues],
  };
}

/**
 * Player Action: Start dragging Duck
 */
export function startDraggingDuck(state: WorkingWithDuckState): WorkingWithDuckState {
  if (state.duck.state === "NAP_TIME") return state;
  return {
    ...state,
    duck: {
      ...state.duck,
      state: "DRAGGED",
    },
  };
}

/**
 * Player Action: Drag Duck position
 */
export function dragDuckTo(state: WorkingWithDuckState, x: number, y: number): WorkingWithDuckState {
  const clamped = clampBounds(x, y);
  return {
    ...state,
    duck: {
      ...state.duck,
      x: clamped.x,
      y: clamped.y,
      angle: 0,
    },
  };
}

/**
 * Player Action: Release Duck
 */
export function releaseDuck(state: WorkingWithDuckState): WorkingWithDuckState {
  if (state.duck.state !== "DRAGGED") return state;

  // If dropped at back door
  if (
    state.duck.x >= BACK_DOOR_BOUNDS.x &&
    state.duck.x <= BACK_DOOR_BOUNDS.x + BACK_DOOR_BOUNDS.width &&
    state.duck.y >= BACK_DOOR_BOUNDS.y &&
    state.duck.y <= BACK_DOOR_BOUNDS.y + BACK_DOOR_BOUNDS.height
  ) {
    return {
      ...state,
      bladder: 0,
      naughtyVsGood: Math.min(100, state.naughtyVsGood + 35),
      totalScore: state.totalScore + 75,
      duck: {
        ...state.duck,
        state: "IDLE_ROAM",
        x: 480,
        y: 300,
        targetX: 430,
        targetY: 240,
        stateTimer: 120,
        maxStateTimer: 120,
      },
      floatingAlerts: [
        ...state.floatingAlerts,
        {
          id: state.nextAlertId,
          x: BACK_DOOR_BOUNDS.x,
          y: BACK_DOOR_BOUNDS.y - 10,
          text: "🌟 Good Boy! Potty Outside! (+75 pts)",
          color: "#22c55e",
          alpha: 1,
          vy: -1.5,
        },
      ],
      soundCueQueue: [...state.soundCueQueue, "ding"],
    };
  }

  return {
    ...state,
    duck: {
      ...state.duck,
      state: "IDLE_ROAM",
      targetX: state.duck.x,
      targetY: state.duck.y,
      stateTimer: 90,
      maxStateTimer: 90,
    },
  };
}

/**
 * Dog Park Mini-Game Transitions & Logic
 */
export function enterDogPark(state: WorkingWithDuckState): WorkingWithDuckState {
  return {
    ...state,
    inDogPark: true,
    parkState: {
      status: "aim",
      ballX: 120,
      ballY: 250,
      ballVx: 0,
      ballVy: 0,
      duckX: 90,
      duckY: 250,
      duckVx: 0,
      duckVy: 0,
      duckAngle: 0,
      puddles: [
        { x: 360, y: 160, radius: 36 },
        { x: 480, y: 320, radius: 40 },
        { x: 620, y: 190, radius: 34 },
      ],
      bones: [
        { id: 1, x: 280, y: 150, collected: false },
        { id: 2, x: 440, y: 240, collected: false },
        { id: 3, x: 580, y: 310, collected: false },
      ],
      bonesCollected: 0,
      whistleTaps: 0,
      timer: 0,
    },
    soundCueQueue: [...state.soundCueQueue, "whistle"],
  };
}

export function throwParkBall(state: WorkingWithDuckState, powerX: number, powerY: number): WorkingWithDuckState {
  if (!state.inDogPark || state.parkState.status !== "aim") return state;

  return {
    ...state,
    parkState: {
      ...state.parkState,
      status: "thrown",
      ballX: 120,
      ballY: 250,
      ballVx: Math.min(14, Math.max(7, powerX)),
      ballVy: Math.max(-6, Math.min(6, powerY)),
    },
    soundCueQueue: [...state.soundCueQueue, "squeak"],
  };
}

export function steerParkDuck(state: WorkingWithDuckState, targetY: number): WorkingWithDuckState {
  if (!state.inDogPark || state.parkState.status !== "retrieving") return state;

  const clampedY = Math.max(50, Math.min(CANVAS_HEIGHT - 50, targetY));
  return {
    ...state,
    parkState: {
      ...state.parkState,
      duckY: clampedY,
    },
  };
}

export function tapParkWhistle(state: WorkingWithDuckState): WorkingWithDuckState {
  if (!state.inDogPark) return state;

  const park = state.parkState;
  const newY = Math.max(60, park.duckY - 35);

  return {
    ...state,
    parkState: {
      ...park,
      whistleTaps: park.whistleTaps + 1,
      duckY: newY,
    },
    soundCueQueue: [...state.soundCueQueue, "whistle"],
  };
}

export function stepParkGame(state: WorkingWithDuckState): WorkingWithDuckState {
  const park = { ...state.parkState };
  const soundCues: Array<SoundCue> = [];
  let nextScore = state.totalScore;
  let bonesCollected = park.bonesCollected;
  const bones = park.bones.map((b) => ({ ...b }));

  if (park.status === "thrown") {
    // Ball flying through the air
    park.ballX += park.ballVx;
    park.ballY += park.ballVy;
    park.ballVx *= 0.98;
    park.ballVy *= 0.98;

    // Ball bounds clamp in park
    park.ballX = Math.max(60, Math.min(CANVAS_WIDTH - 60, park.ballX));
    park.ballY = Math.max(60, Math.min(CANVAS_HEIGHT - 60, park.ballY));

    // Duck sprinting after the ball
    const dx = park.ballX - park.duckX;
    const dy = park.ballY - park.duckY;
    const dist = Math.hypot(dx, dy);

    if (dist > 15) {
      park.duckX += (dx / dist) * 7.5;
      park.duckY += (dy / dist) * 7.5;
      park.duckAngle = Math.atan2(dy, dx);
    } else {
      // Reached ball! Now retrieve back
      park.status = "retrieving";
      soundCues.push("bark");
    }
  } else if (park.status === "retrieving") {
    // Duck running back to player at (90, 250)
    const targetX = 90;
    const targetY = 250;
    const dx = targetX - park.duckX;
    const dy = targetY - park.duckY;
    const dist = Math.hypot(dx, dy);

    if (dist > 15) {
      park.duckX += (dx / dist) * 4.8;
      park.duckY += (dy / dist) * 2.4; // Soft pull toward center, allowing player steering
      park.duckAngle = Math.atan2(dy, dx);

      // Check bone collections
      for (const bone of bones) {
        if (!bone.collected) {
          const bDist = Math.hypot(park.duckX - bone.x, park.duckY - bone.y);
          if (bDist < 30) {
            bone.collected = true;
            bonesCollected += 1;
            nextScore += 50;
            soundCues.push("ding");
          }
        }
      }

      // Check mud puddle collisions
      for (const puddle of park.puddles) {
        const pDist = Math.hypot(park.duckX - puddle.x, park.duckY - puddle.y);
        if (pDist < puddle.radius + 12) {
          park.status = "muddy";
          soundCues.push("fail");
          break;
        }
      }
    } else {
      // Successfully fetched back!
      park.status = "success";
      soundCues.push("combo-fanfare");
    }
  }

  // Clamp duck coordinates in park
  park.duckX = Math.max(50, Math.min(CANVAS_WIDTH - 50, park.duckX));
  park.duckY = Math.max(50, Math.min(CANVAS_HEIGHT - 50, park.duckY));

  return {
    ...state,
    totalScore: nextScore,
    parkState: {
      ...park,
      bones,
      bonesCollected,
    },
    soundCueQueue: [...state.soundCueQueue, ...soundCues],
  };
}

export function exitDogPark(state: WorkingWithDuckState, isSuccess: boolean): WorkingWithDuckState {
  const nextExcitement = 0;
  const nextBladder = 0;
  const bonusFromBones = state.parkState.bonesCollected * 10;
  const nextNaughtyVsGood = isSuccess ? Math.min(100, state.naughtyVsGood + 30 + bonusFromBones) : state.naughtyVsGood;
  const calmTimer = isSuccess ? 1800 : 600; // 30s calm buff for success, 10s for muddy

  return {
    ...state,
    inDogPark: false,
    excitement: nextExcitement,
    bladder: nextBladder,
    naughtyVsGood: nextNaughtyVsGood,
    calmBuffTimer: calmTimer,
    duck: {
      ...state.duck,
      x: 430,
      y: 240,
      state: "IDLE_ROAM",
      stateTimer: 120,
      maxStateTimer: 120,
    },
    floatingAlerts: [
      ...state.floatingAlerts,
      {
        id: state.nextAlertId,
        x: 400,
        y: 200,
        text: isSuccess
          ? `🌲 Park Trip Success! (Tired Puppy Buff 30s +${state.parkState.bonesCollected} Bones)`
          : "🐾 Returned from park (Cleaned up)",
        color: isSuccess ? "#22c55e" : "#f59e0b",
        alpha: 1,
        vy: -1.2,
      },
    ],
  };
}

export function advanceToNextLevel(state: WorkingWithDuckState): WorkingWithDuckState {
  const nextLevel = state.currentLevel + 1;
  const isComplete = nextLevel > SPRINTS.length;
  if (isComplete) {
    return createInitialDuckGameState(3, "endless");
  }
  return createInitialDuckGameState(nextLevel, "campaign");
}
