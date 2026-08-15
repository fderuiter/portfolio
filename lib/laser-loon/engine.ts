import {
  LaserLoonState,
  LaserMode,
  LaserType,
  Target,
  IceBlock,
  Particle,
  FloatingText,
  TargetBugType,
} from "./types";
import {
  BUG_TYPES,
  WEAPONS,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  ARCADE_GAME_DURATION_SECS,
  COMBO_TIMEOUT_MS,
  MAX_MULTIPLIER,
} from "./constants";

export function createInitialState(mode: LaserMode = "arcade"): LaserLoonState {
  return {
    mode,
    laserType: "ice-cannon",
    gameState: "idle",
    score: 0,
    highScore: 0,
    combo: 0,
    multiplier: 1,
    timeLeft: mode === "arcade" ? ARCADE_GAME_DURATION_SECS : 60,
    gravity: 0.15,
    targets: [],
    iceBlocks: [],
    particles: [],
    floatingTexts: [],
    loonPos: { x: 120, y: 180, targetX: 120, targetY: 180 },
    aimPos: { x: 380, y: 180 },
    lastFireTime: 0,
    lastComboTime: 0,
    nextTargetId: 1,
    nextIceId: 1,
    nextTextId: 1,
    shakeIntensity: 0,
  };
}

export function spawnTarget(
  targets: Target[],
  nextId: number,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  forcedType?: TargetBugType
): { newTarget: Target; updatedTargets: Target[]; nextId: number } {
  const template = forcedType
    ? BUG_TYPES.find((b) => b.type === forcedType) || BUG_TYPES[0]
    : BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)];

  const edge = Math.floor(Math.random() * 3);
  let x = canvasWidth + 25;
  let y = Math.random() * (canvasHeight - 80) + 40;
  const vx = -(Math.random() * 1.6 + 0.8);
  let vy = (Math.random() - 0.5) * 1.2;

  if (edge === 0) {
    x = Math.random() * (canvasWidth * 0.5) + canvasWidth * 0.5;
    y = -25;
    vy = Math.random() * 1.2 + 0.5;
  } else if (edge === 1) {
    x = Math.random() * (canvasWidth * 0.5) + canvasWidth * 0.5;
    y = canvasHeight + 25;
    vy = -(Math.random() * 1.2 + 0.5);
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
  };

  return {
    newTarget,
    updatedTargets: [...targets, newTarget],
    nextId: nextId + 1,
  };
}

export function createIceBlock(
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
  nextId: number,
  speed = 7.5
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
    size: 26,
    rotation: Math.random() * Math.PI * 2,
    vRot: (Math.random() - 0.5) * 0.15,
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

  // Make a clone of targets to modify in place
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
    if (nextBlock.y < 15) {
      nextBlock.y = 15;
      nextBlock.vy = Math.abs(nextBlock.vy) * 0.8;
      shatteredBlocks.push({ x: nextBlock.x, y: nextBlock.y });
    } else if (nextBlock.y > height - 15) {
      nextBlock.y = height - 15;
      nextBlock.vy = -Math.abs(nextBlock.vy) * 0.8;
      shatteredBlocks.push({ x: nextBlock.x, y: nextBlock.y });
    }

    let blockShattered = false;

    for (const target of updatedTargets) {
      if (target.hp <= 0) continue;
      const dist = Math.hypot(target.x - nextBlock.x, target.y - nextBlock.y);
      if (dist < target.radius + nextBlock.size * 0.5) {
        blockShattered = true;
        target.hp -= 2; // Ice block deals heavy crushing damage
        target.frozenTimer = 90; // Freeze target in place
        frozenTargets.push(target);
        shatteredBlocks.push({ x: nextBlock.x, y: nextBlock.y });

        if (target.hp <= 0) {
          killedTargets.push(target);
          pointsEarned += target.points * 2; // Frozen shatter bonus
        }
        break;
      }
    }

    if (!blockShattered && nextBlock.x < width + 50 && nextBlock.x > -50) {
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
  height = DEFAULT_CANVAS_HEIGHT
): Target[] {
  return targets
    .filter((t) => t.hp > 0 && t.x > -50)
    .map((t) => {
      const nextT = { ...t };
      if (nextT.frozenTimer > 0) {
        nextT.frozenTimer = Math.max(0, nextT.frozenTimer - 1 * dt);
      } else {
        nextT.x += nextT.vx * dt;
        nextT.y += nextT.vy * dt;
        nextT.pulsePhase += 0.05 * dt;

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
      }
      return nextT;
    });
}

export interface LaserHitResult {
  updatedTargets: Target[];
  hitAny: boolean;
  killedTargets: Target[];
  damagedPoints: Array<{ x: number; y: number; color: string }>;
}

export function checkLaserRayHit(
  eyeX: number,
  eyeY: number,
  aimX: number,
  aimY: number,
  laserType: LaserType,
  targets: Target[]
): LaserHitResult {
  const dx = aimX - eyeX;
  const dy = aimY - eyeY;
  const dist = Math.hypot(dx, dy) || 1;
  const dirX = dx / dist;
  const dirY = dy / dist;

  const weapon = WEAPONS[laserType];
  const hitExtra = weapon ? weapon.rayHitRadiusExtra : 8;
  const damage = weapon ? weapon.damage : 1;

  let hitAny = false;
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

        if (nextHp <= 0) {
          const killed = { ...t, hp: 0 };
          killedTargets.push(killed);
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
  count = 18,
  isIce = false
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * (isIce ? 5 : 4) + 1.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: isIce ? Math.random() * 5 + 2 : Math.random() * 3.5 + 1.5,
      color: isIce ? (Math.random() > 0.4 ? "#38bdf8" : "#ffffff") : color,
      alpha: 1,
      decay: Math.random() * 0.03 + (isIce ? 0.015 : 0.02),
      shape: isIce ? "crystal" : "circle",
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

export function updateFloatingTexts(texts: FloatingText[], dt: number): FloatingText[] {
  return texts
    .map((f) => ({
      ...f,
      y: f.y + f.vy * dt,
      alpha: f.alpha - 0.02 * dt,
    }))
    .filter((f) => f.alpha > 0);
}
