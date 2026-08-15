import { describe, it, expect } from "vitest";
import {
  createInitialState,
  spawnTarget,
  spawnBossForAct,
  spawnPowerUp,
  updatePowerUps,
  createIceBlock,
  updateIceBlocksAndCollisions,
  updateTargetsPosition,
  checkLaserRayHit,
  triggerUltimateTremolo,
  calculateNextComboAndMultiplier,
  createExplosionParticles,
  updateParticles,
  updateShockwaves,
  updateFloatingTexts,
  Target,
  IceBlock,
  PowerUp,
} from "@/lib/laser-loon";

describe("Laser Loon Pure Engine", () => {
  it("should initialize default state correctly for campaign, arcade, and sandbox modes", () => {
    const campaignState = createInitialState("campaign");
    expect(campaignState.mode).toBe("campaign");
    expect(campaignState.laserType).toBe("ruby-laser");
    expect(campaignState.gameState).toBe("idle");
    expect(campaignState.currentAct).toBe(1);
    expect(campaignState.score).toBe(0);
    expect(campaignState.ultimateMeter).toBe(0);
    expect(campaignState.targets).toHaveLength(0);
    expect(campaignState.iceBlocks).toHaveLength(0);

    const arcadeState = createInitialState("arcade");
    expect(arcadeState.mode).toBe("arcade");
    expect(arcadeState.timeLeft).toBe(45);

    const sandboxState = createInitialState("sandbox");
    expect(sandboxState.mode).toBe("sandbox");
  });

  it("should spawn civic targets with valid attributes and types", () => {
    const { newTarget, updatedTargets, nextId } = spawnTarget([], 1, 800, 400, "mosquito", 1);
    expect(newTarget.id).toBe(1);
    expect(newTarget.type).toBe("mosquito");
    expect(newTarget.label).toBe("Laser Mosquito");
    expect(newTarget.hp).toBe(1);
    expect(newTarget.maxHp).toBe(1);
    expect(newTarget.points).toBe(100);
    expect(newTarget.frozenTimer).toBe(0);
    expect(updatedTargets).toHaveLength(1);
    expect(nextId).toBe(2);
  });

  it("should spawn act bosses correctly with increased HP and boss flags", () => {
    const { boss, nextId } = spawnBossForAct(1, 10, 800, 400);
    expect(boss.id).toBe(10);
    expect(boss.isBoss).toBe(true);
    expect(boss.type).toBe("mega-mosquito");
    expect(boss.label).toBe("The Mega Mosquito Queen");
    expect(boss.hp).toBe(20);
    expect(boss.maxHp).toBe(20);
    expect(nextId).toBe(11);
  });

  it("should spawn and collect power-ups on collision with loon", () => {
    const { newPowerUp, updatedPowerUps } = spawnPowerUp([], 1, 800, 400, "hotdish");
    expect(newPowerUp.type).toBe("hotdish");
    expect(newPowerUp.label).toBe("Tater Tot Hotdish");
    expect(updatedPowerUps).toHaveLength(1);

    const loonX = 120;
    const loonY = 180;
    const powerUpNearLoon: PowerUp = {
      ...newPowerUp,
      x: 125,
      y: 185,
    };

    const { remainingPowerUps, collectedPowerUp } = updatePowerUps([powerUpNearLoon], 1, loonX, loonY, 32);
    expect(collectedPowerUp).not.toBeNull();
    expect(collectedPowerUp?.type).toBe("hotdish");
    expect(remainingPowerUps).toHaveLength(0);
  });

  it("should create ice blocks with normalized direction and correct velocity", () => {
    const fromX = 100;
    const fromY = 100;
    const targetX = 400;
    const targetY = 500;
    const speed = 10;

    const { iceBlock, nextId } = createIceBlock(fromX, fromY, targetX, targetY, 42, speed);
    expect(iceBlock.id).toBe(42);
    expect(iceBlock.x).toBe(fromX);
    expect(iceBlock.y).toBe(fromY);
    expect(nextId).toBe(43);

    const dx = targetX - fromX;
    const dy = targetY - fromY;
    const dist = Math.hypot(dx, dy);
    const expectedVx = (dx / dist) * speed;
    const expectedVy = (dy / dist) * speed;

    expect(iceBlock.vx).toBeCloseTo(expectedVx, 4);
    expect(iceBlock.vy).toBeCloseTo(expectedVy, 4);
  });

  it("should collide ice blocks with targets, freezing them and dealing damage", () => {
    const initialTarget: Target = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 20,
      type: "seal-guardian",
      label: "1893 Seal Drone",
      color: "#6366f1",
      hp: 4,
      maxHp: 4,
      points: 350,
      pulsePhase: 0,
      frozenTimer: 0,
    };

    const iceBlock: IceBlock = {
      id: 1,
      x: 195,
      y: 195,
      vx: 5,
      vy: 0,
      size: 26,
      rotation: 0,
      vRot: 0,
      hp: 1,
    };

    const result = updateIceBlocksAndCollisions([iceBlock], [initialTarget], 1, "arcade", 0.15);

    expect(result.shatteredBlocks.length).toBeGreaterThan(0);
    expect(result.updatedIceBlocks).toHaveLength(0); // Ice block shattered on impact
    expect(result.updatedTargets).toHaveLength(1);
    expect(result.updatedTargets[0].hp).toBeLessThan(4);
    expect(result.updatedTargets[0].frozenTimer).toBeGreaterThan(0); // Frozen!
    expect(result.frozenTargets).toHaveLength(1);
    expect(result.killedTargets).toHaveLength(0);
  });

  it("should shatter ice block and kill low HP target awarding 2x points bonus", () => {
    const lowHpTarget: Target = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 20,
      type: "mosquito",
      label: "Laser Mosquito",
      color: "#f43f5e",
      hp: 1,
      maxHp: 1,
      points: 100,
      pulsePhase: 0,
      frozenTimer: 0,
    };

    const iceBlock: IceBlock = {
      id: 1,
      x: 200,
      y: 200,
      vx: 5,
      vy: 0,
      size: 26,
      rotation: 0,
      vRot: 0,
      hp: 1,
    };

    const result = updateIceBlocksAndCollisions([iceBlock], [lowHpTarget], 1, "arcade", 0.15);

    expect(result.killedTargets).toHaveLength(1);
    expect(result.updatedTargets).toHaveLength(0);
    expect(result.pointsEarned).toBe(200); // 100 * 2 bonus
  });

  it("should immobilize frozen targets and tick down freezeTimer", () => {
    const frozenTarget: Target = {
      id: 1,
      x: 300,
      y: 200,
      vx: -5,
      vy: 2,
      radius: 20,
      type: "mosquito",
      label: "Laser Mosquito",
      color: "#f43f5e",
      hp: 1,
      maxHp: 1,
      points: 100,
      pulsePhase: 0,
      frozenTimer: 10,
    };

    const updated = updateTargetsPosition([frozenTarget], 2, "arcade", 0.15);
    expect(updated[0].x).toBe(300); // Did not move horizontally
    expect(updated[0].y).toBe(200); // Did not move vertically
    expect(updated[0].frozenTimer).toBe(8); // 10 - (1 * 2)
  });

  it("should raycast Ruby Eye Laser beams and detect direct hits", () => {
    const eyeX = 100;
    const eyeY = 200;
    const aimX = 500;
    const aimY = 200;

    const inLineTarget: Target = {
      id: 1,
      x: 300,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 15,
      type: "mosquito",
      label: "Laser Mosquito",
      color: "#f43f5e",
      hp: 1,
      maxHp: 1,
      points: 100,
      pulsePhase: 0,
      frozenTimer: 0,
    };

    const offTarget: Target = {
      id: 2,
      x: 300,
      y: 350,
      vx: 0,
      vy: 0,
      radius: 15,
      type: "red-tape",
      label: "Bureaucratic Red Tape",
      color: "#ef4444",
      hp: 2,
      maxHp: 2,
      points: 220,
      pulsePhase: 0,
      frozenTimer: 0,
    };

    const hitResult = checkLaserRayHit(eyeX, eyeY, aimX, aimY, "ruby-laser", [inLineTarget, offTarget]);

    expect(hitResult.hitAny).toBe(true);
    expect(hitResult.killedTargets).toHaveLength(1);
    expect(hitResult.killedTargets[0].id).toBe(1);
    expect(hitResult.updatedTargets).toHaveLength(1);
    expect(hitResult.updatedTargets[0].id).toBe(2);
    expect(hitResult.ultimateGained).toBeGreaterThan(0);
  });

  it("should trigger Haunting Loon Tremolo and clear on-screen minions with shockwave", () => {
    const target1: Target = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 15,
      type: "mosquito",
      label: "Laser Mosquito",
      color: "#f43f5e",
      hp: 1,
      maxHp: 1,
      points: 100,
      pulsePhase: 0,
      frozenTimer: 0,
    };

    const bossTarget: Target = {
      id: 2,
      x: 500,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 40,
      type: "mega-mosquito",
      label: "The Mega Mosquito Queen",
      color: "#e11d48",
      hp: 20,
      maxHp: 20,
      points: 1500,
      pulsePhase: 0,
      frozenTimer: 0,
      isBoss: true,
    };

    const result = triggerUltimateTremolo([target1, bossTarget], 120, 180, 800, 400, 1);
    expect(result.killedTargets).toHaveLength(1); // regular minion killed instantly
    expect(result.updatedTargets).toHaveLength(1); // boss survived but took heavy damage
    expect(result.updatedTargets[0].hp).toBe(5); // 20 - 15 = 5
    expect(result.updatedTargets[0].frozenTimer).toBe(180);
    expect(result.newShockwave).toBeDefined();
    expect(result.newShockwave.speed).toBeGreaterThan(10);
  });

  it("should calculate combos and multipliers correctly", () => {
    const initial = calculateNextComboAndMultiplier(0, 0, 1000);
    expect(initial.nextCombo).toBe(1);
    expect(initial.nextMultiplier).toBe(1);

    const secondHit = calculateNextComboAndMultiplier(1, 1000, 1500); // 500ms later (< 1800ms)
    expect(secondHit.nextCombo).toBe(2);
    expect(secondHit.nextMultiplier).toBe(1);

    const thirdHit = calculateNextComboAndMultiplier(2, 1500, 2000);
    expect(thirdHit.nextCombo).toBe(3);
    expect(thirdHit.nextMultiplier).toBe(2); // Math.floor(3/3) + 1 = 2

    const timedOutHit = calculateNextComboAndMultiplier(5, 2000, 5000); // 3000ms later (> 1800ms)
    expect(timedOutHit.nextCombo).toBe(1);
    expect(timedOutHit.nextMultiplier).toBe(1);

    const maxComboHit = calculateNextComboAndMultiplier(20, 5000, 5200);
    expect(maxComboHit.nextMultiplier).toBe(5); // Capped at 5x
  });

  it("should generate and update particle physics and shockwaves", () => {
    const particles = createExplosionParticles(100, 100, "#38bdf8", 10, true);
    expect(particles).toHaveLength(10);
    expect(particles[0].shape).toBe("crystal");

    const updated = updateParticles(particles, 10);
    expect(updated.every((p) => p.alpha < 1)).toBe(true);

    const shockwave = {
      id: 1,
      x: 100,
      y: 100,
      radius: 10,
      maxRadius: 200,
      speed: 15,
      color: "#22d3ee",
      alpha: 1.0,
    };
    const updatedShockwaves = updateShockwaves([shockwave], 2);
    expect(updatedShockwaves[0].radius).toBe(40);
    expect(updatedShockwaves[0].alpha).toBeLessThan(1.0);
  });

  it("should update floating text and remove expired texts", () => {
    const initialTexts = [
      { id: 1, x: 100, y: 100, text: "+100", color: "#f43f5e", alpha: 0.1, vy: -1 },
      { id: 2, x: 200, y: 200, text: "+200", color: "#38bdf8", alpha: 1.0, vy: -1 },
    ];

    const updated = updateFloatingTexts(initialTexts, 6); // 6 * 0.02 = 0.12 decay
    expect(updated).toHaveLength(1); // id: 1 decayed completely
    expect(updated[0].id).toBe(2);
    expect(updated[0].y).toBeLessThan(200);
  });

  it("should handle bouncing, sine, and sandbox gravity trajectories for enemies", () => {
    const sineTarget: Target = {
      id: 1,
      x: 300,
      y: 200,
      vx: -2,
      vy: 0,
      radius: 15,
      type: "mosquito", // sine behavior
      label: "Mosquito",
      color: "#f43f5e",
      hp: 1,
      maxHp: 1,
      points: 100,
      pulsePhase: 1.5,
      frozenTimer: 0,
    };

    const bounceTarget: Target = {
      id: 2,
      x: 300,
      y: 12,
      vx: -2,
      vy: -5,
      radius: 15,
      type: "hailstorm", // bouncing behavior
      label: "Hailstorm",
      color: "#38bdf8",
      hp: 2,
      maxHp: 2,
      points: 150,
      pulsePhase: 0,
      frozenTimer: 0,
    };

    const bounceBottom: Target = {
      id: 3,
      x: 300,
      y: 490,
      vx: -2,
      vy: 5,
      radius: 15,
      type: "hailstorm",
      label: "Hailstorm",
      color: "#38bdf8",
      hp: 2,
      maxHp: 2,
      points: 150,
      pulsePhase: 0,
      frozenTimer: 0,
    };

    const updated = updateTargetsPosition([sineTarget, bounceTarget, bounceBottom], 1, "sandbox", 0.2);
    expect(updated[0].x).toBeLessThan(300);
    expect(updated[1].vy).toBeGreaterThan(0); // bounced off top boundary
    expect(updated[2].vy).toBeLessThan(0); // bounced off bottom boundary
  });

  it("should handle hotdish overcharged laser hits and boss damage", () => {
    const bossTarget: Target = {
      id: 1,
      x: 300,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 35,
      type: "mega-mosquito",
      label: "Queen",
      color: "#e11d48",
      hp: 20,
      maxHp: 20,
      points: 1500,
      pulsePhase: 0,
      frozenTimer: 0,
      isBoss: true,
    };

    const res = checkLaserRayHit(100, 200, 500, 200, "ruby-laser", [bossTarget], true);
    expect(res.hitAny).toBe(true);
    expect(res.ultimateGained).toBeGreaterThan(0);
    expect(res.updatedTargets[0].hp).toBeLessThan(20);
  });
});
