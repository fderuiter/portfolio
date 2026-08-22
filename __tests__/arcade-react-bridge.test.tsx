import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ArcadeEngine } from "@/lib/arcade";
import { useArcadeEngine } from "@/components/arcade/useArcadeEngine";

interface TestState {
  score: number;
  gameOver: boolean;
}

class MockGameEngine extends ArcadeEngine<TestState, TestState> {
  public updateCalls = 0;
  public renderCalls = 0;

  constructor() {
    super({ score: 0, gameOver: false });
  }

  public override init(): void {
    // init
  }

  public override update(_dt: number): void {
    this.updateCalls++;
  }

  public override render(_ctx: CanvasRenderingContext2D, _alpha: number): void {
    this.renderCalls++;
  }

  public override createSnapshot(): TestState {
    return { ...this.state };
  }

  public addScore(pts: number): void {
    this.state.score += pts;
    this.notifySubscribers();
  }
}

const TestGameComponent: React.FC<{ engine: MockGameEngine }> = ({
  engine,
}) => {
  const { canvasRef, snapshot, isContextLost } = useArcadeEngine<
    MockGameEngine,
    TestState
  >(() => engine, {
    viewportMode: "safe-zone",
    baseWidth: 800,
    baseHeight: 500,
  });

  return (
    <div
      data-testid="game-container"
      style={{ position: "relative", width: "800px", height: "500px" }}
    >
      <canvas ref={canvasRef} data-testid="game-canvas" />
      <div id="ui-layer" className="absolute inset-0 pointer-events-none">
        <div data-testid="score-display">Score: {snapshot.score}</div>
        {isContextLost && (
          <div data-testid="context-lost-banner">Restoring Graphics...</div>
        )}
      </div>
    </div>
  );
};

describe("useArcadeEngine React Hook", () => {
  let engine: MockGameEngine;

  beforeEach(() => {
    engine = new MockGameEngine();
  });

  it("mounts canvas and synchronizes snapshot via useSyncExternalStore", () => {
    render(<TestGameComponent engine={engine} />);

    expect(screen.getByTestId("game-canvas")).toBeDefined();
    expect(screen.getByTestId("score-display").textContent).toBe("Score: 0");

    act(() => {
      engine.addScore(100);
    });

    expect(screen.getByTestId("score-display").textContent).toBe("Score: 100");
  });

  it("cleans up engine and stops game loop on unmount", () => {
    const destroySpy = vi.spyOn(engine, "destroy");
    const { unmount } = render(<TestGameComponent engine={engine} />);

    unmount();
    expect(destroySpy).toHaveBeenCalled();
  });
});
