import { ArcadeEngine } from "@/lib/arcade/core/engine";
import {
  ActiveSideEffect,
  BossState,
  CRTThemeId,
  CyberdeckClassId,
  CyberdeckProfile,
  DEFAULT_WEAPONS,
  DungeonRoom,
  Enemy,
  FloatingNotification,
  HexMatrixPuzzle,
  ItemPickup,
  ParticleEffect,
  Weapon,
  WeaponId,
  calculateFOV,
  computeShortestTour,
  fireWeapon,
  generateClassicStage1,
  generateClassicStage2,
  generateRoguelikeCampaign,
  generateTSPRoom,
  generateHexMatrixPuzzle,
  selectHexCell,
  consumeBypassChip,
  renderWireframeMesh,
  updateEnemyAI,
  updateFaceForgeBoss,
  updateTSPMovingWalls,
  CRT_THEMES,
  CYBERDECK_CLASSES,
  loadCyberdeckProfile,
  STAGE_1_MAZE,
} from "@/lib/dungeon";
import { clamp } from "@/lib/game-utils";

export interface RetroLabyrinthConfig {
  classId?: CyberdeckClassId;
  gameMode?: "roguelike" | "classic";
  crtThemeId?: CRTThemeId;
}

export interface RetroLabyrinthState {
  gameMode: "roguelike" | "classic";
  stage: number;
  roomIndex: number;
  campaignRooms: DungeonRoom[];
  currentMaze: string[][];
  playerPosition: { x: number; y: number };
  playerHp: number;
  maxHp: number;
  score: number;
  highScore: number;
  gameStatus: "playing" | "victory" | "game_over";
  weapons: Weapon[];
  activeWeaponId: WeaponId;
  selectedWeaponIndex: number;
  cryptoCredits: number;
  visitedNodes: { x: number; y: number }[];
  tspTour: { x: number; y: number }[];
  faceForgeBoss: BossState | null;
  enemies: Enemy[];
  items: ItemPickup[];
  sideEffects: ActiveSideEffect[];
  floatingTexts: FloatingNotification[];
  particles: ParticleEffect[];
  visibleCells: boolean[][];
  exploredCells: boolean[][];
  hexPuzzle: HexMatrixPuzzle | null;
  crtThemeId: CRTThemeId;
  selectedClassId: CyberdeckClassId;
}

export interface RetroLabyrinthSnapshot {
  gameMode: "roguelike" | "classic";
  stage: number;
  roomIndex: number;
  totalRooms: number;
  playerPosition: { x: number; y: number };
  playerHp: number;
  maxHp: number;
  score: number;
  highScore: number;
  gameStatus: "playing" | "victory" | "game_over";
  weapons: Weapon[];
  activeWeaponId: WeaponId;
  selectedWeaponIndex: number;
  cryptoCredits: number;
  crtThemeId: CRTThemeId;
  selectedClassId: CyberdeckClassId;
}

const START_X = 1;
const START_Y = 1;

export class RetroLabyrinthEngine extends ArcadeEngine<RetroLabyrinthState, RetroLabyrinthSnapshot> {
  private tickCounter = 0;

  constructor(config: RetroLabyrinthConfig = {}) {
    const classId = config.classId ?? "script_kiddie";
    const selectedClass = CYBERDECK_CLASSES[classId] || CYBERDECK_CLASSES.script_kiddie;
    const gameMode = config.gameMode ?? "roguelike";
    const crtThemeId = config.crtThemeId ?? "emerald";

    const campaignRooms = gameMode === "roguelike" ? generateRoguelikeCampaign() : [];
    const currentMaze = gameMode === "roguelike" ? campaignRooms[0]?.maze || STAGE_1_MAZE : STAGE_1_MAZE;

    const initialWeapons = selectedClass.starterWeapons.map((id) => {
      const template = DEFAULT_WEAPONS[id] || DEFAULT_WEAPONS.npm_install;
      return { ...template };
    });

    const rows = currentMaze.length || 9;
    const cols = currentMaze[0]?.length || 15;
    const visibleCells = Array.from({ length: rows }, () => Array(cols).fill(false));
    const exploredCells = Array.from({ length: rows }, () => Array(cols).fill(false));

    super({
      gameMode,
      stage: 1,
      roomIndex: 0,
      campaignRooms,
      currentMaze,
      playerPosition: { x: START_X, y: START_Y },
      playerHp: selectedClass.baseHp,
      maxHp: selectedClass.baseHp,
      score: 0,
      highScore: 0,
      gameStatus: "playing",
      weapons: initialWeapons,
      activeWeaponId: initialWeapons[0]?.id || "npm_install",
      selectedWeaponIndex: 0,
      cryptoCredits: 0,
      visitedNodes: [],
      tspTour: [],
      faceForgeBoss: null,
      enemies: [],
      items: [],
      sideEffects: [],
      floatingTexts: [],
      particles: [],
      visibleCells,
      exploredCells,
      hexPuzzle: null,
      crtThemeId,
      selectedClassId: classId,
    });

    this.updateFOV();
  }

  public override init(): void {
    this.updateFOV();
  }

