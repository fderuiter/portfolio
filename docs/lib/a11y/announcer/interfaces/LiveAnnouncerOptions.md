[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/a11y/announcer](../README.md) / LiveAnnouncerOptions

# Interface: LiveAnnouncerOptions

Defined in: [lib/a11y/announcer.ts:30](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L30)

## Properties

### expirationMs?

> `optional` **expirationMs?**: `number`

Defined in: [lib/a11y/announcer.ts:35](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L35)

Auto-expiration timeout duration in milliseconds for active announcements.
Defaults to 3000ms.

***

### sanitizePII?

> `optional` **sanitizePII?**: `boolean`

Defined in: [lib/a11y/announcer.ts:40](https://github.com/fderuiter/portfolio/blob/main/lib/a11y/announcer.ts#L40)

Whether to sanitize sensitive personal identifiers such as SSNs.
Defaults to true.
