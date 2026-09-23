[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/clinical-trial-chaos/sponsor](../README.md) / SponsorEvent

# Type Alias: SponsorEvent

> **SponsorEvent** = \{ `request`: [`SponsorRequest`](../interfaces/SponsorRequest.md); `type`: `"request_arrived"`; \} \| \{ `request`: [`SponsorRequest`](../interfaces/SponsorRequest.md); `subjectLine`: `string`; `type`: `"follow_up"`; \} \| \{ `moodDelta`: `number`; `request`: [`SponsorRequest`](../interfaces/SponsorRequest.md); `type`: `"request_dropped"`; \} \| \{ `type`: `"contract_terminated"`; \}
