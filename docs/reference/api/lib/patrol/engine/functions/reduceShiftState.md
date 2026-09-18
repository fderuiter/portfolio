[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/engine](../README.md) / reduceShiftState

# Function: reduceShiftState()

> **reduceShiftState**(`state`, `event`): [`ShiftState`](../../types/interfaces/ShiftState.md)

Pure, deterministic FSM transition reducer for Patrol Shift.

Implements the lifecycle:
INTRO → BRIEFING → PATROL_MAP → DISPATCH → RESPONDING → SCENE →
TRANSPORT_PREP → OET → HANDOFF → DEBRIEF → PATROL_MAP → SHIFT_COMPLETE

Boundary Defense (AGENTS.md §11):
Invalid transitions leave the current state reference unchanged without throwing.

## Parameters

### state

[`ShiftState`](../../types/interfaces/ShiftState.md)

### event

[`ShiftEngineEvent`](../../types/interfaces/ShiftEngineEvent.md)

## Returns

[`ShiftState`](../../types/interfaces/ShiftState.md)
