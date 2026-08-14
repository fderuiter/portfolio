# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> Accessibility Audit Suite >> Audit: Interactive Project Filtering Tab State
- Location: __tests__/e2e/accessibility.spec.ts:113:7

# Error details

```
Error: Found 1 critical/serious accessibility violations after TypeScript filtering

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "FDERUITER" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e8]: FDERUITER
      - generic [ref=e9]:
        - navigation [ref=e10]:
          - link "Work" [ref=e11] [cursor=pointer]:
            - /url: /#case-studies
          - link "About" [ref=e12] [cursor=pointer]:
            - /url: /#about
          - link "Proof Workspace" [ref=e13] [cursor=pointer]:
            - /url: /proof
          - link "Transparency" [ref=e14] [cursor=pointer]:
            - /url: /transparency
          - link "Simulator" [ref=e15] [cursor=pointer]:
            - /url: /simulator
          - link "Contact" [ref=e16] [cursor=pointer]:
            - /url: /#contact
          - link "GitHub ↗" [ref=e17] [cursor=pointer]:
            - /url: https://github.com/fderuiter/portfolio
            - text: GitHub
            - generic [ref=e18]: ↗
        - button "Sound Settings" [ref=e20] [cursor=pointer]:
          - img [ref=e21]
          - generic [ref=e26]: "SOUND: OFF"
          - img [ref=e27]
  - generic [ref=e29]:
    - generic [ref=e30]:
      - generic:
        - img:
          - img
      - generic [ref=e31]:
        - generic [ref=e32]: FREDERICK DE RUITER · PRINCIPAL SYSTEMS ENGINEER
        - generic [ref=e33]:
          - generic:
            - generic:
              - generic: Engineering
              - generic: the
              - generic: Interface
              - generic: Between
              - generic: Data
              - generic: and
              - generic: Meaning
          - heading "Engineering the Interface Between Data and Meaning" [level=1] [ref=e34]
        - generic [ref=e35]:
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
          - paragraph [ref=e36]: Connecting high-performance canvas layout engines, serverless Postgres data streams, and clinical data integration clients into a unified engineering showcase.
        - generic [ref=e37]:
          - link "Explore Engineering" [ref=e38] [cursor=pointer]:
            - /url: "#case-studies"
            - text: Explore Engineering
          - link "GitHub Repository" [ref=e40] [cursor=pointer]:
            - /url: https://github.com/fderuiter/portfolio
            - img [ref=e41]
            - text: GitHub Repository
    - main [ref=e43]:
      - generic [ref=e44]:
        - heading "Unified Engineering Showcase" [level=2] [ref=e45]
        - paragraph [ref=e46]: Verifiable Serverless Postgres Architecture
        - generic [ref=e51]: Operational · Serverless Neon Postgres Active
        - generic [ref=e52]:
          - 'heading "Personal Highlights: Creative Engineering" [level=3] [ref=e53]': "Personal Highlights: Creative Engineering"
          - paragraph [ref=e55]: Beyond standard engineering deep-dives, I build playful and interactive physics experiments to explore user engagement through unexpected UI forms.
          - link "Explore the Laser Loon & UI Sandbox" [ref=e56] [cursor=pointer]:
            - /url: /ui-sandbox
            - text: Explore the Laser Loon & UI Sandbox
            - img [ref=e57]
        - generic [ref=e59]:
          - generic [ref=e60]:
            - button "ALL PROJECTS" [ref=e61] [cursor=pointer]
            - button "TYPESCRIPT" [active] [ref=e62] [cursor=pointer]: TYPESCRIPT
            - button "PYTHON" [ref=e64] [cursor=pointer]
            - button "HASKELL" [ref=e65] [cursor=pointer]
          - generic [ref=e73]:
            - generic [ref=e74]:
              - generic [ref=e75]:
                - generic [ref=e76]: TypeScript
                - generic [ref=e77]: SCHEMAFLOW
              - generic [ref=e78]: "SchemaFlow: Reactive Node Engine"
              - generic [ref=e79]:
                - button "THE PITCH" [ref=e80] [cursor=pointer]
                - button "THE REALITY" [ref=e81] [cursor=pointer]
              - generic [ref=e85]:
                - generic:
                  - generic:
                    - generic: A
                    - generic: reactive
                    - generic: ","
                    - generic: visual graph editor
                    - generic: built in
                    - generic: TypeScript
                    - generic: .
                - paragraph [ref=e86]:
                  - text: A
                  - strong [ref=e87]: reactive
                  - text: ","
                  - code [ref=e88]: visual graph editor
                  - text: built in
                  - strong [ref=e89]: TypeScript
                  - text: .
              - generic [ref=e90]:
                - generic [ref=e91]:
                  - generic [ref=e92]:
                    - generic [ref=e93]: Commit Activity (12 Months)
                    - generic [ref=e94]: 249 Commits
                  - 'img "GitHub commit activity timeline over the last 12 months. Total commits: 249" [ref=e96]'
                - generic [ref=e99]:
                  - generic [ref=e100]:
                    - img [ref=e101]
                    - generic [ref=e103]: "148"
                    - text: STARS
                  - generic [ref=e104]:
                    - img [ref=e105]
                    - generic [ref=e110]: "24"
                    - text: FORKS
                  - generic [ref=e111]:
                    - img [ref=e112]
                    - generic [ref=e114]: "3"
                    - text: ISSUES
                - generic [ref=e115]:
                  - generic [ref=e116]:
                    - generic [ref=e117]: LANGUAGE STACK
                    - generic [ref=e118]: TypeScript 88%
                  - generic [ref=e119]:
                    - 'generic "TypeScript: 88%" [ref=e120]'
                    - 'generic "JavaScript: 12%" [ref=e121]'
                  - generic [ref=e122]:
                    - generic [ref=e123]: TypeScript (88%)
                    - generic [ref=e125]: JavaScript (12%)
                - generic [ref=e127]:
                  - generic [ref=e128]:
                    - img [ref=e129]
                    - generic [ref=e131]: git log --oneline -n 5
                  - generic [ref=e132]:
                    - generic [ref=e133]:
                      - generic [ref=e134]: f1d2e3a
                      - generic [ref=e135]: "|"
                      - 'generic "perf: optimize web worker message transfer serialization" [ref=e136]'
                    - generic [ref=e137]:
                      - generic [ref=e138]: c4b5a6f
                      - generic [ref=e139]: "|"
                      - 'generic "feat: add cyclic dependency detection algorithm to DAG core" [ref=e140]'
                    - generic [ref=e141]:
                      - generic [ref=e142]: e7d8c9b
                      - generic [ref=e143]: "|"
                      - 'generic "refactor: migrate state management store to Zustand" [ref=e144]'
                    - generic [ref=e145]:
                      - generic [ref=e146]: a1b2c3d
                      - generic [ref=e147]: "|"
                      - 'generic "test: add integration test suite for AST compilation" [ref=e148]'
                    - generic [ref=e149]:
                      - generic [ref=e150]: 4f5e6d7
                      - generic [ref=e151]: "|"
                      - 'generic "initial commit: basic node workspace layout and setup" [ref=e152]'
            - generic [ref=e153]:
              - generic "Aggregate Page Views" [ref=e154]:
                - generic [ref=e156]: "Live page views: 0"
                - generic [ref=e157]: "0"
                - generic [ref=e158]: VIEWS
              - generic "Bento Card Interactions" [ref=e159]:
                - generic [ref=e161]: "Live clicks: 0"
                - generic [ref=e162]: "0"
                - generic [ref=e163]: CLICKS
            - generic [ref=e164]:
              - link "Analyze Architecture" [ref=e165] [cursor=pointer]:
                - /url: /case-studies/schemaflow
                - generic [ref=e166]: Analyze Architecture
                - img [ref=e167]
              - generic [ref=e169]: "H: 622px"
    - generic [ref=e173]:
      - generic [ref=e174]:
        - generic [ref=e175]: I
        - text: I
      - generic [ref=e176]:
        - generic [ref=e177]: build
        - text: build
      - generic [ref=e178]:
        - generic [ref=e179]: resilient,
        - text: resilient,
      - generic [ref=e180]:
        - generic [ref=e181]: type-safe
        - text: type-safe
      - generic [ref=e182]:
        - generic [ref=e183]: infrastructure
        - text: infrastructure
      - generic [ref=e184]:
        - generic [ref=e185]: that
        - text: that
      - generic [ref=e186]:
        - generic [ref=e187]: connects
        - text: connects
      - generic [ref=e188]:
        - generic [ref=e189]: low-latency
        - text: low-latency
      - generic [ref=e190]:
        - generic [ref=e191]: client
        - text: client
      - generic [ref=e192]:
        - generic [ref=e193]: interfaces
        - text: interfaces
      - generic [ref=e194]:
        - generic [ref=e195]: with
        - text: with
      - generic [ref=e196]:
        - generic [ref=e197]: scalable
        - text: scalable
      - generic [ref=e198]:
        - generic [ref=e199]: distributed
        - text: distributed
      - generic [ref=e200]:
        - generic [ref=e201]: systems,
        - text: systems,
      - generic [ref=e202]:
        - generic [ref=e203]: guaranteeing
        - text: guaranteeing
      - generic [ref=e204]:
        - generic [ref=e205]: extreme
        - text: extreme
      - generic [ref=e206]:
        - generic [ref=e207]: security
        - text: security
      - generic [ref=e208]:
        - generic [ref=e209]: boundaries
        - text: boundaries
      - generic [ref=e210]:
        - generic [ref=e211]: and
        - text: and
      - generic [ref=e212]:
        - generic [ref=e213]: exceptional
        - text: exceptional
      - generic [ref=e214]:
        - generic [ref=e215]: performance.
        - text: performance.
    - generic [ref=e217]:
      - heading "System Architect & Design Engineer" [level=2] [ref=e218]
      - paragraph [ref=e219]: Engineering High-Performance Technical Solutions
      - generic [ref=e221]:
        - generic [ref=e223]:
          - generic [ref=e224]:
            - generic [ref=e225]: FDR
            - generic [ref=e226]:
              - heading "System Architect" [level=3] [ref=e227]
              - paragraph [ref=e228]: Principal Design Engineer
          - paragraph [ref=e229]: I am a full-stack design engineer who believes technology should ultimately serve and connect people. While my background is in building robust operational engines and responsive digital products, my core philosophy is rooted in creativity, playful problem-solving, and ensuring every system I build feels deeply human and accessible.
        - generic [ref=e231]:
          - heading "Live Telemetry API" [level=3] [ref=e232]
          - paragraph [ref=e233]: Dynamic repository programming languages aggregated dynamically via GitHub cached metrics.
          - generic [ref=e234]:
            - generic [ref=e236]:
              - generic [ref=e237]: Python
              - generic [ref=e238]: 32%
            - generic [ref=e241]:
              - generic [ref=e242]: Haskell
              - generic [ref=e243]: 30%
            - generic [ref=e246]:
              - generic [ref=e247]: TypeScript
              - generic [ref=e248]: 29%
            - generic [ref=e251]:
              - generic [ref=e252]: JavaScript
              - generic [ref=e253]: 4%
            - generic [ref=e256]:
              - generic [ref=e257]: CSS
              - generic [ref=e258]: 3%
        - generic [ref=e260]:
          - heading "Core Technical Specializations" [level=3] [ref=e261]
          - generic [ref=e262]:
            - generic [ref=e263]:
              - generic [ref=e264]: "01"
              - heading "Clinical Integrations" [level=4] [ref=e265]:
                - generic [ref=e266]: Clinical Integrations
              - paragraph [ref=e267]: Resilient XML streaming engines matching CDISC ODM schemas to FDA-compliant SDTM datasets.
            - generic [ref=e268]:
              - generic [ref=e269]: "02"
              - heading "Layout Physics" [level=4] [ref=e270]:
                - generic [ref=e271]: Layout Physics
              - paragraph [ref=e272]: DOM-free userland canvas calculation loops synchronized to bypass layout reflow thrashes.
            - generic [ref=e273]:
              - generic [ref=e274]: "03"
              - heading "Serverless Scaling" [level=4] [ref=e275]:
                - generic [ref=e276]: Serverless Scaling
              - paragraph [ref=e277]: Prisma WebSocket connectivity mappings linking pools into cloud Neon databases at 1ms latencies.
            - generic [ref=e278]:
              - generic [ref=e279]: "04"
              - heading "Full-Stack Security" [level=4] [ref=e280]
              - paragraph [ref=e281]: Strict HTML sanitizers, encrypted HIPAA token rotation schemes, and dynamic sitemaps.
      - heading "Professional Experience Timeline" [level=3] [ref=e282]
      - paragraph [ref=e283]:
        - text: A Chronological Evolution of
        - generic [ref=e284]: Systems Rigor
      - generic [ref=e288]:
        - generic [ref=e293]:
          - text: 2023 — Present
          - heading "Lead Clinical Software Architect" [level=3] [ref=e294]
          - heading "Systems Integration Group" [level=4] [ref=e295]
          - paragraph [ref=e296]: Architected distributed HIPAA-compliant streaming ODM XML parsers handling 2GB+ trials data within constant 50MB memory footprints. Transitioned local SQLite storage nodes to high-speed serverless Neon Postgres clusters utilizing native pooling.
          - generic [ref=e297]:
            - generic [ref=e298]: TypeScript
            - generic [ref=e299]: Neon Postgres
            - generic [ref=e300]: CDISC
            - generic [ref=e301]: HIPAA
            - generic [ref=e302]: SAX Parser
        - generic [ref=e307]:
          - text: 2020 — 2023
          - heading "Senior Systems Engineer & UI Specialist" [level=3] [ref=e308]
          - heading "Digital Physics Labs" [level=4] [ref=e309]
          - paragraph [ref=e310]: Developed hardware-accelerated text measuring and Bento grid wrapping engines using browser canvas and custom hooks. Maintained 60FPS refresh metrics under active resizing and heavy grid item swaps.
          - generic [ref=e311]:
            - generic [ref=e312]: React 19
            - generic [ref=e313]: Next.js 16
            - generic [ref=e314]: Framer Motion
            - generic [ref=e315]: Canvas API
            - generic [ref=e316]: DX Tooling
        - generic [ref=e321]:
          - text: 2019 — 2021
          - heading "Lead Volunteer & Technical Mentor" [level=3] [ref=e322]
          - heading "Civic Code for Humanity" [level=4] [ref=e323]
          - paragraph [ref=e324]: Partnered with local nonprofits to modernize their digital presence and data systems. Taught coding bootcamps for underprivileged youth, emphasizing creativity and problem-solving.
          - generic [ref=e325]:
            - generic [ref=e326]: Civic Impact
            - generic [ref=e327]: Education
            - generic [ref=e328]: Volunteering
            - generic [ref=e329]: Accessibility
        - generic [ref=e334]:
          - text: 2018 — 2020
          - heading "Full-Stack Developer" [level=3] [ref=e335]
          - heading "CoreFlow Technologies" [level=4] [ref=e336]
          - paragraph [ref=e337]: Pioneered DAG-based Visual Node Schema builders. Engineered immutable state trees, cycle validation compilers, and OpenAPI spec translators.
          - generic [ref=e338]:
            - generic [ref=e339]: React
            - generic [ref=e340]: Zustand
            - generic [ref=e341]: AST
            - generic [ref=e342]: JSON Schema
            - generic [ref=e343]: OpenAPI
        - generic [ref=e348]:
          - text: 2016 — 2018
          - heading "President, Computer Science Society" [level=3] [ref=e349]
          - heading "University Student Leadership" [level=4] [ref=e350]
          - paragraph [ref=e351]: Led a community of 500+ students, organized weekly workshops, and fostered a culture of collaborative learning. Built mentorship programs that connected underclassmen with alumni.
          - generic [ref=e352]:
            - generic [ref=e353]: Leadership
            - generic [ref=e354]: Community Building
            - generic [ref=e355]: Mentorship
            - generic [ref=e356]: Public Speaking
    - generic [ref=e358]:
      - heading "Get In Touch" [level=2] [ref=e359]
      - paragraph [ref=e360]: Let's Collaborate on Premium Engineering Projects
      - generic [ref=e361]:
        - link "Send an email to Frederick de Ruiter at contact@fderuiter.com" [ref=e362] [cursor=pointer]:
          - /url: mailto:contact@fderuiter.com
          - generic [ref=e363]: ✉
          - generic [ref=e364]: Email Broadcast
          - generic [ref=e365]: contact@fderuiter.com
        - link "View Frederick de Ruiter's GitHub profile externally" [ref=e366] [cursor=pointer]:
          - /url: https://github.com/fderuiter
          - generic [ref=e367]: 🐙
          - generic [ref=e368]: GitHub Repos
          - generic [ref=e369]: github.com/fderuiter
        - link "View Frederick de Ruiter's LinkedIn profile externally" [ref=e370] [cursor=pointer]:
          - /url: https://linkedin.com
          - generic [ref=e371]: in
          - generic [ref=e372]: LinkedIn Network
          - generic [ref=e373]: Secure Profile Link
      - generic [ref=e374]: DESIGNED & DEVELOPED BY FREDERICK DE RUITER
  - generic [ref=e381] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e382]:
      - img [ref=e383]
    - generic [ref=e386]:
      - button "Open issues overlay" [ref=e387]:
        - generic [ref=e388]:
          - generic [ref=e389]: "0"
          - generic [ref=e390]: "1"
        - generic [ref=e391]: Issue
      - button "Collapse issues badge" [ref=e392]:
        - img [ref=e393]
  - alert [ref=e395]
```

