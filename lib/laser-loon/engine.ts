/**
 * Laser Loon: Quest for the State Flag
 * Pure physics engine, raycast geometry, collision detection, and campaign lifecycle.
 */

import {
  LaserLoonState,
  LaserMode,
  LaserType,
  Target,
  IceBlock,
  Particle,
  Shockwave,
  FloatingText,
  CivicEnemyType,
  PowerUp,
  PowerUpType,
} from "./types";
import {
  ENEMY_TYPES,
  WEAPONS,
  CAMPAIGN_ACTS,
  POWER_UP_CONFIGS,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  ARCADE_GAME_DURATION_SECS,
  COMBO_TIMEOUT_MS,
  MAX_MULTIPLIER,
  ULTIMATE_CHARGE_PER_KILL,
} from "./constants";

export interface LaserLoonEngineOptions {
  difficulty?: "easy" | "normal" | "hard";
  startingAct?: number;
  laserType?: LaserType;
  seed?: number | string;
  speedMultiplier?: number;
}

export function createInitialState(
  mode: LaserMode = "campaign",
  options?: LaserLoonEngineOptions
): LaserLoonState {
  const currentAct = options?.startingAct ?? 1;
  const laserType = options?.laserType ?? "ruby-laser";

  return {
    mode,
    laserType,
    gameState: "idle",
    currentAct,
    actKills: 0,
    score: 0,
    highScore: 0,
    combo: 0,
    multiplier: 1,
    timeLeft: mode === "arcade" ? ARCADE_GAME_DURATION_SECS : 999,
    gravity: options?.difficulty === "easy" ? 0.1 : options?.difficulty === "hard" ? 0.25 : 0.15,
    ultimateMeter: 0,
    activePowerUp: null,
    targets: [],
    iceBlocks: [],
    powerUps: [],
    particles: [],
    shockwaves: [],
    floatingTexts: [],
    loonPos: { x: 120, y: 180, targetX: 120, targetY: 180 },
    aimPos: { x: 420, y: 180 },
    lastFireTime: 0,
    lastComboTime: 0,
    nextTargetId: 1,
    nextIceId: 1,
    nextPowerUpId: 1,
    nextShockwaveId: 1,
    nextTextId: 1,
    shakeIntensity: 0,
  };
}

export function getActAvailableEnemies(actNumber: number): CivicEnemyType[] {
  switch (actNumber) {
    case 1:
      return ["mosquito", "hailstorm", "jetski"];
    case 2:
      return ["butter-bomb", "pronto-pup-rogue", "livestock-decoy", "mosquito"];
    case 3:
      return ["red-tape", "veto-stamp", "tricolor-rival", "clipboard"];
    case 4:
      return ["legislative-amendment", "seal-guardian", "polar-vortex", "red-tape"];
    default:
      return ["mosquito", "hailstorm", "butter-bomb", "red-tape", "veto-stamp", "tricolor-rival"];
  }
}

