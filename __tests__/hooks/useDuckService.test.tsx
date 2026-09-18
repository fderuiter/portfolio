// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDuckService } from "@/hooks/useDuckService";
import { createInitialDuckGameState } from "@/lib/working-with-duck-engine";

describe("useDuckService Hook", () => {
  it("dispatches trick and treat commands cleanly", () => {
    const { result } = renderHook(() => useDuckService());
    const state = createInitialDuckGameState();

    let treatRes: ReturnType<typeof result.current.dispatchCommand> | undefined;
    act(() => {
      treatRes = result.current.dispatchCommand({
        type: "treat",
        state,
      });
    });

    expect(treatRes?.success).toBe(true);
    if (treatRes?.success) {
      expect(treatRes.data.commandExecuted).toBe("treat");
    }

    let trickRes: ReturnType<typeof result.current.dispatchCommand> | undefined;
    act(() => {
      trickRes = result.current.dispatchCommand({
        type: "trick",
        state,
        trick: "SIT",
      });
    });

    expect(trickRes?.success).toBe(true);
  });

  it("handles hazard interaction with squeaky toy", () => {
    const { result } = renderHook(() => useDuckService());
    const state = createInitialDuckGameState();

    let res: ReturnType<typeof result.current.interactHazard> | undefined;
    act(() => {
      res = result.current.interactHazard({
        state,
        action: "distract_with_squeaky",
        x: 300,
        y: 200,
      });
    });

    expect(res?.success).toBe(true);
  });

  it("rejects invalid inputs gracefully with structured error envelope", () => {
    const { result } = renderHook(() => useDuckService());

    let res: ReturnType<typeof result.current.dispatchCommand> | undefined;
    act(() => {
      res = result.current.dispatchCommand({
        // @ts-expect-error test invalid payload
        type: "invalid_command_type",
        state: createInitialDuckGameState(),
      });
    });

    expect(res?.success).toBe(false);
    if (res && !res.success) {
      expect(res.error.code).toBe("INVALID_STATE");
      expect(res.error.recoverable).toBe(true);
    }
  });
});
