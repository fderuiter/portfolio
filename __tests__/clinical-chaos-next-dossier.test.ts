import { describe, it, expect } from "vitest";
import {
  selectNextUrgentSubject,
  type ClinicalSubject,
} from "@/lib/clinical-trial-chaos";

// #834 prompt 3: after a submission the most urgent pending dossier loads.
const subject = (
  id: string,
  overrides: Partial<ClinicalSubject> = {}
): ClinicalSubject => ({
  id,
  subjectLabel: id.toUpperCase(),
  studySite: "Site 001",
  observations: [],
  status: "queued",
  timeRemaining: 30,
  maxTime: 40,
  createdAt: 1000,
  ...overrides,
});

describe("selectNextUrgentSubject (#834)", () => {
  it("returns null for an empty queue or one with nothing pending", () => {
    expect(selectNextUrgentSubject([])).toBeNull();
    expect(
      selectNextUrgentSubject([
        subject("a", { status: "submitted" }),
        subject("b", { status: "expired" }),
        subject("c", { status: "rejected" }),
      ])
    ).toBeNull();
  });

  it("puts an SAE ahead of any routine dossier, however little time the routine one has", () => {
    const next = selectNextUrgentSubject([
      subject("routine", { timeRemaining: 2 }),
      subject("sae", { isSAE: true, timeRemaining: 25 }),
    ]);
    expect(next?.id).toBe("sae");
  });

  it("orders by least time remaining within the same priority", () => {
    const next = selectNextUrgentSubject([
      subject("slow", { timeRemaining: 30 }),
      subject("fast", { timeRemaining: 8 }),
      subject("sae-slow", { isSAE: true, timeRemaining: 20 }),
      subject("sae-fast", { isSAE: true, timeRemaining: 12 }),
    ]);
    expect(next?.id).toBe("sae-fast");
    expect(
      selectNextUrgentSubject([
        subject("slow", { timeRemaining: 30 }),
        subject("fast", { timeRemaining: 8 }),
      ])?.id
    ).toBe("fast");
  });

  it("breaks ties by arrival, then by id, independent of queue order", () => {
    const a = subject("a", { createdAt: 2000 });
    const b = subject("b", { createdAt: 1000 });
    const c = subject("c", { createdAt: 1000 });
    expect(selectNextUrgentSubject([a, c, b])?.id).toBe("b");
    expect(selectNextUrgentSubject([c, b, a])?.id).toBe("b");
  });

  it("skips non-pending dossiers", () => {
    expect(
      selectNextUrgentSubject([
        subject("done", { isSAE: true, status: "submitted" }),
        subject("open", { timeRemaining: 20 }),
      ])?.id
    ).toBe("open");
  });
});