export function spawnTarget(
  targets: Target[],
  nextId: number,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  forcedType?: CivicEnemyType,
  actNumber = 1
): { newTarget: Target; updatedTargets: Target[]; nextId: number } {
  let targetType = forcedType;
  if (!targetType) {
    const pool = getActAvailableEnemies(actNumber);
    targetType = pool[Math.floor(Math.random() * pool.length)];
  }

  const template = ENEMY_TYPES.find((b) => b.type === targetType) || ENEMY_TYPES[0];

  const edge = Math.floor(Math.random() * 3);
  let x = canvasWidth + 30;
  let y = Math.random() * (canvasHeight - 100) + 50;
  let vx = -(Math.random() * 1.5 + 1.0);
  let vy = (Math.random() - 0.5) * 1.2;

  if (edge === 0) {
    x = Math.random() * (canvasWidth * 0.4) + canvasWidth * 0.6;
    y = -30;
    vy = Math.random() * 1.2 + 0.6;
  } else if (edge === 1) {
    x = Math.random() * (canvasWidth * 0.4) + canvasWidth * 0.6;
    y = canvasHeight + 30;
    vy = -(Math.random() * 1.2 + 0.6);
  }

  if (template.isBoss) {
    x = canvasWidth - 100;
    y = canvasHeight * 0.5;
    vx = 0;
    vy = 1.0;
  }

  const newTarget: Target = {
    id: nextId,
    x,
    y,
    vx,
    vy,
    radius: template.radius,
    type: template.type,
    label: template.label,
    color: template.color,
    hp: template.hp,
    maxHp: template.hp,
    points: template.points,
    pulsePhase: Math.random() * Math.PI * 2,
    frozenTimer: 0,
    isBoss: template.isBoss || false,
    bossPhase: 1,
    shieldAngle: 0,
    specialAttackTimer: 0,
  };

  return {
    newTarget,
    updatedTargets: [...targets, newTarget],
    nextId: nextId + 1,
  };
}

export function spawnBossForAct(
  actNumber: number,
  nextId: number,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT
): { boss: Target; nextId: number } {
  const act = CAMPAIGN_ACTS.find((a) => a.actNumber === actNumber) || CAMPAIGN_ACTS[0];
  const template = ENEMY_TYPES.find((e) => e.type === act.bossType) || ENEMY_TYPES[ENEMY_TYPES.length - 1];

  const boss: Target = {
    id: nextId,
    x: canvasWidth - 120,
    y: canvasHeight * 0.5,
    vx: 0,
    vy: 1.2,
    radius: template.radius,
    type: template.type,
    label: template.label,
    color: template.color,
    hp: act.bossHp,
    maxHp: act.bossHp,
    points: template.points,
    pulsePhase: 0,
    frozenTimer: 0,
    isBoss: true,
    bossPhase: 1,
    shieldAngle: 0,
    specialAttackTimer: 0,
  };

  return { boss, nextId: nextId + 1 };
}

export function spawnPowerUp(
  powerUps: PowerUp[],
  nextId: number,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  forcedType?: PowerUpType
): { newPowerUp: PowerUp; updatedPowerUps: PowerUp[]; nextId: number } {
  const types: PowerUpType[] = ["hotdish", "pronto-pup", "north-star"];
  const type = forcedType || types[Math.floor(Math.random() * types.length)];
  const config = POWER_UP_CONFIGS[type];

  const newPowerUp: PowerUp = {
    id: nextId,
    x: canvasWidth + 20,
    y: Math.random() * (canvasHeight - 120) + 60,
    vx: -(Math.random() * 1.2 + 0.8),
    vy: Math.sin(Math.random() * Math.PI) * 0.5,
    type,
    label: config.label,
    color: config.color,
    pulsePhase: 0,
    durationMs: config.durationMs,
  };

  return {
    newPowerUp,
    updatedPowerUps: [...powerUps, newPowerUp],
    nextId: nextId + 1,
  };
}

export function updatePowerUps(
  powerUps: PowerUp[],
  dt: number,
  loonX: number,
  loonY: number,
  loonRadius = 32
): { remainingPowerUps: PowerUp[]; collectedPowerUp: PowerUp | null } {
  const remaining: PowerUp[] = [];
  let collected: PowerUp | null = null;

  for (const p of powerUps) {
    const nextP = { ...p };
    nextP.x += nextP.vx * dt;
    nextP.y += nextP.vy * dt;
    nextP.pulsePhase += 0.08 * dt;

    const distToLoon = Math.hypot(nextP.x - loonX, nextP.y - loonY);
    if (distToLoon < loonRadius + 20 && !collected) {
      collected = nextP;
    } else if (nextP.x > -40) {
      remaining.push(nextP);
    }
  }

  return { remainingPowerUps: remaining, collectedPowerUp: collected };
}

