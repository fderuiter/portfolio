import { DuckCommandSpec, DuckCommandInput, DuckCommandResult } from "./spec";
import {
  performTrick,
  equipAccessory,
  giveTreat,
  scrubBelly,
  throwBall,
  interactStation,
  advanceToNextLevel,
  WorkingWithDuckState,
} from "@/lib/working-with-duck-engine";
import { createSuccess, createFailure } from "@/lib/services/service-result";

export class DuckCommandHandler implements DuckCommandSpec {
  execute(input: DuckCommandInput): DuckCommandResult {
    if (!input.state || typeof input.state !== "object") {
      return createFailure(
        "INVALID_STATE",
        "Invalid Duck game state provided",
        {
          suggestion: "Initialize state with createInitialDuckGameState()",
          recoverable: true,
        }
      );
    }

    try {
      let nextState: WorkingWithDuckState = input.state;

      switch (input.type) {
        case "trick": {
          nextState = performTrick(input.state, input.trick);
          break;
        }
        case "accessory": {
          nextState = equipAccessory(input.state, input.accessory);
          break;
        }
        case "treat": {
          nextState = giveTreat(input.state);
          break;
        }
        case "pet": {
          nextState = scrubBelly(input.state, input.x, input.y);
          break;
        }
        case "throw_ball": {
          nextState = throwBall(input.state, input.targetX, input.targetY);
          break;
        }
        case "station": {
          nextState = interactStation(input.state, input.station);
          break;
        }
        case "advance_level": {
          nextState = advanceToNextLevel(input.state);
          break;
        }
        default: {
          return createFailure(
            "UNKNOWN_COMMAND",
            `Unknown command payload: ${(input as { type: string }).type}`
          );
        }
      }

      return createSuccess({
        state: nextState,
        commandExecuted: input.type,
        mood: nextState.duck.state,
        naughtyVsGood: nextState.naughtyVsGood,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return createFailure("EXECUTION_FAILED", message, {
        suggestion: "Verify Duck state invariants and behavior parameters",
        recoverable: true,
        details: err,
      });
    }
  }
}
