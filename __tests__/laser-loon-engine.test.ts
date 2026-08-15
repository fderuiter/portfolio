import { describe, it, expect } from "vitest";
import {
  createInitialState,
  spawnTarget,
  createIceBlock,
  updateIceBlocksAndCollisions,
  updateTargetsPosition,
  checkLaserRayHit,
  calculateNextComboAndMultiplier,
  createExplosionParticles,
  updateParticles,
  updateFloatingTexts,
  Target,
  IceBlock,
} from "@/lib/laser-loon";

describe("Laser Loon Pure Engine", () => {
  it("should initialize default state correctly for arcade and sandbox modes", () => {
    const arcadeState = createInitialState("arcade");
    expect(arcadeState.mode).toBe("arcade");
    expect(arcadeState.laserType).toBe("ice-cannon");
    expect(arcadeState.gameState).toBe("idle");
    expect(arcadeState.score).toBe(0);
    expect(arcadeState.timeLeft).toBe(45);
    expect(arcadeState.targets).toHaveLength(0);
    expect(arcadeState.iceBlocks).toHaveLength(0);

    const sandboxState = createInitialState("sandbox");
    expect(sandboxState.mode).toBe("sandbox");
    expect(sandboxState.timeLeft).toBe(60);
  });

  it("should spawn targets with valid attributes and types", () => {
    const { newTarget, updatedTargets, nextId } = spawnTarget([], 1, 800, 400, "segfault");
    expect(newTarget.id).toBe(1);
    expect(newTarget.type).toBe("segfault");
    expect(newTarget.label).toBe("SegFault 11");
    expect(newTarget.hp).toBe(3);
    expect(newTarget.maxHp).toBe(3);
    expect(newTarget.points).toBe(250);
    expect(newTarget.frozenTimer).toBe(0);
    expect(updatedTargets).toHaveLength(1);
    expect(nextId).toBe(2);
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

  it("should collide ice blocks with targets, freezing them and dealing 2 damage", () => {
    const initialTarget: Target = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 20,
      type: "drop-db",
      label: "DROP TABLE",
      color: "#ec4899",
      hp: 4,
      maxHp: 4,
      points: 300,
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
    expect(result.updatedTargets[0].hp).toBe(2); // 4 - 2 = 2
    expect(result.updatedTargets[0].frozenTimer).toBe(90); // Frozen!
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
      type: "memory-leak",
      label: "Memory Leak",
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
      type: "alien",
      label: "404 Alien",
      color: "#06b6d4",
      hp: 1,
      maxHp: 1,
      points: 80,
      pulsePhase: 0,
      frozenTimer: 10,
    };

    const updated = updateTargetsPosition([frozenTarget], 2, "arcade", 0.15);
    expect(updated[0].x).toBe(300); // Did not move horizontally
    expect(updated[0].y).toBe(200); // Did not move vertically
    expect(updated[0].frozenTimer).toBe(8); // 10 - (1 * 2)
  });

  it("should raycast laser beams and detect direct hits", () => {
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
      type: "null-pointer",
      label: "Null Pointer",
      color: "#a855f7",
      hp: 1,
      maxHp: 1,
      points: 120,
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
      type: "alien",
      label: "404 Alien",
      color: "#06b6d4",
      hp: 1,
      maxHp: 1,
      points: 80,
      pulsePhase: 0,
      frozenTimer: 0,
    };

    const hitResult = checkLaserRayHit(eyeX, eyeY, aimX, aimY, "cyan-pulse", [inLineTarget, offTarget]);

    expect(hitResult.hitAny).toBe(true);
    expect(hitResult.killedTargets).toHaveLength(1);
    expect(hitResult.killedTargets[0].id).toBe(1);
    expect(hitResult.updatedTargets).toHaveLength(1);
    expect(hitResult.updatedTargets[0].id).toBe(2);
  });

  it("should not hit targets behind the loon eye", () => {
    const eyeX = 200;
    const eyeY = 200;
    const aimX = 500;
    const aimY = 200;

    const behindTarget: Target = {
      id: 1,
      x: 50,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 15,
      type: "null-pointer",
      label: "Null Pointer",
      color: "#a855f7",
      hp: 1,
      maxHp: 1,
      points: 120,
      pulsePhase: 0,
      frozenTimer: 0,
    };

    const hitResult = checkLaserRayHit(eyeX, eyeY, aimX, aimY, "cyan-pulse", [behindTarget]);
    expect(hitResult.hitAny).toBe(false);
    expect(hitResult.killedTargets).toHaveLength(0);
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

  it("should generate and update particle physics and decay", () => {
    const particles = createExplosionParticles(100, 100, "#38bdf8", 10, true);
    expect(particles).toHaveLength(10);
    expect(particles[0].shape).toBe("crystal");

    const updated = updateParticles(particles, 10);
    expect(updated.every((p) => p.alpha < 1)).toBe(true);
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
});