export function createIceBlock(
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
  nextId: number,
  speed = 8.5
): { iceBlock: IceBlock; nextId: number } {
  const dx = targetX - fromX;
  const dy = targetY - fromY;
  const dist = Math.hypot(dx, dy) || 1;

  const iceBlock: IceBlock = {
    id: nextId,
    x: fromX,
    y: fromY,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    size: 28,
    rotation: Math.random() * Math.PI * 2,
    vRot: (Math.random() - 0.5) * 0.2,
    hp: 1,
  };

  return {
    iceBlock,
    nextId: nextId + 1,
  };
}

export interface IceCollisionResult {
  updatedIceBlocks: IceBlock[];
  updatedTargets: Target[];
  shatteredBlocks: Array<{ x: number; y: number }>;
  killedTargets: Target[];
  frozenTargets: Target[];
  pointsEarned: number;
}

export function updateIceBlocksAndCollisions(
  iceBlocks: IceBlock[],
  targets: Target[],
  dt: number,
  mode: LaserMode,
  gravity: number,
  width = DEFAULT_CANVAS_WIDTH,
  height = DEFAULT_CANVAS_HEIGHT
): IceCollisionResult {
  const shatteredBlocks: Array<{ x: number; y: number }> = [];
  const killedTargets: Target[] = [];
  const frozenTargets: Target[] = [];
  let pointsEarned = 0;

  const updatedTargets = targets.map((t) => ({ ...t }));
  const remainingIceBlocks: IceBlock[] = [];

  for (const block of iceBlocks) {
    const nextBlock = { ...block };
    nextBlock.x += nextBlock.vx * dt;
    nextBlock.y += nextBlock.vy * dt;
    nextBlock.rotation += nextBlock.vRot * dt;

    if (mode === "sandbox") {
      nextBlock.vy += gravity * dt;
    }

    // Bounce off top and bottom walls
    if (nextBlock.y < 20) {
      nextBlock.y = 20;
      nextBlock.vy = Math.abs(nextBlock.vy) * 0.85;
      shatteredBlocks.push({ x: nextBlock.x, y: nextBlock.y });
    } else if (nextBlock.y > height - 20) {
      nextBlock.y = height - 20;
      nextBlock.vy = -Math.abs(nextBlock.vy) * 0.85;
      shatteredBlocks.push({ x: nextBlock.x, y: nextBlock.y });
    }

    let blockShattered = false;

    for (const target of updatedTargets) {
      if (target.hp <= 0) continue;
      const dist = Math.hypot(target.x - nextBlock.x, target.y - nextBlock.y);
      if (dist < target.radius + nextBlock.size * 0.5) {
        blockShattered = true;
        const dmg = target.isBoss ? 2 : 3;
        target.hp -= dmg;
        target.frozenTimer = target.isBoss ? 45 : 120; // Freeze in place
        frozenTargets.push(target);
        shatteredBlocks.push({ x: nextBlock.x, y: nextBlock.y });

        if (target.hp <= 0) {
          killedTargets.push(target);
          pointsEarned += target.points * 2; // Shatter bonus
        }
        break;
      }
    }

    if (!blockShattered && nextBlock.x < width + 60 && nextBlock.x > -60) {
      remainingIceBlocks.push(nextBlock);
    }
  }

  return {
    updatedIceBlocks: remainingIceBlocks,
    updatedTargets: updatedTargets.filter((t) => t.hp > 0),
    shatteredBlocks,
    killedTargets,
    frozenTargets,
    pointsEarned,
  };
}