  public override update(dt: number): void {
    if (this.state.gameStatus !== "playing") return;
    this.tickCounter++;

    // Update enemy AI every 12 ticks
    if (this.tickCounter % 12 === 0) {
      if (this.state.enemies.length > 0) {
        const updatedEnemies = updateEnemyAI(
          this.state.enemies,
          this.state.playerPosition,
          this.state.currentMaze
        );
        this.state.enemies = updatedEnemies;
      }
    }

    // Update particles and floating texts
    this.state.particles = this.state.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        life: p.life - dt,
      }))
      .filter((p) => p.life > 0);

    this.state.floatingTexts = this.state.floatingTexts
      .map((t) => ({
        ...t,
        y: t.y - 10 * dt,
        life: t.life - dt,
      }))
      .filter((t) => t.life > 0);
  }

  public override render(ctx: CanvasRenderingContext2D, _alpha: number): void {
    if (!ctx) return;

    const maze = this.state.currentMaze;
    const rows = maze.length || 9;
    const cols = maze[0]?.length || 15;

    const canvasW = 240;
    const canvasH = 144;
    const cellW = canvasW / cols;
    const cellH = canvasH / rows;

    const theme = CRT_THEMES[this.state.crtThemeId] || CRT_THEMES.emerald;

    // Background clear
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Draw maze grid
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const char = maze[r][c];
        const px = c * cellW;
        const py = r * cellH;
        const isVisible = this.state.visibleCells[r]?.[c] ?? true;

        if (char === "#") {
          ctx.fillStyle = isVisible ? theme.primary : theme.dim;
          ctx.fillRect(px, py, cellW, cellH);
        } else if (char === "E") {
          ctx.fillStyle = theme.accent;
          ctx.fillRect(px + 2, py + 2, cellW - 4, cellH - 4);
        }
      }
    }

    // Draw player
    const pX = this.state.playerPosition.x * cellW;
    const pY = this.state.playerPosition.y * cellH;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(pX + 2, pY + 2, cellW - 4, cellH - 4);

    // Draw enemies
    ctx.fillStyle = "#ef4444";
    for (const enemy of this.state.enemies) {
      if (enemy.hp > 0) {
        ctx.fillRect(enemy.x * cellW + 2, enemy.y * cellH + 2, cellW - 4, cellH - 4);
      }
    }
  }

  public override createSnapshot(): RetroLabyrinthSnapshot {
    return {
      gameMode: this.state.gameMode,
      stage: this.state.stage,
      roomIndex: this.state.roomIndex,
      totalRooms: this.state.campaignRooms.length,
      playerPosition: { ...this.state.playerPosition },
      playerHp: this.state.playerHp,
      maxHp: this.state.maxHp,
      score: this.state.score,
      highScore: this.state.highScore,
      gameStatus: this.state.gameStatus,
      weapons: this.state.weapons.map((w) => ({ ...w })),
      activeWeaponId: this.state.activeWeaponId,
      selectedWeaponIndex: this.state.selectedWeaponIndex,
      cryptoCredits: this.state.cryptoCredits,
      crtThemeId: this.state.crtThemeId,
      selectedClassId: this.state.selectedClassId,
    };
  }

  public move(dx: number, dy: number): boolean {
    if (this.state.gameStatus !== "playing") return false;

    const newX = this.state.playerPosition.x + dx;
    const newY = this.state.playerPosition.y + dy;

    const maze = this.state.currentMaze;
    if (newY < 0 || newY >= maze.length || newX < 0 || newX >= maze[0].length) {
      return false;
    }

    const targetCell = maze[newY][newX];
    if (targetCell === "#") {
      return false; // Solid wall
    }

    this.state.playerPosition = { x: newX, y: newY };
    this.updateFOV();

    // Check exit
    if (targetCell === "E") {
      this.state.gameStatus = "victory";
      this.emit("victory", { score: this.state.score });
    }

    this.notifySubscribers();
    return true;
  }

  public fireActiveWeapon(): void {
    if (this.state.gameStatus !== "playing") return;

    const weapon = this.state.weapons[this.state.selectedWeaponIndex];
    if (!weapon || (weapon.ammo <= 0 && weapon.ammo !== -1)) return;

    if (weapon.ammo > 0) {
      weapon.ammo -= 1;
    }

    this.emit("fireWeapon", { weaponId: weapon.id });
    this.notifySubscribers();
  }

  public selectWeapon(index: number): void {
    if (index >= 0 && index < this.state.weapons.length) {
      this.state.selectedWeaponIndex = index;
      this.state.activeWeaponId = this.state.weapons[index].id;
      this.notifySubscribers();
    }
  }

  public setCrtTheme(themeId: CRTThemeId): void {
    this.state.crtThemeId = themeId;
    this.notifySubscribers();
  }

  public resetGame(): void {
    const selectedClass = CYBERDECK_CLASSES[this.state.selectedClassId] || CYBERDECK_CLASSES.script_kiddie;
    const campaignRooms = this.state.gameMode === "roguelike" ? generateRoguelikeCampaign() : [];
    const currentMaze = this.state.gameMode === "roguelike" ? campaignRooms[0]?.maze || STAGE_1_MAZE : STAGE_1_MAZE;

    this.state.campaignRooms = campaignRooms;
    this.state.currentMaze = currentMaze;
    this.state.playerPosition = { x: START_X, y: START_Y };
    this.state.playerHp = selectedClass.baseHp;
    this.state.score = 0;
    this.state.gameStatus = "playing";
    this.updateFOV();
    this.notifySubscribers();
  }

  private updateFOV(): void {
    const maze = this.state.currentMaze;
    const rows = maze.length || 9;
    const cols = maze[0]?.length || 15;

    const visible = calculateFOV(this.state.playerPosition, maze, 5);
    this.state.visibleCells = visible;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (visible[r]?.[c]) {
          if (!this.state.exploredCells[r]) this.state.exploredCells[r] = [];
          this.state.exploredCells[r][c] = true;
        }
      }
    }
  }
}
