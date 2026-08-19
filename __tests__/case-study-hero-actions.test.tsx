import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { CaseStudyHeroActions } from "@/components/CaseStudyHeroActions";

describe("CaseStudyHeroActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders GitHub repository link with formatted repo name and live stats", () => {
    render(
      <CaseStudyHeroActions
        slug="duckdeploy"
        githubUrl="https://github.com/fderuiter/duckdeploy"
        primaryLanguage="TypeScript"
        stats={{
          stars: 42,
          forks: 5,
          openIssues: 0,
          commitsCount: 120,
          languages: [
            { name: "TypeScript", percentage: 95 },
            { name: "JavaScript", percentage: 5 },
          ],
          recentCommits: [],
          commitActivity: [],
          updatedAt: "2026-08-18T12:00:00Z",
        }}
      />
    );

    const githubLink = screen.getByRole("link", { name: /view on github|fderuiter\/duckdeploy/i });
    expect(githubLink).toBeDefined();
    expect(githubLink.getAttribute("href")).toBe("https://github.com/fderuiter/duckdeploy");
    expect(screen.getByText("42")).toBeDefined(); // Stars
    expect(screen.getByText("120")).toBeDefined(); // Commits
  });

  it("renders platform-agnostic Kaggle notebook link when external_platform_type is kaggle", () => {
    render(
      <CaseStudyHeroActions
        slug="cardiac-risk-modeling"
        externalPlatformUrl="https://www.kaggle.com/code/fredderuiter/fred-predicting-heart-disease"
        externalPlatformType="kaggle"
        primaryLanguage="Python"
      />
    );

    const kaggleLink = screen.getByRole("link", { name: /explore on kaggle/i });
    expect(kaggleLink).toBeDefined();
    expect(kaggleLink.getAttribute("href")).toBe(
      "https://www.kaggle.com/code/fredderuiter/fred-predicting-heart-disease"
    );
  });

  it("renders interactive studio launcher button when interactiveUrl is provided", () => {
    render(
      <CaseStudyHeroActions
        slug="crf-xl"
        githubUrl="https://github.com/fderuiter/crf-xl"
        interactiveUrl="/simulator"
        interactiveLabel="Launch CRF Studio"
        primaryLanguage="TypeScript"
      />
    );

    const studioLink = screen.getByRole("link", { name: /launch crf studio/i });
    expect(studioLink).toBeDefined();
    expect(studioLink.getAttribute("href")).toBe("/simulator");
  });

  it("renders simulated telemetry gracefully when stats are not provided", () => {
    render(
      <CaseStudyHeroActions
        slug="promptops"
        githubUrl="https://github.com/fderuiter/promptops"
        primaryLanguage="Python"
      />
    );

    const githubLink = screen.getByRole("link", { name: /view on github|fderuiter\/promptops/i });
    expect(githubLink).toBeDefined();
    expect(githubLink.getAttribute("href")).toBe("https://github.com/fderuiter/promptops");
  });
});