export function updateTargetsPosition(
  targets: Target[],
  dt: number,
  mode: LaserMode,
  gravity: number,
  height = DEFAULT_CANVAS_HEIGHT,
  width = DEFAULT_CANVAS_WIDTH
): Target[] {
  return targets
    .filter((t) => t.hp > 0 && (t.isBoss || t.x > -60))
    .map((t) => {
      const nextT = { ...t };

      if (nextT.frozenTimer > 0) {
        nextT.frozenTimer = Math.max(0, nextT.frozenTimer - 1 * dt);
        return nextT;
      }

      nextT.pulsePhase += 0.05 * dt;

      if (nextT.isBoss) {
        // Boss flight pattern
        nextT.shieldAngle = ((nextT.shieldAngle || 0) + 0.04 * dt) % (Math.PI * 2);
        nextT.y += nextT.vy * dt;
        if (nextT.y < 80) {
          nextT.y = 80;
          nextT.vy = Math.abs(nextT.vy);
        } else if (nextT.y > height - 80) {
          nextT.y = height - 80;
          nextT.vy = -Math.abs(nextT.vy);
        }

        // Slight horizontal bobbing
        nextT.x = width - 130 + Math.sin(nextT.pulsePhase * 0.8) * 40;
        return nextT;
      }

      const template = ENEMY_TYPES.find((e) => e.type === nextT.type);
      const behavior = template?.behavior || "linear";

      if (behavior === "sine") {
        nextT.x += nextT.vx * dt;
        nextT.y += Math.sin(nextT.pulsePhase) * 2.0 * dt;
      } else if (behavior === "bouncing") {
        nextT.x += nextT.vx * dt;
        nextT.y += nextT.vy * dt;
        if (nextT.y - nextT.radius < 15) {
          nextT.y = 15 + nextT.radius;
          nextT.vy = Math.abs(nextT.vy);
        } else if (nextT.y + nextT.radius > height - 15) {
          nextT.y = height - 15 - nextT.radius;
          nextT.vy = -Math.abs(nextT.vy);
        }
      } else {
        nextT.x += nextT.vx * dt;
        nextT.y += nextT.vy * dt;
      }

      if (mode === "sandbox") {
        nextT.vy += gravity * dt;
      }

      if (nextT.y - nextT.radius < 10) {
        nextT.y = 10 + nextT.radius;
        nextT.vy = Math.abs(nextT.vy) * 0.8;
      } else if (nextT.y + nextT.radius > height - 10) {
        nextT.y = height - 10 - nextT.radius;
        nextT.vy = -Math.abs(nextT.vy) * 0.8;
      }

      return nextT;
    });
}

export interface LaserHitResult {
  updatedTargets: Target[];
  hitAny: boolean;
  killedTargets: Target[];
  damagedPoints: Array<{ x: number; y: number; color: string }>;
  ultimateGained: number;
}

export function checkLaserRayHit(
  eyeX: number,
  eyeY: number,
  aimX: number,
  aimY: number,
  laserType: LaserType,
  targets: Target[],
  hasHotdishOvercharge = false
): LaserHitResult {
  const dx = aimX - eyeX;
  const dy = aimY - eyeY;
  const dist = Math.hypot(dx, dy) || 1;
  const dirX = dx / dist;
  const dirY = dy / dist;

  const weapon = WEAPONS[laserType] || WEAPONS["ruby-laser"];
  const hitExtra = weapon.rayHitRadiusExtra + (hasHotdishOvercharge ? 10 : 0);
  const damage = weapon.damage * (hasHotdishOvercharge ? 1.6 : 1.0);

  let hitAny = false;
  let ultimateGained = 0;
  const killedTargets: Target[] = [];
  const damagedPoints: Array<{ x: number; y: number; color: string }> = [];

  const updatedTargets = targets.map((t) => {
    if (t.hp <= 0) return t;

    const toTx = t.x - eyeX;
    const toTy = t.y - eyeY;
    const proj = toTx * dirX + toTy * dirY;

    if (proj > 0) {
      const nearX = eyeX + dirX * proj;
      const nearY = eyeY + dirY * proj;
      const distToRay = Math.hypot(t.x - nearX, t.y - nearY);

      if (distToRay < t.radius + hitExtra) {
        hitAny = true;
        const nextHp = t.hp - damage;
        damagedPoints.push({ x: nearX, y: nearY, color: t.color });

        if (t.isBoss) {
          ultimateGained += 4;
        }

        if (nextHp <= 0) {
          const killed = { ...t, hp: 0 };
          killedTargets.push(killed);
          ultimateGained += ULTIMATE_CHARGE_PER_KILL;
          return killed;
        }
        return { ...t, hp: nextHp };
      }
    }
    return t;
  });

  return {
    updatedTargets: updatedTargets.filter((t) => t.hp > 0),
    hitAny,
    killedTargets,
    damagedPoints,
    ultimateGained,
  };
}

