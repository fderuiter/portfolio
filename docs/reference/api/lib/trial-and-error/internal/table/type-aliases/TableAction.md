[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableAction

# Type Alias: TableAction

> **TableAction** = \{ `cardId`: `string`; `type`: `"TOGGLE_SELECT"`; \} \| \{ `type`: `"PLAY_HAND"`; \} \| \{ `type`: `"DISCARD"`; \} \| \{ `cardId`: `string`; `type`: `"INSPECT_CARD"`; \} \| \{ `type`: `"CLOSE_INSPECT"`; \} \| \{ `col`: `number`; `row`: `number`; `type`: `"INSPECT_CELL"`; \} \| \{ `findingId`: `string`; `type`: `"CORRECT_FINDING"`; \} \| \{ `cardId`: `string`; `toIndex`: `number`; `type`: `"MOVE_CARD"`; \} \| \{ `cardId`: `string`; `type`: `"RECOMPILE"`; \} \| \{ `type`: `"RESET"`; \}

Player intents the Card Table reducer accepts.

## Union Members

### Type Literal

\{ `cardId`: `string`; `type`: `"TOGGLE_SELECT"`; \}

***

### Type Literal

\{ `type`: `"PLAY_HAND"`; \}

***

### Type Literal

\{ `type`: `"DISCARD"`; \}

***

### Type Literal

\{ `cardId`: `string`; `type`: `"INSPECT_CARD"`; \}

***

### Type Literal

\{ `type`: `"CLOSE_INSPECT"`; \}

***

### Type Literal

\{ `col`: `number`; `row`: `number`; `type`: `"INSPECT_CELL"`; \}

***

### Type Literal

\{ `findingId`: `string`; `type`: `"CORRECT_FINDING"`; \}

***

### Type Literal

\{ `cardId`: `string`; `toIndex`: `number`; `type`: `"MOVE_CARD"`; \}

Cosmetic: moves a card within the hand. Costs nothing.

***

### Type Literal

\{ `cardId`: `string`; `type`: `"RECOMPILE"`; \}

Reruns a stale output against the current snapshot.

***

### Type Literal

\{ `type`: `"RESET"`; \}
