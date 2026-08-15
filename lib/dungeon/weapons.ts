/**
 * Developer-Themed Weapons, Inventory & Side-Effects Engine
 */

import {
  ActiveSideEffect,
  BossState,
  Enemy,
  ParticleEffect,
  Weapon,
  WeaponId,
} from "./types";

export const DEFAULT_WEAPONS: Record<WeaponId, Weapon> = {
  npm_install: {
    id: "npm_install",
    name: "npm install",
    keyLabel: "[1]",
    ammo: 12,
    maxAmmo: 12,
    damage: 45,
    cooldownMs: 800,
    description: "Throws ball of 100K sub-dependencies at enemies in a wide blast radius.",
    sideEffect: "Simulates severe memory bloat & lag spike.",
    iconChar: "📦",
  },
  git_force_push: {
    id: "git_force_push",
    name: "git push --force",
    keyLabel: "[2]",
    ammo: 3,
    maxAmmo: 3,
    damage: 150,
    cooldownMs: 2500,
    description: "Vaporizes all standard enemies in the room with an irreversible git commit blast.",
    sideEffect: "Rewrites branch history & resets room score multiplier.",
    iconChar: "💥",
  },
  stack_overflow: {
    id: "stack_overflow",
    name: "Stack Overflow Copy-Paste",
    keyLabel: "[3]",
    ammo: 4,
    maxAmmo: 4,
    damage: 0,
    cooldownMs: 1500,
    description: "Instantly injects undocumented code snippet to restore +40 HP.",
    sideEffect: "Keybind Desync: Swaps WASD directional controls for 8 seconds.",
    iconChar: "📋",
  },
  emp_blast: {
    id: "emp_blast",
    name: "EMP Blast",
    keyLabel: "[SPACE]",
    ammo: 999,
    maxAmmo: 999,
    damage: 5,
    cooldownMs: 4000,
    description: "Fires an electromagnetic pulse that stuns all security drones.",
    sideEffect: "Temporary drone firmware lock.",
    iconChar: "⚡",
  },
};

export interface WeaponFireResult {
  updatedWeapons: Record<WeaponId, Weapon>;
  updatedEnemies: Enemy[];
  updatedBoss?: BossState;
  updatedPlayerHp: number;
  scoreGained: number;
  particles: ParticleEffect[];
  activeSideEffect?: ActiveSideEffect;
  message: string;
  success: boolean;
}

/**
 * Fires a developer weapon with damage, particle generation, and humorous side effect.
 */
