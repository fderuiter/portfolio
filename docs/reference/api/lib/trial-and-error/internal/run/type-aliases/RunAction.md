[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/trial-and-error/internal/run](../README.md) / RunAction

# Type Alias: RunAction

> **RunAction** = `Exclude`\<[`TableAction`](../../table/type-aliases/TableAction.md), \{ `type`: `"RESET"`; \}\> \| \{ `type`: `"NEXT_BLIND"`; \} \| \{ `type`: `"RESTART_RUN"`; \}

Player intents the run reducer accepts. Every Card Table action except
RESET passes through to the current Blind; a lost Blind ends the run, so
the only way back is RESTART_RUN.
