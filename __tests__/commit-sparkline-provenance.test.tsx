import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CommitSparkline } from "@/components/CommitSparkline";
import { generateMockCommitActivity } from "@/lib/github";

describe("CommitSparkline provenance labelling (#701)", () => {
  const activity = generateMockCommitActivity();

  // This suite asserts on the absence of text, so leaked renders from an
  // earlier case would make those assertions meaningless.
  afterEach(() => cleanup());

  it("shows the measured commit total for live data", () => {
    render(<CommitSparkline activity={[1, 2, 3]} provenance="live" />);

    expect(screen.getByText("6 Commits")).toBeTruthy();
    expect(screen.queryByText(/sample data/i)).toBeNull();
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
      "Total commits: 6"
    );
  });

  it("defaults to the measured presentation when no provenance is supplied", () => {
    render(<CommitSparkline activity={[4]} />);

    expect(screen.getByText("4 Commits")).toBeTruthy();
    expect(screen.queryByText(/sample data/i)).toBeNull();
  });

  it.each(["live-partial", "simulated"] as const)(
    "labels a %s timeline as sample data instead of a commit count",
    (provenance) => {
      render(<CommitSparkline activity={activity} provenance={provenance} />);

      // A fabricated curve must never be presented as a measured commit total.
      expect(screen.getByText(/sample data/i)).toBeTruthy();
      expect(screen.queryByText(/\d+ Commits/)).toBeNull();
    }
  );

  it("tells assistive technology that a fallback timeline is not real history", () => {
    render(<CommitSparkline activity={activity} provenance="simulated" />);

    expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
      "does not show real commit history"
    );
  });
});
