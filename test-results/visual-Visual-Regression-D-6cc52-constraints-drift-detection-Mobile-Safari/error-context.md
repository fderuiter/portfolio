# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> Visual Regression & Drift Detection >> Layout constraints drift detection
- Location: __tests__/e2e/visual.spec.ts:33:7

# Error details

```
Error: Drift detected! Card mathematically expected 640px but naturally measured 617.72998046875px. Update padding constants.

expect(received).toBe(expected) // Object.is equality

Expected: "640"
Received: "617.72998046875"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "FDERUITER" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e8]: FDERUITER
      - button "Open navigation menu" [ref=e10] [cursor=pointer]:
        - img [ref=e11]
  - generic [ref=e15]:
    - generic [ref=e16]:
      - generic:
        - img:
          - img
      - generic [ref=e17]:
        - generic [ref=e18]: FREDERICK DE RUITER · PRINCIPAL SYSTEMS ENGINEER
        - generic [ref=e19]:
          - generic:
            - generic:
              - generic: Engineering
              - generic: the
              - generic: Interface
              - generic: Between
              - generic: Data
              - generic: and
              - generic: Meaning
          - heading "Engineering the Interface Between Data and Meaning" [level=1] [ref=e20]
        - generic [ref=e21]:
          - generic:
            - paragraph:
              - generic: Connecting
              - generic: high-performance
              - generic: canvas
              - generic: layout
              - generic: engines,
              - generic: serverless
              - generic: Postgres
              - generic: data
              - generic: streams,
              - generic: and
              - generic: clinical
              - generic: data
              - generic: integration
              - generic: clients
              - generic: into
              - generic: a
              - generic: unified
              - generic: engineering
              - generic: showcase.
          - paragraph [ref=e22]: Connecting high-performance canvas layout engines, serverless Postgres data streams, and clinical data integration clients into a unified engineering showcase.
        - generic [ref=e23]:
          - link "Explore Engineering" [ref=e24]:
            - /url: "#case-studies"
            - text: Explore Engineering
          - link "GitHub Repository" [ref=e26]:
            - /url: https://github.com/fderuiter/portfolio
            - img [ref=e27]
            - text: GitHub Repository
    - main [ref=e29]:
      - generic [ref=e30]:
        - heading "Unified Engineering Showcase" [level=2] [ref=e31]
        - paragraph [ref=e32]: Verifiable Serverless Postgres Architecture
        - generic [ref=e37]: Operational · Serverless Neon Postgres Active
        - generic [ref=e38]:
          - 'heading "Personal Highlights: Creative Engineering" [level=3] [ref=e39]': "Personal Highlights: Creative Engineering"
          - paragraph [ref=e41]: Beyond standard engineering deep-dives, I build playful and interactive physics experiments to explore user engagement through unexpected UI forms.
          - link "Explore the Laser Loon & UI Sandbox" [ref=e42]:
            - /url: /ui-sandbox
            - text: Explore the Laser Loon & UI Sandbox
            - img [ref=e43]
        - generic [ref=e45]:
          - generic [ref=e46]:
            - button "ALL PROJECTS" [ref=e47] [cursor=pointer]: ALL PROJECTS
            - button "TYPESCRIPT" [ref=e49] [cursor=pointer]
            - button "PYTHON" [ref=e50] [cursor=pointer]
            - button "HASKELL" [ref=e51] [cursor=pointer]
          - generic [ref=e53]:
            - generic [ref=e59]:
              - generic [ref=e60]:
                - generic [ref=e61]:
                  - generic [ref=e62]: TypeScript
                  - generic [ref=e63]: SCHEMAFLOW
                - generic [ref=e64]: "SchemaFlow: Reactive Node Engine"
                - generic [ref=e65]:
                  - button "THE PITCH" [ref=e66] [cursor=pointer]
                  - button "THE REALITY" [ref=e67] [cursor=pointer]
                - generic [ref=e71]:
                  - generic:
                    - generic:
                      - generic: A
                      - generic: reactive
                      - generic: ","
                      - generic: visual graph editor
                      - generic: built in
                    - generic:
                      - generic: TypeScript
                      - generic: .
                  - paragraph [ref=e72]:
                    - text: A
                    - strong [ref=e73]: reactive
                    - text: ","
                    - code [ref=e74]: visual graph editor
                    - text: built in
                    - strong [ref=e75]: TypeScript
                    - text: .
                - generic [ref=e76]:
                  - generic [ref=e77]:
                    - generic [ref=e78]:
                      - generic [ref=e79]: Commit Activity (12 Months)
                      - generic [ref=e80]: 249 Commits
                    - 'img "GitHub commit activity timeline over the last 12 months. Total commits: 249" [ref=e82]'
                  - generic [ref=e85]:
                    - generic [ref=e86]:
                      - img [ref=e87]
                      - generic [ref=e89]: "148"
                      - text: STARS
                    - generic [ref=e90]:
                      - img [ref=e91]
                      - generic [ref=e96]: "24"
                      - text: FORKS
                    - generic [ref=e97]:
                      - img [ref=e98]
                      - generic [ref=e100]: "3"
                      - text: ISSUES
                  - generic [ref=e101]:
                    - generic [ref=e102]:
                      - generic [ref=e103]: LANGUAGE STACK
                      - generic [ref=e104]: TypeScript 88%
                    - generic [ref=e105]:
                      - 'generic "TypeScript: 88%" [ref=e106]'
                      - 'generic "JavaScript: 12%" [ref=e107]'
                    - generic [ref=e108]:
                      - generic [ref=e109]: TypeScript (88%)
                      - generic [ref=e111]: JavaScript (12%)
                  - generic [ref=e113]:
                    - generic [ref=e114]:
                      - img [ref=e115]
                      - generic [ref=e117]: git log --oneline -n 5
                    - generic [ref=e118]:
                      - generic [ref=e119]:
                        - generic [ref=e120]: f1d2e3a
                        - generic [ref=e121]: "|"
                        - 'generic "perf: optimize web worker message transfer serialization" [ref=e122]'
                      - generic [ref=e123]:
                        - generic [ref=e124]: c4b5a6f
                        - generic [ref=e125]: "|"
                        - 'generic "feat: add cyclic dependency detection algorithm to DAG core" [ref=e126]'
                      - generic [ref=e127]:
                        - generic [ref=e128]: e7d8c9b
                        - generic [ref=e129]: "|"
                        - 'generic "refactor: migrate state management store to Zustand" [ref=e130]'
                      - generic [ref=e131]:
                        - generic [ref=e132]: a1b2c3d
                        - generic [ref=e133]: "|"
                        - 'generic "test: add integration test suite for AST compilation" [ref=e134]'
                      - generic [ref=e135]:
                        - generic [ref=e136]: 4f5e6d7
                        - generic [ref=e137]: "|"
                        - 'generic "initial commit: basic node workspace layout and setup" [ref=e138]'
              - generic [ref=e139]:
                - generic "Aggregate Page Views" [ref=e140]:
                  - generic [ref=e142]: "Live page views: 0"
                  - generic [ref=e143]: "0"
                  - generic [ref=e144]: VIEWS
                - generic "Bento Card Interactions" [ref=e145]:
                  - generic [ref=e147]: "Live clicks: 0"
                  - generic [ref=e148]: "0"
                  - generic [ref=e149]: CLICKS
              - generic [ref=e150]:
                - link "Analyze Architecture" [ref=e151] [cursor=pointer]:
                  - /url: /case-studies/schemaflow
                  - generic [ref=e152]: Analyze Architecture
                  - img [ref=e153]
                - generic [ref=e155]: "H: 640px"
            - generic [ref=e161]:
              - generic [ref=e162]:
                - generic [ref=e163]:
                  - generic [ref=e164]: Python
                  - generic [ref=e165]: CLINICAL-DATA-MAPPER
                - generic [ref=e166]: Clinical Data Standards Engine
                - generic [ref=e167]:
                  - button "THE PITCH" [ref=e168] [cursor=pointer]
                  - button "THE REALITY" [ref=e169] [cursor=pointer]
                - generic [ref=e173]:
                  - generic:
                    - generic:
                      - generic: An enterprise-grade mapping pipeline.
                  - paragraph [ref=e174]: An enterprise-grade mapping pipeline.
                - generic [ref=e175]:
                  - generic [ref=e176]:
                    - generic [ref=e177]:
                      - generic [ref=e178]: Commit Activity (12 Months)
                      - generic [ref=e179]: 249 Commits
                    - 'img "GitHub commit activity timeline over the last 12 months. Total commits: 249" [ref=e181]'
                  - generic [ref=e184]:
                    - generic [ref=e185]:
                      - img [ref=e186]
                      - generic [ref=e188]: "112"
                      - text: STARS
                    - generic [ref=e189]:
                      - img [ref=e190]
                      - generic [ref=e195]: "18"
                      - text: FORKS
                    - generic [ref=e196]:
                      - img [ref=e197]
                      - generic [ref=e199]: "2"
                      - text: ISSUES
                  - generic [ref=e200]:
                    - generic [ref=e201]:
                      - generic [ref=e202]: LANGUAGE STACK
                      - generic [ref=e203]: Python 95%
                    - generic [ref=e204]:
                      - 'generic "Python: 95%" [ref=e205]'
                      - 'generic "HTML: 5%" [ref=e206]'
                    - generic [ref=e207]:
                      - generic [ref=e208]: Python (95%)
                      - generic [ref=e210]: HTML (5%)
                  - generic [ref=e212]:
                    - generic [ref=e213]:
                      - img [ref=e214]
                      - generic [ref=e216]: git log --oneline -n 5
                    - generic [ref=e217]:
                      - generic [ref=e218]:
                        - generic [ref=e219]: p9o8i7u
                        - generic [ref=e220]: "|"
                        - 'generic "release: v1.1.2 patch for clinical-data transport layer security" [ref=e221]'
                      - generic [ref=e222]:
                        - generic [ref=e223]: y6t5r4e
                        - generic [ref=e224]: "|"
                        - 'generic "feat: enforce TLS 1.3 encryption and automatic token rotation" [ref=e225]'
                      - generic [ref=e226]:
                        - generic [ref=e227]: w3q2a1s
                        - generic [ref=e228]: "|"
                        - 'generic "refactor: migrate clinical models to Pydantic v2 core schemas" [ref=e229]'
                      - generic [ref=e230]:
                        - generic [ref=e231]: z9x8c7v
                        - generic [ref=e232]: "|"
                        - 'generic "test: implement HIPAA transport boundary mock endpoints" [ref=e233]'
                      - generic [ref=e234]:
                        - generic [ref=e235]: b6n5m4a
                        - generic [ref=e236]: "|"
                        - 'generic "setup: initialize pyproject.toml and poetry structure" [ref=e237]'
              - generic [ref=e238]:
                - generic "Aggregate Page Views" [ref=e239]:
                  - generic [ref=e241]: "Live page views: 0"
                  - generic [ref=e242]: "0"
                  - generic [ref=e243]: VIEWS
                - generic "Bento Card Interactions" [ref=e244]:
                  - generic [ref=e246]: "Live clicks: 0"
                  - generic [ref=e247]: "0"
                  - generic [ref=e248]: CLICKS
              - generic [ref=e249]:
                - link "Analyze Architecture" [ref=e250] [cursor=pointer]:
                  - /url: /case-studies/clinical-data-mapper
                  - generic [ref=e251]: Analyze Architecture
                  - img [ref=e252]
                - generic [ref=e254]: "H: 622px"
            - generic [ref=e260]:
              - generic [ref=e261]:
                - generic [ref=e262]:
                  - generic [ref=e263]: Haskell
                  - generic [ref=e264]: AURA-HASKELL
                - generic [ref=e265]: "Aura: Language-Tailored Haskell Type Flow Analyzer"
                - generic [ref=e266]:
                  - button "THE PITCH" [ref=e267] [cursor=pointer]
                  - button "THE REALITY" [ref=e268] [cursor=pointer]
                - generic [ref=e272]:
                  - generic:
                    - generic:
                      - generic: An advanced
                      - generic: Haskell
                      - generic: static analyzer and type
                    - generic:
                      - generic: inference engine.
                  - paragraph [ref=e273]:
                    - text: An advanced
                    - strong [ref=e274]: Haskell
                    - text: static analyzer and type inference engine.
                - generic [ref=e275]:
                  - generic [ref=e276]:
                    - generic [ref=e277]:
                      - generic [ref=e278]: Commit Activity (12 Months)
                      - generic [ref=e279]: 249 Commits
                    - 'img "GitHub commit activity timeline over the last 12 months. Total commits: 249" [ref=e281]'
                  - generic [ref=e284]:
                    - generic [ref=e285]:
                      - img [ref=e286]
                      - generic [ref=e288]: "74"
                      - text: STARS
                    - generic [ref=e289]:
                      - img [ref=e290]
                      - generic [ref=e295]: "11"
                      - text: FORKS
                    - generic [ref=e296]:
                      - img [ref=e297]
                      - generic [ref=e299]: "0"
                      - text: ISSUES
                  - generic [ref=e300]:
                    - generic [ref=e301]:
                      - generic [ref=e302]: LANGUAGE STACK
                      - generic [ref=e303]: Haskell 91%
                    - generic [ref=e304]:
                      - 'generic "Haskell: 91%" [ref=e305]'
                      - 'generic "CSS: 9%" [ref=e306]'
                    - generic [ref=e307]:
                      - generic [ref=e308]: Haskell (91%)
                      - generic [ref=e310]: CSS (9%)
                  - generic [ref=e312]:
                    - generic [ref=e313]:
                      - img [ref=e314]
                      - generic [ref=e316]: stack build --fast
                    - generic [ref=e317]:
                      - generic [ref=e319]: "[1 of 4] Compiling Core.AST ( src/Core/AST.hs, AST.o )"
                      - generic [ref=e321]: "[2 of 4] Compiling Parser.Type ( src/Parser/Type.hs, Type.o )"
                      - generic [ref=e323]: "[3 of 4] Compiling Solver.Unify ( src/Solver/Unify.hs, Unify.o )"
                      - generic [ref=e325]: "[4 of 4] Compiling Main ( app/Main.hs, Main.o )"
                      - generic [ref=e327]: Linking .stack-work/dist/x86_64/aura-compiler ...
                      - generic [ref=e329]: Build successful! Loaded 4 modules.
              - generic [ref=e330]:
                - generic "Aggregate Page Views" [ref=e331]:
                  - generic [ref=e333]: "Live page views: 0"
                  - generic [ref=e334]: "0"
                  - generic [ref=e335]: VIEWS
                - generic "Bento Card Interactions" [ref=e336]:
                  - generic [ref=e338]: "Live clicks: 0"
                  - generic [ref=e339]: "0"
                  - generic [ref=e340]: CLICKS
              - generic [ref=e341]:
                - link "Analyze Architecture" [ref=e342] [cursor=pointer]:
                  - /url: /case-studies/aura-haskell
                  - generic [ref=e343]: Analyze Architecture
                  - img [ref=e344]
                - generic [ref=e346]: "H: 640px"
    - generic [ref=e350]:
      - generic [ref=e351]:
        - generic [ref=e352]: I
        - text: I
      - generic [ref=e353]:
        - generic [ref=e354]: build
        - text: build
      - generic [ref=e355]:
        - generic [ref=e356]: resilient,
        - text: resilient,
      - generic [ref=e357]:
        - generic [ref=e358]: type-safe
        - text: type-safe
      - generic [ref=e359]:
        - generic [ref=e360]: infrastructure
        - text: infrastructure
      - generic [ref=e361]:
        - generic [ref=e362]: that
        - text: that
      - generic [ref=e363]:
        - generic [ref=e364]: connects
        - text: connects
      - generic [ref=e365]:
        - generic [ref=e366]: low-latency
        - text: low-latency
      - generic [ref=e367]:
        - generic [ref=e368]: client
        - text: client
      - generic [ref=e369]:
        - generic [ref=e370]: interfaces
        - text: interfaces
      - generic [ref=e371]:
        - generic [ref=e372]: with
        - text: with
      - generic [ref=e373]:
        - generic [ref=e374]: scalable
        - text: scalable
      - generic [ref=e375]:
        - generic [ref=e376]: distributed
        - text: distributed
      - generic [ref=e377]:
        - generic [ref=e378]: systems,
        - text: systems,
      - generic [ref=e379]:
        - generic [ref=e380]: guaranteeing
        - text: guaranteeing
      - generic [ref=e381]:
        - generic [ref=e382]: extreme
        - text: extreme
      - generic [ref=e383]:
        - generic [ref=e384]: security
        - text: security
      - generic [ref=e385]:
        - generic [ref=e386]: boundaries
        - text: boundaries
      - generic [ref=e387]:
        - generic [ref=e388]: and
        - text: and
      - generic [ref=e389]:
        - generic [ref=e390]: exceptional
        - text: exceptional
      - generic [ref=e391]:
        - generic [ref=e392]: performance.
        - text: performance.
    - generic [ref=e394]:
      - heading "System Architect & Design Engineer" [level=2] [ref=e395]
      - paragraph [ref=e396]: Engineering High-Performance Technical Solutions
      - generic [ref=e398]:
        - generic [ref=e400]:
          - generic [ref=e401]:
            - generic [ref=e402]: FDR
            - generic [ref=e403]:
              - heading "System Architect" [level=3] [ref=e404]
              - paragraph [ref=e405]: Principal Design Engineer
          - paragraph [ref=e406]: I am a full-stack design engineer who believes technology should ultimately serve and connect people. While my background is in building robust operational engines and responsive digital products, my core philosophy is rooted in creativity, playful problem-solving, and ensuring every system I build feels deeply human and accessible.
        - generic [ref=e408]:
          - heading "Live Telemetry API" [level=3] [ref=e409]
          - paragraph [ref=e410]: Dynamic repository programming languages aggregated dynamically via GitHub cached metrics.
          - generic [ref=e411]:
            - generic [ref=e413]:
              - generic [ref=e414]: Python
              - generic [ref=e415]: 32%
            - generic [ref=e418]:
              - generic [ref=e419]: Haskell
              - generic [ref=e420]: 30%
            - generic [ref=e423]:
              - generic [ref=e424]: TypeScript
              - generic [ref=e425]: 29%
            - generic [ref=e428]:
              - generic [ref=e429]: JavaScript
              - generic [ref=e430]: 4%
            - generic [ref=e433]:
              - generic [ref=e434]: CSS
              - generic [ref=e435]: 3%
        - generic [ref=e437]:
          - heading "Core Technical Specializations" [level=3] [ref=e438]
          - generic [ref=e439]:
            - generic [ref=e440]:
              - generic [ref=e441]: "01"
              - heading "Clinical Integrations" [level=4] [ref=e442]:
                - generic [ref=e443]: Clinical Integrations
              - paragraph [ref=e444]: Resilient XML streaming engines matching CDISC ODM schemas to FDA-compliant SDTM datasets.
            - generic [ref=e445]:
              - generic [ref=e446]: "02"
              - heading "Layout Physics" [level=4] [ref=e447]:
                - generic [ref=e448]: Layout Physics
              - paragraph [ref=e449]: DOM-free userland canvas calculation loops synchronized to bypass layout reflow thrashes.
            - generic [ref=e450]:
              - generic [ref=e451]: "03"
              - heading "Serverless Scaling" [level=4] [ref=e452]:
                - generic [ref=e453]: Serverless Scaling
              - paragraph [ref=e454]: Prisma WebSocket connectivity mappings linking pools into cloud Neon databases at 1ms latencies.
            - generic [ref=e455]:
              - generic [ref=e456]: "04"
              - heading "Full-Stack Security" [level=4] [ref=e457]
              - paragraph [ref=e458]: Strict HTML sanitizers, encrypted HIPAA token rotation schemes, and dynamic sitemaps.
      - heading "Professional Experience Timeline" [level=3] [ref=e459]
      - paragraph [ref=e460]:
        - text: A Chronological Evolution of
        - generic [ref=e461]: Systems Rigor
      - generic [ref=e465]:
        - generic [ref=e470]:
          - text: 2023 — Present
          - heading "Lead Clinical Software Architect" [level=3] [ref=e471]
          - heading "Systems Integration Group" [level=4] [ref=e472]
          - paragraph [ref=e473]: Architected distributed HIPAA-compliant streaming ODM XML parsers handling 2GB+ trials data within constant 50MB memory footprints. Transitioned local SQLite storage nodes to high-speed serverless Neon Postgres clusters utilizing native pooling.
          - generic [ref=e474]:
            - generic [ref=e475]: TypeScript
            - generic [ref=e476]: Neon Postgres
            - generic [ref=e477]: CDISC
            - generic [ref=e478]: HIPAA
            - generic [ref=e479]: SAX Parser
        - generic [ref=e484]:
          - text: 2020 — 2023
          - heading "Senior Systems Engineer & UI Specialist" [level=3] [ref=e485]
          - heading "Digital Physics Labs" [level=4] [ref=e486]
          - paragraph [ref=e487]: Developed hardware-accelerated text measuring and Bento grid wrapping engines using browser canvas and custom hooks. Maintained 60FPS refresh metrics under active resizing and heavy grid item swaps.
          - generic [ref=e488]:
            - generic [ref=e489]: React 19
            - generic [ref=e490]: Next.js 16
            - generic [ref=e491]: Framer Motion
            - generic [ref=e492]: Canvas API
            - generic [ref=e493]: DX Tooling
        - generic [ref=e498]:
          - text: 2019 — 2021
          - heading "Lead Volunteer & Technical Mentor" [level=3] [ref=e499]
          - heading "Civic Code for Humanity" [level=4] [ref=e500]
          - paragraph [ref=e501]: Partnered with local nonprofits to modernize their digital presence and data systems. Taught coding bootcamps for underprivileged youth, emphasizing creativity and problem-solving.
          - generic [ref=e502]:
            - generic [ref=e503]: Civic Impact
            - generic [ref=e504]: Education
            - generic [ref=e505]: Volunteering
            - generic [ref=e506]: Accessibility
        - generic [ref=e511]:
          - text: 2018 — 2020
          - heading "Full-Stack Developer" [level=3] [ref=e512]
          - heading "CoreFlow Technologies" [level=4] [ref=e513]
          - paragraph [ref=e514]: Pioneered DAG-based Visual Node Schema builders. Engineered immutable state trees, cycle validation compilers, and OpenAPI spec translators.
          - generic [ref=e515]:
            - generic [ref=e516]: React
            - generic [ref=e517]: Zustand
            - generic [ref=e518]: AST
            - generic [ref=e519]: JSON Schema
            - generic [ref=e520]: OpenAPI
        - generic [ref=e525]:
          - text: 2016 — 2018
          - heading "President, Computer Science Society" [level=3] [ref=e526]
          - heading "University Student Leadership" [level=4] [ref=e527]
          - paragraph [ref=e528]: Led a community of 500+ students, organized weekly workshops, and fostered a culture of collaborative learning. Built mentorship programs that connected underclassmen with alumni.
          - generic [ref=e529]:
            - generic [ref=e530]: Leadership
            - generic [ref=e531]: Community Building
            - generic [ref=e532]: Mentorship
            - generic [ref=e533]: Public Speaking
    - generic [ref=e535]:
      - heading "Get In Touch" [level=2] [ref=e536]
      - paragraph [ref=e537]: Let's Collaborate on Premium Engineering Projects
      - generic [ref=e538]:
        - link "Send an email to Frederick de Ruiter at contact@fderuiter.com" [ref=e539] [cursor=pointer]:
          - /url: mailto:contact@fderuiter.com
          - generic [ref=e540]: ✉
          - generic [ref=e541]: Email Broadcast
          - generic [ref=e542]: contact@fderuiter.com
        - link "View Frederick de Ruiter's GitHub profile externally" [ref=e543] [cursor=pointer]:
          - /url: https://github.com/fderuiter
          - generic [ref=e544]: 🐙
          - generic [ref=e545]: GitHub Repos
          - generic [ref=e546]: github.com/fderuiter
        - link "View Frederick de Ruiter's LinkedIn profile externally" [ref=e547] [cursor=pointer]:
          - /url: https://linkedin.com
          - generic [ref=e548]: in
          - generic [ref=e549]: LinkedIn Network
          - generic [ref=e550]: Secure Profile Link
      - generic [ref=e551]: DESIGNED & DEVELOPED BY FREDERICK DE RUITER
  - generic [ref=e558] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e559]:
      - img [ref=e560]
    - generic [ref=e565]:
      - button "Open issues overlay" [ref=e566]:
        - generic [ref=e567]:
          - generic [ref=e568]: "1"
          - generic [ref=e569]: "2"
        - generic [ref=e570]:
          - text: Issue
          - generic [ref=e571]: s
      - button "Collapse issues badge" [ref=e572]:
        - img [ref=e573]
  - alert [ref=e575]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Visual Regression & Drift Detection', () => {
  4  |   test('Case Study components snapshot (desktop)', async ({ page }) => {
  5  |     // Emulate reduced motion to disable JS transitions/animations
  6  |     await page.emulateMedia({ reducedMotion: 'reduce' });
  7  | 
  8  |     // Wait for the hydration and masonry layout to be stable
  9  |     await page.goto('/');
  10 |     
  11 |     // Disable animations for consistent snapshots
  12 |     await page.addStyleTag({
  13 |       content: `
  14 |         *, *::before, *::after {
  15 |           transition: none !important;
  16 |           animation: none !important;
  17 |         }
  18 |       `
  19 |     });
  20 | 
  21 |     // Wait for the Pretext measuring text to finish
  22 |     await page.waitForFunction(() => {
  23 |       return document.querySelector('.text-\\[9px\\]') && !document.querySelector('.text-\\[9px\\]')?.textContent?.includes('MEASURING...');
  24 |     });
  25 | 
  26 |     // Take full page snapshot to cover case study components
  27 |     await expect(page).toHaveScreenshot('home.png', {
  28 |       fullPage: true,
  29 |       maxDiffPixelRatio: 0.01,
  30 |     });
  31 |   });
  32 | 
  33 |   test('Layout constraints drift detection', async ({ page }) => {
  34 |     // Emulate reduced motion to disable JS transitions/animations
  35 |     await page.emulateMedia({ reducedMotion: 'reduce' });
  36 | 
  37 |     // Inject the global flag for the client so the component enables the checks
  38 |     await page.addInitScript(() => {
  39 |       (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ = true;
  40 |     });
  41 | 
  42 |     await page.goto('/');
  43 |     // Wait for the Pretext measuring text to finish
  44 |     await page.waitForFunction(() => {
  45 |       return document.querySelector('.text-\\[9px\\]') && !document.querySelector('.text-\\[9px\\]')?.textContent?.includes('MEASURING...');
  46 |     });
  47 | 
  48 |     // Check if any card reported a hydration mismatch via the data attribute
  49 |     const mismatchedCards = await page.locator('[data-hydration-mismatch="true"]').all();
  50 |     
  51 |     for (const card of mismatchedCards) {
  52 |       const expected = await card.getAttribute('data-expected-height');
  53 |       const actual = await card.getAttribute('data-actual-height');
  54 |       // If there's a mismatched card, this will intentionally fail the test
> 55 |       expect(actual, `Drift detected! Card mathematically expected ${expected}px but naturally measured ${actual}px. Update padding constants.`).toBe(expected);
     |                                                                                                                                                  ^ Error: Drift detected! Card mathematically expected 640px but naturally measured 617.72998046875px. Update padding constants.
  56 |     }
  57 |   });
  58 | });
  59 | 
```