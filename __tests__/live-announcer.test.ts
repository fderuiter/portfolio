import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  LiveAnnouncer,
  sanitizePII,
  type AnnouncerState,
} from "@/lib/a11y/announcer";

describe("LiveAnnouncer Engine (Pure State Machine & Internal Timers)", () => {
  let announcer: LiveAnnouncer;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    announcer = new LiveAnnouncer();
  });

  afterEach(() => {
    announcer.destroy();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("Initial State & Snapshot Subscriptions", () => {
    it("initializes with null active items and empty queues", () => {
      const snapshot: AnnouncerState = announcer.getSnapshot();
      expect(snapshot.activePolite).toBeNull();
      expect(snapshot.activeAssertive).toBeNull();
      expect(snapshot.politeQueue).toEqual([]);
      expect(snapshot.assertiveQueue).toEqual([]);
    });

    it("notifies subscribers when announcements are made and states transition", () => {
      const listener = vi.fn();
      const unsubscribe = announcer.subscribe(listener);

      announcer.announce("First polite update", "polite");
      expect(listener).toHaveBeenCalledTimes(1);
      expect(announcer.getSnapshot().activePolite?.text).toBe("First polite update");

      vi.advanceTimersByTime(3000);
      expect(listener).toHaveBeenCalledTimes(2);
      expect(announcer.getSnapshot().activePolite).toBeNull();

      unsubscribe();
      announcer.announce("Second update after unsubscribe", "polite");
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("returns an immutable snapshot with referential integrity across mutations", () => {
      const snap1 = announcer.getSnapshot();
      announcer.announce("Test message", "polite");
      const snap2 = announcer.getSnapshot();

      expect(snap1).not.toBe(snap2);
      expect(snap1.activePolite).toBeNull();
      expect(snap2.activePolite?.text).toBe("Test message");
    });
  });

  describe("Polite FIFO Queuing Mechanics", () => {
    it("immediately activates the first polite announcement when idle", () => {
      const item = announcer.announce("System initialized", "polite");
      expect(item).not.toBeNull();
      expect(item?.text).toBe("System initialized");
      expect(item?.priority).toBe("polite");

      const state = announcer.getSnapshot();
      expect(state.activePolite?.text).toBe("System initialized");
      expect(state.politeQueue).toHaveLength(0);
    });

    it("queues subsequent polite messages in FIFO order without interrupting active message", () => {
      announcer.announce("Message 1", "polite");
      announcer.announce("Message 2", "polite");
      announcer.announce("Message 3", "polite");

      let state = announcer.getSnapshot();
      expect(state.activePolite?.text).toBe("Message 1");
      expect(state.politeQueue).toHaveLength(2);
      expect(state.politeQueue[0].text).toBe("Message 2");
      expect(state.politeQueue[1].text).toBe("Message 3");

      // Advance past Message 1 (3000ms)
      vi.advanceTimersByTime(3000);
      state = announcer.getSnapshot();
      expect(state.activePolite?.text).toBe("Message 2");
      expect(state.politeQueue).toHaveLength(1);
      expect(state.politeQueue[0].text).toBe("Message 3");

      // Advance past Message 2 (3000ms)
      vi.advanceTimersByTime(3000);
      state = announcer.getSnapshot();
      expect(state.activePolite?.text).toBe("Message 3");
      expect(state.politeQueue).toHaveLength(0);

      // Advance past Message 3 (3000ms)
      vi.advanceTimersByTime(3000);
      state = announcer.getSnapshot();
      expect(state.activePolite).toBeNull();
      expect(state.politeQueue).toHaveLength(0);
    });

    it("does not reset the active timer when new polite messages are queued", () => {
      announcer.announce("Message 1", "polite");

      // Advance 2000ms into Message 1
      vi.advanceTimersByTime(2000);
      expect(announcer.getSnapshot().activePolite?.text).toBe("Message 1");

      // Queue Message 2 at t = 2000ms
      announcer.announce("Message 2", "polite");

      // Advance 1000ms more (t = 3000ms total for Message 1)
      vi.advanceTimersByTime(1000);
      expect(announcer.getSnapshot().activePolite?.text).toBe("Message 2");
    });
  });

  describe("Assertive Preemption Mechanics", () => {
    it("immediately preempts active polite announcement and activates assertive alert", () => {
      announcer.announce("Long background status update", "polite");
      expect(announcer.getSnapshot().activePolite?.text).toBe("Long background status update");
      expect(announcer.getSnapshot().activeAssertive).toBeNull();

      // Assertive announcement preempts
      announcer.announce("Critical network error detected!", "assertive");
      const state = announcer.getSnapshot();

      expect(state.activePolite).toBeNull();
      expect(state.activeAssertive?.text).toBe("Critical network error detected!");
      expect(state.activeAssertive?.priority).toBe("assertive");
    });

    it("resumes pending polite queue after assertive queue drains", () => {
      announcer.announce("Polite 1", "polite");
      announcer.announce("Polite 2", "polite");

      // Preempt with assertive message
      announcer.announce("Assertive 1", "assertive");

      let state = announcer.getSnapshot();
      expect(state.activePolite).toBeNull();
      expect(state.activeAssertive?.text).toBe("Assertive 1");
      expect(state.politeQueue).toHaveLength(1);
      expect(state.politeQueue[0].text).toBe("Polite 2");

      // Advance 3000ms to complete Assertive 1
      vi.advanceTimersByTime(3000);
      state = announcer.getSnapshot();
      expect(state.activeAssertive).toBeNull();
      expect(state.activePolite?.text).toBe("Polite 2");
      expect(state.politeQueue).toHaveLength(0);

      // Advance 3000ms to complete Polite 2
      vi.advanceTimersByTime(3000);
      state = announcer.getSnapshot();
      expect(state.activePolite).toBeNull();
      expect(state.activeAssertive).toBeNull();
    });

    it("queues subsequent assertive alerts in FIFO order in assertiveQueue", () => {
      announcer.announce("Alert 1", "assertive");
      announcer.announce("Alert 2", "assertive");
      announcer.announce("Alert 3", "assertive");

      let state = announcer.getSnapshot();
      expect(state.activeAssertive?.text).toBe("Alert 1");
      expect(state.assertiveQueue).toHaveLength(2);
      expect(state.assertiveQueue[0].text).toBe("Alert 2");
      expect(state.assertiveQueue[1].text).toBe("Alert 3");

      // Advance past Alert 1
      vi.advanceTimersByTime(3000);
      state = announcer.getSnapshot();
      expect(state.activeAssertive?.text).toBe("Alert 2");
      expect(state.assertiveQueue).toHaveLength(1);

      // Advance past Alert 2
      vi.advanceTimersByTime(3000);
      state = announcer.getSnapshot();
      expect(state.activeAssertive?.text).toBe("Alert 3");
      expect(state.assertiveQueue).toHaveLength(0);

      // Advance past Alert 3
      vi.advanceTimersByTime(3000);
      state = announcer.getSnapshot();
      expect(state.activeAssertive).toBeNull();
    });
  });

  describe("3-Second Auto-Expiration Dismissal", () => {
    it("automatically dismisses polite message after exactly 3000ms", () => {
      announcer.announce("Auto dismissing polite", "polite");
      expect(announcer.getSnapshot().activePolite?.text).toBe("Auto dismissing polite");

      vi.advanceTimersByTime(2999);
      expect(announcer.getSnapshot().activePolite?.text).toBe("Auto dismissing polite");

      vi.advanceTimersByTime(1);
      expect(announcer.getSnapshot().activePolite).toBeNull();
    });

    it("automatically dismisses assertive message after exactly 3000ms", () => {
      announcer.announce("Auto dismissing assertive", "assertive");
      expect(announcer.getSnapshot().activeAssertive?.text).toBe("Auto dismissing assertive");

      vi.advanceTimersByTime(2999);
      expect(announcer.getSnapshot().activeAssertive?.text).toBe("Auto dismissing assertive");

      vi.advanceTimersByTime(1);
      expect(announcer.getSnapshot().activeAssertive).toBeNull();
    });

    it("supports customizable expiration timeout via constructor options", () => {
      const customAnnouncer = new LiveAnnouncer({ expirationMs: 5000 });
      customAnnouncer.announce("Custom 5s duration", "polite");

      vi.advanceTimersByTime(4999);
      expect(customAnnouncer.getSnapshot().activePolite?.text).toBe("Custom 5s duration");

      vi.advanceTimersByTime(1);
      expect(customAnnouncer.getSnapshot().activePolite).toBeNull();

      customAnnouncer.destroy();
    });
  });

  describe("PII Masking & SSN Redaction", () => {
    it("redacts standard SSN patterns using sanitizePII helper function", () => {
      expect(sanitizePII("Social Security: 123-45-6789")).toBe("Social Security: ***-**-****");
      expect(sanitizePII("Space delimited: 987 65 4321")).toBe("Space delimited: ***-**-****");
      expect(sanitizePII("Dot delimited: 111.22.3333")).toBe("Dot delimited: ***-**-****");
      expect(sanitizePII("Raw digits: 123456789")).toBe("Raw digits: ***-**-****");
    });

    it("redacts multiple SSNs within a single message", () => {
      const input = "Primary SSN: 123-45-6789, Secondary SSN: 987-65-4321.";
      expect(sanitizePII(input)).toBe("Primary SSN: ***-**-****, Secondary SSN: ***-**-****.");
    });

    it("preserves non-PII numerical sequences like dates, years, or status codes", () => {
      expect(sanitizePII("HTTP 404 Error in year 2026")).toBe("HTTP 404 Error in year 2026");
      expect(sanitizePII("Item #1234567 with 89 units")).toBe("Item #1234567 with 89 units");
    });

    it("masks SSN automatically when announced through LiveAnnouncer", () => {
      announcer.announce("Patient file 123-45-6789 updated", "polite");
      expect(announcer.getSnapshot().activePolite?.text).toBe("Patient file ***-**-**** updated");
    });

    it("can disable PII sanitization if explicitly configured in options", () => {
      const unsanitizedAnnouncer = new LiveAnnouncer({ sanitizePII: false });
      unsanitizedAnnouncer.announce("Patient file 123-45-6789 updated", "polite");
      expect(unsanitizedAnnouncer.getSnapshot().activePolite?.text).toBe("Patient file 123-45-6789 updated");
      unsanitizedAnnouncer.destroy();
    });

    it("safely handles invalid or non-string inputs to sanitizePII", () => {
      // @ts-expect-error test invalid input runtime safety
      expect(sanitizePII(null)).toBe("");
      // @ts-expect-error test invalid input runtime safety
      expect(sanitizePII(undefined)).toBe("");
      // @ts-expect-error test invalid input runtime safety
      expect(sanitizePII(12345)).toBe("");
    });
  });

  describe("Lifecycle & Cleanup Management", () => {
    it("clears all active states, queued items, and timers when clear() is invoked", () => {
      announcer.announce("Polite 1", "polite");
      announcer.announce("Polite 2", "polite");
      announcer.announce("Assertive 1", "assertive");

      const listener = vi.fn();
      announcer.subscribe(listener);

      announcer.clear();
      const state = announcer.getSnapshot();

      expect(state.activePolite).toBeNull();
      expect(state.activeAssertive).toBeNull();
      expect(state.politeQueue).toEqual([]);
      expect(state.assertiveQueue).toEqual([]);
      expect(listener).toHaveBeenCalled();

      // Advancing timer does nothing after clear
      vi.advanceTimersByTime(5000);
      expect(announcer.getSnapshot().activePolite).toBeNull();
    });

    it("destroys the announcer instance and removes all active subscribers", () => {
      const listener = vi.fn();
      announcer.subscribe(listener);

      announcer.announce("Active message", "polite");
      expect(listener).toHaveBeenCalledTimes(1);

      announcer.destroy();
      expect(announcer.getSnapshot().activePolite).toBeNull();

      // After destroy, listeners should not receive updates
      announcer.announce("Post destroy message", "polite");
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("handles non-string or empty announcements gracefully", () => {
      // @ts-expect-error test invalid announcement input
      const result = announcer.announce(null);
      expect(result).toBeNull();
      expect(announcer.getSnapshot().activePolite).toBeNull();
    });
  });
});
