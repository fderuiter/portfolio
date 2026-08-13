import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Audio Synthesizer & Sound Settings Engine", () => {
  const providerPath = path.resolve(__dirname, "../components/providers/AudioProvider.tsx");
  const navbarPath = path.resolve(__dirname, "../components/Navbar.tsx");
  const terminalPath = path.resolve(__dirname, "../components/SandboxTerminal.tsx");
  const skillsPath = path.resolve(__dirname, "../components/SkillsGrid.tsx");

  const providerContent = fs.readFileSync(providerPath, "utf-8");
  const navbarContent = fs.readFileSync(navbarPath, "utf-8");
  const terminalContent = fs.readFileSync(terminalPath, "utf-8");
  const skillsContent = fs.readFileSync(skillsPath, "utf-8");

  it("should have AudioProvider with correct state and profiles", () => {
    expect(providerContent).toContain('export type AudioProfile = "8-bit" | "90s-retro" | "ambient";');
    expect(providerContent).toContain("volume");
    expect(providerContent).toContain("muted");
    expect(providerContent).toContain("profile");
  });

  it("should generate proper ADSR real-time synthesizer profiles", () => {
    // 8-bit profile (square, fast attack, short decay)
    expect(providerContent).toContain('type = "square"');
    expect(providerContent).toContain("attack = 0.005");
    expect(providerContent).toContain("decay = 0.08");
    expect(providerContent).toContain("sustain = 0.1");

    // 90s retro profile (sawtooth)
    expect(providerContent).toContain('type = "sawtooth"');
    expect(providerContent).toContain("attack = 0.02");

    // Ambient profile (sine, slow attack, long release)
    expect(providerContent).toContain('type = "sine"');
    expect(providerContent).toContain("attack = 0.2");
  });

  it("should persist user configuration settings inside localStorage", () => {
    expect(providerContent).toContain('localStorage.getItem("sound_volume")');
    expect(providerContent).toContain('localStorage.getItem("sound_muted")');
    expect(providerContent).toContain('localStorage.getItem("sound_profile")');
    expect(providerContent).toContain('localStorage.setItem("sound_volume"');
    expect(providerContent).toContain('localStorage.setItem("sound_muted"');
    expect(providerContent).toContain('localStorage.setItem("sound_profile"');
  });

  it("should implement automatic high-contrast mode bypass to protect assistive technologies", () => {
    expect(providerContent).toContain('window.matchMedia?.("(forced-colors: active)")');
    expect(providerContent).toContain('window.matchMedia?.("(-ms-high-contrast: active)")');
    expect(providerContent).toContain("bypassActive");
  });

  it("should integrate sound panel and spatial hovering into the Navbar", () => {
    expect(navbarContent).toContain('import { useAudio } from "@/components/providers/AudioProvider";');
    expect(navbarContent).toContain("SOUND: {muted ? \"OFF\" : profile.toUpperCase()}");
    expect(navbarContent).toContain("onMouseEnter={handleLinkHover}");
    expect(navbarContent).toContain("const pan = (rect.left + rect.width / 2) / window.innerWidth * 2 - 1;");
  });

  it("should integrate terminal keystrokes, autocomplete and success audio feedback", () => {
    expect(terminalContent).toContain('const { playKeystroke, playAutocomplete, playSuccess } = useAudio();');
    expect(terminalContent).toContain("playKeystroke(char.charCodeAt(0));");
    expect(terminalContent).toContain("playAutocomplete();");
    expect(terminalContent).toContain("playSuccess();");
  });

  it("should integrate soft complementary audio feedback on skills grid hovers", () => {
    expect(skillsContent).toContain('const { playSkillHover } = useAudio();');
    expect(skillsContent).toContain("onMouseEnter={playSkillHover}");
  });
});
