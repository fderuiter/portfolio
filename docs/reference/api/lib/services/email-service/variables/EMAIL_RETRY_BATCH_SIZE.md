[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/email-service](../README.md) / EMAIL\_RETRY\_BATCH\_SIZE

# Variable: EMAIL\_RETRY\_BATCH\_SIZE

> `const` **EMAIL\_RETRY\_BATCH\_SIZE**: `15` = `15`

Queued emails the daily maintenance run sends at most. Newsletter dispatch
sizes itself against this, so queued mail can never take more than this
share of Resend's 100 emails a day (#841).
