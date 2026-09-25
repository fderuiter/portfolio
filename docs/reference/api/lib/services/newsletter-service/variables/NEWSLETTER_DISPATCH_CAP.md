[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/newsletter-service](../README.md) / NEWSLETTER\_DISPATCH\_CAP

# Variable: NEWSLETTER\_DISPATCH\_CAP

> `const` **NEWSLETTER\_DISPATCH\_CAP**: `10` = `10`

Most announcement emails a single maintenance run may enqueue (#841).

The daily cron drains the outbound queue at most `EMAIL_RETRY_BATCH_SIZE`
(15) messages per run, and the dispatch phase also never enqueues past the
queue's remaining room in that batch. Queued mail therefore uses at most 15
of Resend's 100 emails a day however many posts are published the same day,
newsletter mail at most 10 of those, and at least 85 stay free for contact,
feedback and signup mail sent inline.