export function triggerUltimateTremolo(
  targets: Target[],
  fromX: number,
  fromY: number,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  nextShockwaveId = 1
): {
  updatedTargets: Target[];
  killedTargets: Target[];
  newShockwave: Shockwave;
  pointsEarned: number;
  nextShockwaveId: number;
} {
  const killedTargets: Target[] = [];
  let pointsEarned = 0;

  const updatedTargets = targets.map((t) => {
    const nextT = { ...t };
    const tremoloDamage = nextT.isBoss ? 15 : 999; // Instant kill regular targets, heavy boss damage
    nextT.hp -= tremoloDamage;
    nextT.frozenTimer = 180;

    if (nextT.hp <= 0) {
      killedTargets.push(nextT);
      pointsEarned += nextT.points * 3; // Ultimate bonus
    }
    return nextT;
  });

  const newShockwave: Shockwave = {
    id: nextShockwaveId,
    x: fromX,
    y: fromY,
    radius: 10,
    maxRadius: Math.max(canvasWidth, canvasHeight) * 1.2,
    speed: 18,
    color: "#22d3ee",
    alpha: 1.0,
  };

  return {
    updatedTargets: updatedTargets.filter((t) => t.hp > 0),
    killedTargets,
    newShockwave,
    pointsEarned,
    nextShockwaveId: nextShockwaveId + 1,
  };
}

export function calculateNextComboAndMultiplier(
  currentCombo: number,
  lastComboTime: number,
  currentTime: number
): { nextCombo: number; nextMultiplier: number } {
  const timeSinceLast = currentTime - lastComboTime;
  const nextCombo = timeSinceLast < COMBO_TIMEOUT_MS ? currentCombo + 1 : 1;
  const nextMultiplier = Math.min(MAX_MULTIPLIER, Math.floor(nextCombo / 3) + 1);
  return { nextCombo, nextMultiplier };
}

export function createExplosionParticles(
  x: number,
  y: number,
  color: string,
  count = 20,
  isIce = false,
  isStar = false
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * (isIce ? 5.5 : 4.5) + 1.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: isIce ? Math.random() * 5 + 2 : isStar ? Math.random() * 4 + 2 : Math.random() * 3.5 + 1.5,
      color: isIce ? (Math.random() > 0.4 ? "#38bdf8" : "#ffffff") : color,
      alpha: 1,
      decay: Math.random() * 0.03 + (isIce ? 0.015 : 0.02),
      shape: isIce ? "crystal" : isStar ? "star" : "circle",
      rotation: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      alpha: p.alpha - p.decay * dt,
    }))
    .filter((p) => p.alpha > 0);
}

export function updateShockwaves(shockwaves: Shockwave[], dt: number): Shockwave[] {
  return shockwaves
    .map((s) => ({
      ...s,
      radius: s.radius + s.speed * dt,
      alpha: Math.max(0, 1 - s.radius / s.maxRadius),
    }))
    .filter((s) => s.alpha > 0.02 && s.radius < s.maxRadius);
}

export function updateFloatingTexts(texts: FloatingText[], dt: number): FloatingText[] {
  return texts
    .map((f) => ({
      ...f,
      y: f.y + f.vy * dt,
      alpha: f.alpha - 0.02 * dt,
    }))
    .filter((f) => f.alpha > 0);
}
