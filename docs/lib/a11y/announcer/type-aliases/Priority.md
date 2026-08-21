[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/a11y/announcer](../README.md) / Priority

# Type Alias: Priority

> **Priority** = `"polite"` \| `"assertive"`

Defined in: [lib/a11y/announcer.ts:12](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L12)

Pure LiveAnnouncer Engine & State Machine

Provides a framework-agnostic, zero-React queue management engine for screen reader live region announcements:
- Polite FIFO queuing for status updates
- Assertive preemption for critical alerts
- Deterministic auto-expiration timers
- PII masking for Social Security Numbers and sensitive identifiers
- Snapshot subscriptions compatible with useSyncExternalStore