# Test source

```ts
  33  |     timestamp: new Date().toISOString()
  34  |   };
  35  |   
  36  |   fs.writeFileSync(filePath, JSON.stringify(resultData, null, 2));
  37  | }
  38  | 
  39  | // Helper to format failure messages clearly in terminal logs
  40  | function formatViolationsForLog(projectName: string, stateName: string, violations: any[]): string {
  41  |   if (violations.length === 0) return '';
  42  |   let log = `\n==================================================\n`;
  43  |   log += `🚨 ACCESSIBILITY VIOLATIONS DETECTED (${projectName} - ${stateName})\n`;
  44  |   log += `Found ${violations.length} critical or serious violations.\n`;
  45  |   log += `==================================================\n\n`;
  46  | 
  47  |   violations.forEach((violation, idx) => {
  48  |     log += `Violation #${idx + 1}:\n`;
  49  |     log += `  Rule ID:     ${violation.id}\n`;
  50  |     log += `  Severity:    ${violation.impact}\n`;
  51  |     log += `  Description: ${violation.description}\n`;
  52  |     log += `  Help:        ${violation.help}\n`;
  53  |     log += `  Help URL:    ${violation.helpUrl}\n`;
  54  |     log += `  Affected Elements:\n`;
  55  |     violation.nodes.forEach((node: any, nIdx: number) => {
  56  |       log += `    Element ${nIdx + 1}:\n`;
  57  |       log += `      CSS Selector: ${node.target.join(' > ')}\n`;
  58  |       log += `      HTML snippet: ${node.html}\n`;
  59  |     });
  60  |     log += `--------------------------------------------------\n\n`;
  61  |   });
  62  |   return log;
  63  | }
  64  | 
  65  | test.describe('Accessibility Audit Suite', () => {
  66  |   test.beforeEach(async ({ page }) => {
  67  |     // Emulate reduced motion to disable JS transitions/animations
  68  |     await page.emulateMedia({ reducedMotion: 'reduce' });
  69  | 
  70  |     // Inject the global flag for the client so components enable specific testing behaviors if needed
  71  |     await page.addInitScript(() => {
  72  |       (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ = true;
  73  |     });
  74  | 
  75  |     // Go to landing page
  76  |     await page.goto('/');
  77  | 
  78  |     // Disable animations for consistent layout scanning
  79  |     await page.addStyleTag({
  80  |       content: `
  81  |         *, *::before, *::after {
  82  |           transition: none !important;
  83  |           animation: none !important;
  84  |         }
  85  |       `
  86  |     });
  87  | 
  88  |     // The app polls telemetry, so networkidle is not a valid readiness signal.
  89  |     // Wait for every Pretext card to finish its deterministic measurement instead.
  90  |     await page.waitForFunction(() => {
  91  |       const elements = Array.from(document.querySelectorAll('.text-\\[9px\\]'));
  92  |       return elements.length > 0 && elements.every((el) => !el.textContent?.includes('MEASURING...'));
  93  |     });
  94  |     await page.waitForTimeout(500);
  95  |   });
  96  | 
  97  |   test('Audit: Default Landing Page State', async ({ page }, testInfo) => {
  98  |     const results = await new AxeBuilder({ page }).analyze();
  99  |     const criticalSerious = results.violations.filter(
  100 |       v => v.impact === 'critical' || v.impact === 'serious'
  101 |     );
  102 | 
  103 |     saveResult(testInfo.project.name, 'Default Page State', criticalSerious, page.url());
  104 | 
  105 |     if (criticalSerious.length > 0) {
  106 |       const errorLog = formatViolationsForLog(testInfo.project.name, 'Default Page State', criticalSerious);
  107 |       console.error(errorLog);
  108 |     }
  109 | 
  110 |     expect(criticalSerious.length, `Found ${criticalSerious.length} critical/serious accessibility violations in Default Page State`).toBe(0);
  111 |   });
  112 | 
  113 |   test('Audit: Interactive Project Filtering Tab State', async ({ page }, testInfo) => {
  114 |     // Find and click the TypeScript button
  115 |     const filterBtn = page.locator('button:has-text("TypeScript")');
  116 |     await filterBtn.click();
  117 |     
  118 |     // Brief timeout to let masonry state transition complete
  119 |     await page.waitForTimeout(500);
  120 | 
  121 |     const results = await new AxeBuilder({ page }).analyze();
  122 |     const criticalSerious = results.violations.filter(
  123 |       v => v.impact === 'critical' || v.impact === 'serious'
  124 |     );
  125 | 
  126 |     saveResult(testInfo.project.name, 'Interactive State: TypeScript Filter', criticalSerious, page.url());
  127 | 
  128 |     if (criticalSerious.length > 0) {
  129 |       const errorLog = formatViolationsForLog(testInfo.project.name, 'Interactive State: TypeScript Filter', criticalSerious);
  130 |       console.error(errorLog);
  131 |     }
  132 | 
> 133 |     expect(criticalSerious.length, `Found ${criticalSerious.length} critical/serious accessibility violations after TypeScript filtering`).toBe(0);
      |                                                                                                                                            ^ Error: Found 1 critical/serious accessibility violations after TypeScript filtering
  134 |   });
  135 | 
  136 |   test('Audit: Active Command Palette Search State', async ({ page }, testInfo) => {
  137 |     // Wait for the dynamic CommandPalette client-side chunk to load and register the helper
  138 |     await page.waitForFunction(() => typeof (window as any).__openSearch === 'function', { timeout: 15000 });
  139 | 
  140 |     // Open Command Palette via global test handler
  141 |     await page.evaluate(() => {
  142 |       if (typeof (window as any).__openSearch === 'function') {
  143 |         (window as any).__openSearch();
  144 |       }
  145 |     });
  146 |     
  147 |     // Wait for the modal combobox to be visible
  148 |     const combobox = page.locator('[role="combobox"]');
  149 |     await expect(combobox).toBeVisible();
  150 | 
  151 |     // Take an initial scan of the opened command palette
  152 |     const results = await new AxeBuilder({ page }).analyze();
  153 |     const criticalSerious = results.violations.filter(
  154 |       v => v.impact === 'critical' || v.impact === 'serious'
  155 |     );
  156 | 
  157 |     // Also let's type inside search to trigger dynamic updates and audit that
  158 |     await combobox.fill('TypeScript');
  159 |     await page.waitForTimeout(300);
  160 | 
  161 |     const resultsFiltered = await new AxeBuilder({ page }).analyze();
  162 |     const criticalSeriousFiltered = resultsFiltered.violations.filter(
  163 |       v => v.impact === 'critical' || v.impact === 'serious'
  164 |     );
  165 | 
  166 |     // Merge violations found in both search states
  167 |     const mergedViolationsMap = new Map<string, any>();
  168 |     [...criticalSerious, ...criticalSeriousFiltered].forEach(v => {
  169 |       mergedViolationsMap.set(v.id, v);
  170 |     });
  171 |     const combinedCriticalSerious = Array.from(mergedViolationsMap.values());
  172 | 
  173 |     saveResult(testInfo.project.name, 'Interactive State: Active Command Palette', combinedCriticalSerious, page.url());
  174 | 
  175 |     if (combinedCriticalSerious.length > 0) {
  176 |       const errorLog = formatViolationsForLog(testInfo.project.name, 'Interactive State: Active Command Palette', combinedCriticalSerious);
  177 |       console.error(errorLog);
  178 |     }
  179 | 
  180 |     expect(combinedCriticalSerious.length, `Found ${combinedCriticalSerious.length} critical/serious accessibility violations in Active Command Palette State`).toBe(0);
  181 |   });
  182 | });
  183 | 
```