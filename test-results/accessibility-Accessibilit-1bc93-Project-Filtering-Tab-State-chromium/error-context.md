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
      - generic [ref=e174]: I
      - generic [ref=e175]: build
      - generic [ref=e176]: resilient,
      - generic [ref=e177]: type-safe
      - generic [ref=e178]: infrastructure
      - generic [ref=e179]: that
      - generic [ref=e180]: connects
      - generic [ref=e181]: low-latency
      - generic [ref=e182]: client
      - generic [ref=e183]: interfaces
      - generic [ref=e184]: with
      - generic [ref=e185]: scalable
      - generic [ref=e186]: distributed
      - generic [ref=e187]: systems,
      - generic [ref=e188]: guaranteeing
      - generic [ref=e189]: extreme
      - generic [ref=e190]: security
      - generic [ref=e191]: boundaries
      - generic [ref=e192]: and
      - generic [ref=e193]: exceptional
      - generic [ref=e194]: performance.
    - generic [ref=e196]:
      - heading "System Architect & Design Engineer" [level=2] [ref=e197]
      - paragraph [ref=e198]: Engineering High-Performance Technical Solutions
      - generic [ref=e200]:
        - generic [ref=e202]:
          - generic [ref=e203]:
            - generic [ref=e204]: FDR
            - generic [ref=e205]:
              - heading "System Architect" [level=3] [ref=e206]
              - paragraph [ref=e207]: Principal Design Engineer
          - paragraph [ref=e208]: I am a full-stack design engineer who believes technology should ultimately serve and connect people. While my background is in building robust operational engines and responsive digital products, my core philosophy is rooted in creativity, playful problem-solving, and ensuring every system I build feels deeply human and accessible.
        - generic [ref=e210]:
          - heading "Live Telemetry API" [level=3] [ref=e211]
          - paragraph [ref=e212]: Dynamic repository programming languages aggregated dynamically via GitHub cached metrics.
          - generic [ref=e213]:
            - generic [ref=e215]:
              - generic [ref=e216]: Python
              - generic [ref=e217]: 32%
            - generic [ref=e220]:
              - generic [ref=e221]: Haskell
              - generic [ref=e222]: 30%
            - generic [ref=e225]:
              - generic [ref=e226]: TypeScript
              - generic [ref=e227]: 29%
            - generic [ref=e230]:
              - generic [ref=e231]: JavaScript
              - generic [ref=e232]: 4%
            - generic [ref=e235]:
              - generic [ref=e236]: CSS
              - generic [ref=e237]: 3%
        - generic [ref=e239]:
          - heading "Core Technical Specializations" [level=3] [ref=e240]
          - generic [ref=e241]:
            - generic [ref=e242]:
              - generic [ref=e243]: "01"
              - heading "Clinical Integrations" [level=4] [ref=e244]:
                - generic [ref=e245]: Clinical Integrations
              - paragraph [ref=e246]: Resilient XML streaming engines matching CDISC ODM schemas to FDA-compliant SDTM datasets.
            - generic [ref=e247]:
              - generic [ref=e248]: "02"
              - heading "Layout Physics" [level=4] [ref=e249]:
                - generic [ref=e250]: Layout Physics
              - paragraph [ref=e251]: DOM-free userland canvas calculation loops synchronized to bypass layout reflow thrashes.
            - generic [ref=e252]:
              - generic [ref=e253]: "03"
              - heading "Serverless Scaling" [level=4] [ref=e254]:
                - generic [ref=e255]: Serverless Scaling
              - paragraph [ref=e256]: Prisma WebSocket connectivity mappings linking pools into cloud Neon databases at 1ms latencies.
            - generic [ref=e257]:
              - generic [ref=e258]: "04"
              - heading "Full-Stack Security" [level=4] [ref=e259]
              - paragraph [ref=e260]: Strict HTML sanitizers, encrypted HIPAA token rotation schemes, and dynamic sitemaps.
      - heading "Professional Experience Timeline" [level=3] [ref=e261]
      - paragraph [ref=e262]:
        - text: A Chronological Evolution of
        - generic [ref=e263]: Systems Rigor
      - generic [ref=e267]:
        - generic [ref=e272]:
          - text: 2023 — Present
          - heading "Lead Clinical Software Architect" [level=3] [ref=e273]
          - heading "Systems Integration Group" [level=4] [ref=e274]
          - paragraph [ref=e275]: Architected distributed HIPAA-compliant streaming ODM XML parsers handling 2GB+ trials data within constant 50MB memory footprints. Transitioned local SQLite storage nodes to high-speed serverless Neon Postgres clusters utilizing native pooling.
          - generic [ref=e276]:
            - generic [ref=e277]: TypeScript
            - generic [ref=e278]: Neon Postgres
            - generic [ref=e279]: CDISC
            - generic [ref=e280]: HIPAA
            - generic [ref=e281]: SAX Parser
        - generic [ref=e286]:
          - text: 2020 — 2023
          - heading "Senior Systems Engineer & UI Specialist" [level=3] [ref=e287]
          - heading "Digital Physics Labs" [level=4] [ref=e288]
          - paragraph [ref=e289]: Developed hardware-accelerated text measuring and Bento grid wrapping engines using browser canvas and custom hooks. Maintained 60FPS refresh metrics under active resizing and heavy grid item swaps.
          - generic [ref=e290]:
            - generic [ref=e291]: React 19
            - generic [ref=e292]: Next.js 16
            - generic [ref=e293]: Framer Motion
            - generic [ref=e294]: Canvas API
            - generic [ref=e295]: DX Tooling
        - generic [ref=e300]:
          - text: 2019 — 2021
          - heading "Lead Volunteer & Technical Mentor" [level=3] [ref=e301]
          - heading "Civic Code for Humanity" [level=4] [ref=e302]
          - paragraph [ref=e303]: Partnered with local nonprofits to modernize their digital presence and data systems. Taught coding bootcamps for underprivileged youth, emphasizing creativity and problem-solving.
          - generic [ref=e304]:
            - generic [ref=e305]: Civic Impact
            - generic [ref=e306]: Education
            - generic [ref=e307]: Volunteering
            - generic [ref=e308]: Accessibility
        - generic [ref=e313]:
          - text: 2018 — 2020
          - heading "Full-Stack Developer" [level=3] [ref=e314]
          - heading "CoreFlow Technologies" [level=4] [ref=e315]
          - paragraph [ref=e316]: Pioneered DAG-based Visual Node Schema builders. Engineered immutable state trees, cycle validation compilers, and OpenAPI spec translators.
          - generic [ref=e317]:
            - generic [ref=e318]: React
            - generic [ref=e319]: Zustand
            - generic [ref=e320]: AST
            - generic [ref=e321]: JSON Schema
            - generic [ref=e322]: OpenAPI
        - generic [ref=e327]:
          - text: 2016 — 2018
          - heading "President, Computer Science Society" [level=3] [ref=e328]
          - heading "University Student Leadership" [level=4] [ref=e329]
          - paragraph [ref=e330]: Led a community of 500+ students, organized weekly workshops, and fostered a culture of collaborative learning. Built mentorship programs that connected underclassmen with alumni.
          - generic [ref=e331]:
            - generic [ref=e332]: Leadership
            - generic [ref=e333]: Community Building
            - generic [ref=e334]: Mentorship
            - generic [ref=e335]: Public Speaking
    - generic [ref=e337]:
      - heading "Get In Touch" [level=2] [ref=e338]
      - paragraph [ref=e339]: Let's Collaborate on Premium Engineering Projects
      - generic [ref=e340]:
        - link "Send an email to Frederick de Ruiter at contact@fderuiter.com" [ref=e341] [cursor=pointer]:
          - /url: mailto:contact@fderuiter.com
          - generic [ref=e342]: ✉
          - generic [ref=e343]: Email Broadcast
          - generic [ref=e344]: contact@fderuiter.com
        - link "View Frederick de Ruiter's GitHub profile externally" [ref=e345] [cursor=pointer]:
          - /url: https://github.com/fderuiter
          - generic [ref=e346]: 🐙
          - generic [ref=e347]: GitHub Repos
          - generic [ref=e348]: github.com/fderuiter
        - link "View Frederick de Ruiter's LinkedIn profile externally" [ref=e349] [cursor=pointer]:
          - /url: https://linkedin.com
          - generic [ref=e350]: in
          - generic [ref=e351]: LinkedIn Network
          - generic [ref=e352]: Secure Profile Link
      - generic [ref=e353]: DESIGNED & DEVELOPED BY FREDERICK DE RUITER
  - generic [ref=e360] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e361]:
      - img [ref=e362]
    - generic [ref=e365]:
      - button "Open issues overlay" [ref=e366]:
        - generic [ref=e367]:
          - generic [ref=e368]: "0"
          - generic [ref=e369]: "1"
        - generic [ref=e370]: Issue
      - button "Collapse issues badge" [ref=e371]:
        - img [ref=e372]
  - alert [ref=e374]
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