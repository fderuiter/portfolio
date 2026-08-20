export interface ArcadeGameMetadata {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  genre: string;
  description: string;
  mechanics: string[];
  techStack: string[];
  accentColor: string;
  borderHover: string;
  badgeBg: string;
  storageKey?: string;
  route: string;
}

export const ARCADE_GAMES_METADATA: ArcadeGameMetadata[] = [
  {
    id: "working-with-duck",
    slug: "working-with-duck",
    title: "Working With Duck",
    subtitle: "Pet Simulation & Multitasking Arcade",
    genre: "Pet Simulation Arcade",
    description: "Balance shipping code deadlines against managing Duck — an autonomous, fluffy white golden retriever puppy.",
    mechanics: ["Puppy Hunger/Joy Bars", "Treat Physics Toss", "Deadlines Countdown"],
    techStack: ["React 19 Hooks", "Physics Step Engine", "TailwindCSS"],
    accentColor: "text-amber-400",
    borderHover: "hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    storageKey: "working_duck_high_score",
    route: "/arcade/working-with-duck",
  },
  {
    id: "laser-loon",
    slug: "laser-loon",
    title: "Laser Loon: Quest for the State Flag",
    subtitle: "Civic Arcade & Physics Raycast Campaign",
    genre: "Civic Arcade Shooter",
    description: "Pilot submission F277 Laser Loon through four campaign acts from Lake Minnetonka to the State Capitol dome, blasting rival flags and red tape.",
    mechanics: ["Raycast Laser Optics", "Glacial Cryo-Shatter Combos", "Loon Tremolo Ultimate", "Campaign Boss Battles"],
    techStack: ["HTML5 Canvas 2D", "Web Audio Dual-Synth", "Multi-Phase AI Engine"],
    accentColor: "text-red-400",
    borderHover: "hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    badgeBg: "bg-red-500/10 text-red-400 border-red-500/30",
    storageKey: "laser_loon_high_score",
    route: "/arcade/laser-loon",
  },
  {
    id: "quasi-puzzler",
    slug: "quasi-puzzler",
    title: "Quasi-Perfect Puzzler",
    subtitle: "Formal Verification & Lean 4 AST Logic",
    genre: "Formal Logic Puzzle",
    description: "Lean-style formal verification arcade. Drag and apply tactics to simplify mathematical AST goals and preserve theorem morality.",
    mechanics: ["AST Goal Decomposition", "Tactic Inference Engine", "Dynamic Proof Tree"],
    techStack: ["Interactive AST Graph", "Formal Methods Solver", "Web Worker"],
    accentColor: "text-purple-400",
    borderHover: "hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    storageKey: "quasi_puzzle_high_score",
    route: "/arcade/quasi-puzzler",
  },
  {
    id: "garmin-watch",
    slug: "garmin-watch",
    title: "Monkey C Mayhem: Garmin Schvitz App",
    subtitle: "Embedded Systems & Garmin Schvitz App Simulator",
    genre: "Embedded Simulation",
    description: "Circular 280×280 Monkey C Mayhem smartwatch simulator running the Garmin Schvitz App artifact under strict 32KB RAM constraints.",
    mechanics: ["32KB RAM Allocation Tracker", "GC Sweep Pressure", "Display Condensation Wipe"],
    techStack: ["Monkey C Runtime Simulation", "Canvas Bitmaps", "Memory Profiler"],
    accentColor: "text-amber-400",
    borderHover: "hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    storageKey: "garmin_runner_high_score",
    route: "/arcade/garmin-watch",
  },
  {
    id: "clinical-chaos",
    slug: "clinical-chaos",
    title: "Clinical Trial Chaos: CDISC Compliance",
    subtitle: "FDA 21 CFR Part 11 & SDTM Arcade",
    genre: "Regulatory Compliance Arcade",
    description: "Fast-paced compliance arcade. Map clinical variables across SDTM domains (DM, VS, AE, LB), sign electronic submissions, and survive FDA auditor scrutiny.",
    mechanics: ["SDTM Variable Sorting", "Part 11 Electronic Signature", "Auditor Stress Meter"],
    techStack: ["CDISC ODM Validator", "Audit Trail Engine", "Time-Attack State Machine"],
    accentColor: "text-emerald-400",
    borderHover: "hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    storageKey: "clinical_chaos_high_score",
    route: "/arcade/clinical-chaos",
  },
  {
    id: "retro-labyrinth",
    slug: "retro-labyrinth",
    title: "Retro Labyrinth: Graveyard Roguelike",
    subtitle: "Dungeon Crawler & CRT Phosphor Engine",
    genre: "Dungeon Roguelike",
    description: "Dungeon crawler exploring abandoned codebases. Navigate TSP dynamic shifting walls, wield developer weapons (npm install, git push -f), and defeat the 3D FaceForge boss.",
    mechanics: ["TSP Dynamic Shifting Walls", "Developer Weapons (npm i, git push -f)", "3D Wireframe Normal Boss"],
    techStack: ["Procedural Maze Generation", "3D Projection Engine", "CRT Shader Pipeline"],
    accentColor: "text-rose-400",
    borderHover: "hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    badgeBg: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    storageKey: "retro_labyrinth_high_score",
    route: "/arcade/retro-labyrinth",
  },
  {
    id: "meme-vault",
    slug: "meme-vault",
    title: "Secret Meme Vault & Soundboard",
    subtitle: "Developer Soundboard & Easter Egg Trophies",
    genre: "Secret Easter Egg Room",
    description: "Unlockable developer & MedTech secret chamber. Trigger synthesized audio soundbites, collect site easter egg achievements, and browse curated engineering memes.",
    mechanics: ["8-Channel Web Audio Soundboard", "Easter Egg Achievement Tracker", "Interactive Meme Deck"],
    techStack: ["Web Audio API", "LocalStorage State", "Phosphor CRT Shader", "React 19"],
    accentColor: "text-emerald-400",
    borderHover: "hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    storageKey: "unlocked_meme_vault",
    route: "/arcade/meme-vault",
  },
];