export function fireWeapon(
  weaponId: WeaponId,
  weapons: Record<WeaponId, Weapon>,
  playerX: number,
  playerY: number,
  playerHp: number,
  maxPlayerHp: number,
  enemies: Enemy[],
  boss: BossState | undefined,
  nowMs: number
): WeaponFireResult {
  const weapon = weapons[weaponId];
  if (!weapon || weapon.ammo <= 0) {
    return {
      updatedWeapons: weapons,
      updatedEnemies: enemies,
      updatedBoss: boss,
      updatedPlayerHp: playerHp,
      scoreGained: 0,
      particles: [],
      message: `Out of ammo for ${weapon?.name || weaponId}!`,
      success: false,
    };
  }

  // Deduct ammo
  const nextWeapons = {
    ...weapons,
    [weaponId]: {
      ...weapon,
      ammo: Math.max(0, weapon.ammo - 1),
    },
  };

  const particles: ParticleEffect[] = [];
  let scoreGained = 0;
  let updatedPlayerHp = playerHp;
  let activeSideEffect: ActiveSideEffect | undefined;
  let message = "";

  let updatedEnemies = [...enemies];
  let updatedBoss = boss ? { ...boss } : undefined;

  switch (weaponId) {
    case "npm_install": {
      // Throws 100K sub-dependencies in AoE radius (approx 4 tiles)
      const aoeRadius = 4.5;
      message = "📦 npm install executed! 100,000 node_modules hurled!";

      // Side Effect: Severe lag spike
      activeSideEffect = {
        type: "lag_spike",
        title: "DEPENDENCY_BLOAT.LOG",
        description: "Resolving 84,219 transitive dependencies... frame latency elevated.",
        expiresAt: nowMs + 4000,
      };

      // Spawn node_modules particles
      const chars = ["node_modules", "left-pad", "is-even", "lodash", "babel", "webpack"];
      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2.5;
        particles.push({
          x: playerX,
          y: playerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: "#f59e0b",
          alpha: 1,
          decay: 0.03,
          radius: 4,
          char: chars[i % chars.length],
        });
      }

      // Damage standard enemies in radius
      updatedEnemies = updatedEnemies
        .map((e) => {
          const dist = Math.hypot(e.x - playerX, e.y - playerY);
          if (dist <= aoeRadius) {
            const nextHp = e.hp - weapon.damage;
            if (nextHp <= 0) {
              scoreGained += 150;
              return null;
            }
            return {
              ...e,
              hp: nextHp,
              state: "stunned",
              stunTimerMs: 2500,
            };
          }
          return e;
        })
        .filter((e): e is Enemy => e !== null);

      // Damage boss if nearby
      if (updatedBoss && !updatedBoss.defeated) {
        const bossDist = Math.hypot(updatedBoss.x - playerX, updatedBoss.y - playerY);
        if (bossDist <= aoeRadius + 1) {
          const nextBossHp = updatedBoss.hp - weapon.damage;
          if (nextBossHp <= 0) {
            updatedBoss = { ...updatedBoss, hp: 0, defeated: true };
            scoreGained += 1000;
          } else {
            updatedBoss = { ...updatedBoss, hp: nextBossHp };
          }
        }
      }
      break;
    }

    case "git_force_push": {
      // Vaporizes regular enemies in entire room
      message = "💥 git push --force: Room history obliterated!";

      // Side Effect: History rewrite
      activeSideEffect = {
        type: "history_rewritten",
        title: "FORCE_PUSH_EXECUTED",
        description: "Branch history rewritten. Upstream refs permanently desynchronized.",
        expiresAt: nowMs + 5000,
      };

      // Massive red shockwave particles
      for (let i = 0; i < 40; i++) {
        const angle = (i * 2 * Math.PI) / 40;
        const speed = 1.0 + Math.random() * 3.5;
        particles.push({
          x: playerX,
          y: playerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: "#ef4444",
          alpha: 1,
          decay: 0.02,
          radius: 6,
          char: "FORCE",
        });
      }

      // Eliminate all regular enemies
      scoreGained += updatedEnemies.length * 100;
      updatedEnemies = [];

      // Heavy damage to Boss
      if (updatedBoss && !updatedBoss.defeated) {
        const nextBossHp = updatedBoss.hp - weapon.damage;
        if (nextBossHp <= 0) {
          updatedBoss = { ...updatedBoss, hp: 0, defeated: true };
          scoreGained += 1000;
        } else {
          updatedBoss = { ...updatedBoss, hp: nextBossHp };
        }
      }
      break;
    }

    case "stack_overflow": {
      // Restores +40 HP
      const healAmount = 40;
      updatedPlayerHp = Math.min(maxPlayerHp, playerHp + healAmount);
      message = `📋 Stack Overflow code applied: +${healAmount} HP!`;

      // Side Effect: Scrambled keybinds
      activeSideEffect = {
        type: "scrambled_keys",
        title: "KEYBIND_DESYNC_WARNING",
        description: "Copied untested code from 2011! Directional keybindings are inverted!",
        expiresAt: nowMs + 8000,
      };

      // Green healing particles
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        particles.push({
          x: playerX,
          y: playerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: "#10b981",
          alpha: 1,
          decay: 0.04,
          radius: 4,
          char: "+HP",
        });
      }
      break;
    }

    case "emp_blast": {
      message = "⚡ EMP shockwave stunned all active security drones!";
      updatedEnemies = updatedEnemies.map((e) => ({
        ...e,
        state: "stunned",
        stunTimerMs: 4000,
      }));

      // Blue EMP shockwave ring
      for (let i = 0; i < 30; i++) {
        const angle = (i * 2 * Math.PI) / 30;
        particles.push({
          x: playerX,
          y: playerY,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          color: "#38bdf8",
          alpha: 1,
          decay: 0.03,
          radius: 3,
          char: "EMP",
        });
      }
      break;
    }
  }

  return {
    updatedWeapons: nextWeapons,
    updatedEnemies,
    updatedBoss,
    updatedPlayerHp,
    scoreGained,
    particles,
    activeSideEffect,
    message,
    success: true,
  };
}
