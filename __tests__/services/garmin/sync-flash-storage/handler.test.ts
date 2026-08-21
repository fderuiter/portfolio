import { describe, it, expect, beforeEach } from "vitest";
import { SyncFlashStorageHandler } from "@/lib/services";

describe("SyncFlashStorageHandler (Logic Test)", () => {
  const handler = new SyncFlashStorageHandler();

  beforeEach(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it("loads and saves flash storage properly", async () => {
    const saveResult = await handler.execute({
      action: "save",
      variables: [
        { id: 1, name: "run_track.fit", sizeKb: 8.5, allocatedAt: Date.now() },
      ],
    });

    expect(saveResult.success).toBe(true);
    if (saveResult.success) {
      expect(saveResult.data.totalAllocatedKb).toBe(8.5);
    }

    const loadResult = await handler.execute({ action: "load" });
    expect(loadResult.success).toBe(true);
    if (loadResult.success) {
      expect(loadResult.data.variables.length).toBe(1);
      expect(loadResult.data.variables[0].name).toBe("run_track.fit");
    }
  });

  it("rejects save without variables payload", async () => {
    const result = await handler.execute({ action: "save" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_PAYLOAD");
    }
  });
});
