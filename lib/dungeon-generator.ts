export interface Player {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  weaponName: string;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
}

export interface Loot {
  id: number;
  x: number;
  y: number;
  name: string;
  type: "weapon" | "potion";
  value: number;
}

export interface DungeonState {
  grid: string[][];
  size: number;
  player: Player;
  enemies: Enemy[];
  loot: Loot[];
  scaleExplanation: string[];
}

export interface ArchivedRepoData {
  name: string;
  commitCount: number;
  stars: number;
  languageBreakdown: unknown;
}

export function generateDungeon(repo: ArchivedRepoData | null | undefined): DungeonState {
  // If repo is null, return the pre-designed offline fallback map
  if (!repo) {
    const size = 7;
    const grid = [
      ["#", "#", "#", "#", "#", "#", "#"],
      ["#", ".", ".", ".", ".", ".", "#"],
      ["#", ".", "#", ".", "#", ".", "#"],
      ["#", ".", ".", ".", ".", ".", "#"],
      ["#", ".", "#", ".", "#", ".", "#"],
      ["#", ".", ".", ".", ".", ".", "#"],
      ["#", "#", "#", "#", "#", "#", "#"],
    ];

    const player: Player = {
      x: 1,
      y: 1,
      hp: 50,
      maxHp: 50,
      atk: 10,
      weaponName: "Basic Debugger",
    };

    const enemies: Enemy[] = [
      {
        id: 1,
        x: 5,
        y: 1,
        name: "Offline Legacy Bug",
        hp: 25,
        maxHp: 25,
        atk: 6,
      },
      {
        id: 2,
        x: 1,
        y: 5,
        name: "Unresolved Core Exception",
        hp: 30,
        maxHp: 30,
        atk: 8,
      },
    ];

    const loot: Loot[] = [
      {
        id: 1,
        x: 5,
        y: 5,
        name: "Offline Patch Potion (+20 HP)",
        type: "potion",
        value: 20,
      },
      {
        id: 2,
        x: 3,
        y: 3,
        name: "Offline Sword of Hotfix (+8 Atk)",
        type: "weapon",
        value: 8,
      },
    ];

    // Place player, enemies, loot, and exit on grid
    grid[player.y][player.x] = "@";
    for (const e of enemies) {
      grid[e.y][e.x] = "E";
    }
    for (const l of loot) {
      grid[l.y][l.x] = "L";
    }
    grid[5][3] = "D";

    return {
      grid,
      size,
      player,
      enemies,
      loot,
      scaleExplanation: [
        "Running in Offline Fallback Mode.",
        "Dungeon Layout: Default 7x7 Pre-designed Map.",
        "Loot Quality: Basic offline patches.",
        "Enemies spawned: Static local bugs.",
      ],
    };
  }

  // --- Dynamic Generation based on metrics ---
  const commitCount = repo.commitCount || 100;
  const stars = repo.stars || 0;
  const languages = (repo.languageBreakdown as Record<string, number>) || { "Legacy Code": 100 };

  // Calculate layout size from commit count (odd number between 7 and 15)
  let rawSize = Math.min(15, Math.max(7, Math.floor(Math.sqrt(commitCount))));
  if (rawSize % 2 === 0) {
    rawSize += 1;
  }
  const size = rawSize;

  // Initialize N x N grid of walls
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill("#"));

  // Carve out corridors and open paths
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (
        y === Math.floor(size / 2) || 
        x === Math.floor(size / 2) || 
        (y % 2 === 1 && x % 2 === 1) ||
        Math.random() > 0.4
      ) {
        grid[y][x] = ".";
      }
    }
  }

  const player: Player = {
    x: 1,
    y: 1,
    hp: 50 + stars * 5,
    maxHp: 50 + stars * 5,
    atk: 10 + Math.floor(stars * 1.5),
    weaponName: "Fresh Clone Branch",
  };

  // Determine language distribution for enemy names
  const langNames = Object.keys(languages);
  const getWeightedLanguage = (): string => {
    if (langNames.length === 0) return "Unknown Bug";
    const rand = Math.random() * 100;
    let sum = 0;
    for (const name of langNames) {
      sum += languages[name];
      if (rand <= sum) return name;
    }
    return langNames[0];
  };

  const difficultyMultiplier = 1 + stars * 0.2;
  const numEnemies = Math.max(2, Math.floor(size / 2));
  const enemies: Enemy[] = [];

  const findFreeCell = (excludeX: number, excludeY: number): { x: number; y: number } | null => {
    const attempts = 100;
    for (let i = 0; i < attempts; i++) {
      const rx = Math.floor(Math.random() * (size - 2)) + 1;
      const ry = Math.floor(Math.random() * (size - 2)) + 1;
      if (grid[ry][rx] === "." && (rx !== excludeX || ry !== excludeY)) {
        return { x: rx, y: ry };
      }
    }
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        if (grid[y][x] === "." && (x !== excludeX || y !== excludeY)) {
          return { x, y };
        }
      }
    }
    return null;
  };

  // Spawn enemies
  for (let i = 0; i < numEnemies; i++) {
    const cell = findFreeCell(player.x, player.y);
    if (cell) {
      const lang = getWeightedLanguage();
      const baseHp = 15 + Math.floor(Math.random() * 10);
      const baseAtk = 5 + Math.floor(Math.random() * 4);
      enemies.push({
        id: i + 1,
        x: cell.x,
        y: cell.y,
        name: `${lang} Sentinel`,
        hp: Math.round(baseHp * difficultyMultiplier),
        maxHp: Math.round(baseHp * difficultyMultiplier),
        atk: Math.round(baseAtk * difficultyMultiplier),
      });
    }
  }

  // Spawn loot
  const numLoot = Math.max(1, Math.floor(stars / 2) + 1);
  const loot: Loot[] = [];
  const dominantLang = langNames.sort((a, b) => languages[b] - languages[a])[0] || "Code";

  for (let i = 0; i < numLoot; i++) {
    const cell = findFreeCell(player.x, player.y);
    if (cell) {
      const isWeapon = Math.random() > 0.5;
      if (isWeapon) {
        const value = 5 + Math.round(stars * 2.5);
        loot.push({
          id: i + 1,
          x: cell.x,
          y: cell.y,
          name: `${dominantLang} Blade (+${value} Atk)`,
          type: "weapon",
          value,
        });
      } else {
        const value = 15 + stars * 5;
        loot.push({
          id: i + 1,
          x: cell.x,
          y: cell.y,
          name: `Sentry Patch (+${value} HP)`,
          type: "potion",
          value,
        });
      }
    }
  }

  // Set Player start position on grid
  grid[player.y][player.x] = ".";
  
  let exitX = size - 2;
  let exitY = size - 2;
  grid[exitY][exitX] = ".";
  
  if (exitX === player.x && exitY === player.y) {
    exitX = Math.floor(size / 2);
    exitY = Math.floor(size / 2);
    grid[exitY][exitX] = ".";
  }

  grid[player.y][player.x] = "@";
  for (const e of enemies) {
    grid[e.y][e.x] = "E";
  }
  for (const l of loot) {
    grid[l.y][l.x] = "L";
  }
  grid[exitY][exitX] = "D";

  const breakdownStr = langNames.map(name => `${name}: ${languages[name]}%`).join(", ");

  return {
    grid,
    size,
    player,
    enemies,
    loot,
    scaleExplanation: [
      `Dungeon: "${repo.name}"`,
      `Layout Size: ${size}x${size} Grid (scaled from ${commitCount} commits)`,
      `Loot Quality: Star Rating ${stars} (+${Math.round(stars * 2.5)} weapon boost)`,
      `Enemies Spawned: Weighted by language percentages (${breakdownStr})`,
    ],
  };
}
