[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [hooks/useAnnouncer](../README.md) / AnnouncerAction

# Type Alias: AnnouncerAction

> **AnnouncerAction** = \{ `item`: [`AnnounceItem`](../interfaces/AnnounceItem.md); `type`: `"ENQUEUE"`; \} \| \{ `type`: `"DEQUEUE_NEXT"`; \} \| \{ `item`: [`AnnounceItem`](../interfaces/AnnounceItem.md); `type`: `"ASSERTIVE_PREEMPT"`; \} \| \{ `type`: `"TIMER_COMPLETE"`; \} \| \{ `item`: [`AnnounceItem`](../interfaces/AnnounceItem.md); `type`: `"ANNOUNCE"`; \} \| \{ `type`: `"TIMER_EXPIRED"`; \}

Defined in: [components/providers/A11yProvider.tsx:21](https://github.com/fderuiter/portfolio/blob/main/components/providers/A11yProvider.tsx#L21)
