[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/table](../README.md) / TableAction

# Type Alias: TableAction

> **TableAction** = \{ `cardId`: `string`; `type`: `"TOGGLE_SELECT"`; \} \| \{ `type`: `"PLAY_HAND"`; \} \| \{ `type`: `"DISCARD"`; \} \| \{ `cardId`: `string`; `type`: `"INSPECT_CARD"`; \} \| \{ `type`: `"CLOSE_INSPECT"`; \} \| \{ `col`: `number`; `row`: `number`; `type`: `"INSPECT_CELL"`; \} \| \{ `findingId`: `string`; `type`: `"CORRECT_FINDING"`; \} \| \{ `type`: `"RESET"`; \}

Player intents the Card Table reducer accepts.
