# ADR 0048: Desktop-Only Arcade Games on Phones and Portrait Tablets

## Status

Accepted on 2026-09-24. Narrows [ADR 0003](0003-mobile-responsive-and-touch-standard.md)
for six arcade games. Leaves [ADR 0046](0046-trial-and-error-biostat-ops-architecture.md)
(Trial & Error, "desktop-first but playable on phones") unchanged. ADR 0047 is
reserved for the narrative-design work in #927.

## Context

ADR 0003 committed every arcade game to "full-fidelity usability" on phones:
virtual gamepads, orientation hints and a zero-overflow invariant. The games
meet the letter of that and still play badly. Each game was launched and
played on an emulated iPhone 12, in portrait and in landscape with the
cabinet in fullscreen. Portrait at 375px wide:

| Game                  | What a phone visitor gets                            |
| --------------------- | ---------------------------------------------------- |
| Working With Duck     | Four HUD cards fill the screen; play area is 279×174 |
| Laser Loon            | The aim-and-shoot canvas shrinks to 271×148          |
| Quasi-Perfect Puzzler | The proof tree becomes 2,370px of vertical scrolling |
| Monkey C Mayhem       | The watch fits, but its side buttons are clipped     |
| Clinical Trial Chaos  | The conveyor is 269×71 inside a 3,400px-tall cabinet |
| Retro Labyrinth       | The map is 240×144 with the d-pad below the fold     |

Landscape fullscreen does not rescue them. The play area stays at 13–30% of
the screen for five of the six, and the controls still read as keyboard hints
("Press (4)", "Space to fire", "Tab to cycle"). Clinical Trial Chaos gets its
conveyor to half the screen, but its queue and routing panels sit below it.

A visitor who opens one of these from a shared link on a phone forms their
impression of the whole portfolio from it. Telling them plainly that the game
is built for a desktop is a better first impression than a cramped one.

## Decision

These six games show a desktop-only notice in place of their cabinet on
phones and portrait tablets. `components/arcade/DesktopOnlyGate.tsx` is the
single implementation; each game opts in by wrapping its `PlayCabinet`.

- **Who is gated.** `(pointer: coarse) and (max-width: 1023px)`: phones in
  either orientation and tablets in portrait. Tablets in landscape (1024px and
  up) play normally. A desktop browser window resized narrow keeps its fine
  pointer and still gets the game, so the check is about the device, not the
  window. User-agent sniffing is not used.
- **Decided in CSS.** The gate is a media query in the markup, not a
  `matchMedia` read, so server-rendered HTML is already right for the device
  and neither the cabinet nor the notice flashes during hydration.
- **The page stays.** Heading, description, breadcrumbs, controls reference,
  metadata and structured data all render as before. Only the play area is
  replaced, so links, previews and search results still describe the game.
- **Somewhere to go.** The notice is not a dead end. It shows a still of the
  game being played on a desktop (`public/images/arcade/previews/<slug>.webp`,
  800×500, lazy-loaded so desktops never fetch it). Its primary action saves
  the link for later through the phone's share sheet, falling back to copying
  it. It then points at parts of the site that do work on a phone: the Meme
  Vault and the blog.
- **The hub says so first.** On the same devices, the Arcade hub marks each
  gated card "Desktop only" and says, above the cards, that the Meme Vault
  works on a phone. That way visitors learn it before they tap through.
- **An escape hatch.** "Try it anyway" reveals the cabinet for that page view.
  The existing touch controls stay in place behind it; nothing is deleted.

The Meme Vault is not gated: it is a soundboard that fits a phone cleanly.
Trial & Error is not gated either. It is not linked from the Arcade hub yet,
and ADR 0046 promises phone play, with narrow-screen tap work in progress. On
a phone its hand currently sits below a tall status panel, so whether to gate
it too is left to its own ADR.

## Consequences

- Phone visitors get an honest message instead of a broken-feeling game.
- ADR 0003's touch work (virtual gamepads, orientation hints, overflow checks)
  stays in the code but is now reached only through "Try it anyway". The
  Playwright Mobile Safari, Mobile Chrome and Tablet Safari projects that
  launch these six cabinets pass the notice through "Try it anyway". The
  desktop `chromium` project never matches the gate.
- The preview stills go stale when a game's look changes. Retake them from a
  desktop fullscreen cabinet when that happens.
- Gating or un-gating a game is a one-line change in its `*Client.tsx`.
