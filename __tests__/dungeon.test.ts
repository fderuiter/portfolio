import { describe, it, expect } from "vitest";
import { generateDungeon, type ArchivedRepoData } from "@/lib/dungeon-generator";

describe("404 Dungeon Generator Logic", () => {
  it("should generate a default offline fallback map if repo is null", () => {
    const dungeon = generateDungeon(null);
    expect(dungeon).toBeDefined();
    expect(dungeon.size).toBe(7);
    expect(dungeon.grid[1][1]).toBe("@"); // Player start
    expect(dungeon.player.weaponName).toBe("Basic Debugger");
    expect(dungeon.scaleExplanation[0]).toContain("Running in Offline Fallback Mode");
  });

  it("should generate a default offline fallback map if repo is undefined", () => {
    const dungeon = generateDungeon(undefined);
    expect(dungeon).toBeDefined();
    expect(dungeon.size).toBe(7);
  });

  it("should scale dungeon size based on commitCount", () => {
    // 49 commits -> sqrt is 7. Size should be 7
    const repoLow: ArchivedRepoData = {
      name: "low-commits-repo",
      commitCount: 49,
      stars: 5,
      languageBreakdown: { "TypeScript": 100 },
    };
    const dungeonLow = generateDungeon(repoLow);
    expect(dungeonLow.size).toBe(7);

    // 225 commits -> sqrt is 15. Size should be 15
    const repoHigh: ArchivedRepoData = {
      name: "high-commits-repo",
      commitCount: 225,
      stars: 10,
      languageBreakdown: { "TypeScript": 100 },
    };
    const dungeonHigh = generateDungeon(repoHigh);
    expect(dungeonHigh.size).toBe(15);
  });

  it("should scale difficulty HP based on stars", () => {
    const repoLow: ArchivedRepoData = {
      name: "low-stars",
      commitCount: 100,
      stars: 0,
      languageBreakdown: { "Rust": 100 },
    };
    const dungeonLow = generateDungeon(repoLow);
    // player hp base is 50 + stars * 5 = 50
    expect(dungeonLow.player.hp).toBe(50);

    const repoHigh: ArchivedRepoData = {
      name: "high-stars",
      commitCount: 100,
      stars: 10,
      languageBreakdown: { "Rust": 100 },
    };
    const dungeonHigh = generateDungeon(repoHigh);
    // player hp is 50 + 10 * 5 = 100
    expect(dungeonHigh.player.hp).toBe(100);
  });

  it("should generate enemy names weighted by language percentages", () => {
    const repo: ArchivedRepoData = {
      name: "multi-lang-repo",
      commitCount: 100,
      stars: 3,
      languageBreakdown: { "TypeScript": 100 }, // 100% TS
    };
    const dungeon = generateDungeon(repo);
    expect(dungeon.enemies.length).toBeGreaterThan(0);
    for (const enemy of dungeon.enemies) {
      expect(enemy.name).toBe("TypeScript Sentinel");
    }
  });
});
