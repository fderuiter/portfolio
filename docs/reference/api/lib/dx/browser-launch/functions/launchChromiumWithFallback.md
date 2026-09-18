[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/dx/browser-launch](../README.md) / launchChromiumWithFallback

# Function: launchChromiumWithFallback()

> **launchChromiumWithFallback**(`options?`): `Promise`\<`Browser`\>

Launches Chromium via Playwright, retrying against an unversioned browser
binary at `$PLAYWRIGHT_BROWSERS_PATH/chromium` when the default launch
fails because the exact revision pinned by the installed `@playwright/test`
package isn't present. Some pre-seeded dev environments cache an older
Chromium build under a stable, unversioned path instead of the exact
pinned revision; that cached build is still a valid Chromium for headless
rendering, so this avoids a hard failure without masking a genuine
"Playwright isn't installed at all" error (the fallback path only kicks in
when that specific binary actually exists).

## Parameters

### options?

`LaunchOptions` = `{}`

## Returns

`Promise`\<`Browser`\>
