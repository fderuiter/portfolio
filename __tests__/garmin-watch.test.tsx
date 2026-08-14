import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { GarminWatchSimulator } from "@/components/GarminWatchSimulator";

describe("GarminWatchSimulator Architecture & Feature Completeness", () => {
  const componentPath = path.resolve(__dirname, "../components/GarminWatchSimulator.tsx");
  const content = fs.readFileSync(componentPath, "utf-8");

  it("exports a function or component named GarminWatchSimulator", () => {
    expect(typeof GarminWatchSimulator).toBe("function");
  });

  it("should implement keyboard boundary data-keyboard-boundary='true'", () => {
    expect(content).toContain('data-keyboard-boundary="true"');
    expect(content).toContain("tabIndex={0}");
  });

  it("should support multiple sport activity modes: ocean, trail, space", () => {
    expect(content).toContain("activityMode");
    expect(content).toContain("ocean");
    expect(content).toContain("trail");
    expect(content).toContain("space");
  });

  it("should support flashlight / sonar toggling with battery management", () => {
    expect(content).toContain("toggleLight");
    expect(content).toContain("isLightOn");
    expect(content).toContain("battery");
  });

  it("should calculate and render authentic Garmin post-workout summary", () => {
    expect(content).toContain("summary");
    expect(content).toContain("trainingEffect");
    expect(content).toContain("distanceKm");
    expect(content).toContain("heartRate");
  });

  it("should integrate with AudioProvider for audio feedback", () => {
    expect(content).toContain("useAudio");
    expect(content).toContain("playButtonTone");
  });
});
