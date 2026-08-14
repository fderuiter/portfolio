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
          - generic [ref=e66]:
            - generic [ref=e73]:
              - generic [ref=e74]:
                - generic [ref=e75]:
                  - generic [ref=e76]: TypeScript
                  - generic [ref=e77]: SCHEMAFLOW
                - generic [ref=e78]: "SchemaFlow: Reactive Node Engine for Schema Composition"
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
                      - generic: and
                      - generic: React
                    - generic:
                      - generic: that allows system architects to visually compose, validate, and
                    - generic:
                      - generic: compile complex
                      - generic: JSON Schema
                      - generic: structures in real time. Features
                    - generic:
                      - generic: highly responsive
                      - generic: node evaluation
                      - generic: ", cyclical dependency"
                    - generic:
                      - generic: detection, and live
                      - generic: code generation
                      - generic: .
                  - paragraph [ref=e86]:
                    - text: A
                    - strong [ref=e87]: reactive
                    - text: ","
                    - code [ref=e88]: visual graph editor
                    - text: built in
                    - strong [ref=e89]: TypeScript
                    - text: and
                    - strong [ref=e90]: React
                    - text: that allows system architects to visually compose, validate, and compile complex
                    - code [ref=e91]: JSON Schema
                    - text: structures in real time. Features highly responsive
                    - code [ref=e92]: node evaluation
                    - text: ", cyclical dependency detection, and live"
                    - code [ref=e93]: code generation
                    - text: .
                - generic [ref=e94]:
                  - generic [ref=e95]:
                    - generic [ref=e96]:
                      - generic [ref=e97]: Commit Activity (12 Months)
                      - generic [ref=e98]: 249 Commits
                    - 'img "GitHub commit activity timeline over the last 12 months. Total commits: 249" [ref=e100]'
                  - generic [ref=e103]:
                    - generic [ref=e104]:
                      - img [ref=e105]
                      - generic [ref=e107]: "148"
                      - text: STARS
                    - generic [ref=e108]:
                      - img [ref=e109]
                      - generic [ref=e114]: "24"
                      - text: FORKS
                    - generic [ref=e115]:
                      - img [ref=e116]
                      - generic [ref=e118]: "3"
                      - text: ISSUES
                  - generic [ref=e119]:
                    - generic [ref=e120]:
                      - generic [ref=e121]: LANGUAGE STACK
                      - generic [ref=e122]: TypeScript 88%
                    - generic [ref=e123]:
                      - 'generic "TypeScript: 88%" [ref=e124]'
                      - 'generic "JavaScript: 12%" [ref=e125]'
                    - generic [ref=e126]:
                      - generic [ref=e127]: TypeScript (88%)
                      - generic [ref=e129]: JavaScript (12%)
                  - generic [ref=e131]:
                    - generic [ref=e132]:
                      - img [ref=e133]
                      - generic [ref=e135]: git log --oneline -n 5
                    - generic [ref=e136]:
                      - generic [ref=e137]:
                        - generic [ref=e138]: f1d2e3a
                        - generic [ref=e139]: "|"
                        - 'generic "perf: optimize web worker message transfer serialization" [ref=e140]'
                      - generic [ref=e141]:
                        - generic [ref=e142]: c4b5a6f
                        - generic [ref=e143]: "|"
                        - 'generic "feat: add cyclic dependency detection algorithm to DAG core" [ref=e144]'
                      - generic [ref=e145]:
                        - generic [ref=e146]: e7d8c9b
                        - generic [ref=e147]: "|"
                        - 'generic "refactor: migrate state management store to Zustand" [ref=e148]'
                      - generic [ref=e149]:
                        - generic [ref=e150]: a1b2c3d
                        - generic [ref=e151]: "|"
                        - 'generic "test: add integration test suite for AST compilation" [ref=e152]'
                      - generic [ref=e153]:
                        - generic [ref=e154]: 4f5e6d7
                        - generic [ref=e155]: "|"
                        - 'generic "initial commit: basic node workspace layout and setup" [ref=e156]'
              - generic [ref=e157]:
                - generic "Aggregate Page Views" [ref=e158]:
                  - generic [ref=e160]: "Live page views: 0"
                  - generic [ref=e161]: "0"
                  - generic [ref=e162]: VIEWS
                - generic "Bento Card Interactions" [ref=e163]:
                  - generic [ref=e165]: "Live clicks: 0"
                  - generic [ref=e166]: "0"
                  - generic [ref=e167]: CLICKS
              - generic [ref=e168]:
                - link "Analyze Architecture" [ref=e169] [cursor=pointer]:
                  - /url: /case-studies/schemaflow
                  - generic [ref=e170]: Analyze Architecture
                  - img [ref=e171]
                - generic [ref=e173]: "H: 694px"
            - generic [ref=e180]:
              - generic [ref=e181]:
                - generic [ref=e182]:
                  - generic [ref=e183]: TypeScript
                  - generic [ref=e184]: CLINICAL-DATA-MAPPER
                - generic [ref=e185]: "Clinical Data Standards Engine: CDISC ODM and SDTM Integration"
                - generic [ref=e186]:
                  - button "THE PITCH" [ref=e187] [cursor=pointer]
                  - button "THE REALITY" [ref=e188] [cursor=pointer]
                - generic [ref=e192]:
                  - generic:
                    - generic:
                      - generic: An enterprise-grade
                      - generic: TypeScript
                      - generic: mapping pipeline that ingests
                    - generic:
                      - generic: clinical trial metadata in
                      - generic: CDISC Operational Data Model (ODM)
                    - generic:
                      - generic: XML format, dynamically constructs
                      - generic: data schemas
                      - generic: ", and"
                    - generic:
                      - generic: transforms raw
                      - generic: Electronic Data Capture (EDC)
                      - generic: datasets into
                    - generic:
                      - generic: compliant
                      - generic: CDISC SDTM
                      - generic: domains.
                  - paragraph [ref=e193]:
                    - text: An enterprise-grade
                    - strong [ref=e194]: TypeScript
                    - text: mapping pipeline that ingests clinical trial metadata in
                    - code [ref=e195]: CDISC Operational Data Model (ODM)
                    - text: XML format, dynamically constructs
                    - code [ref=e196]: data schemas
                    - text: ", and transforms raw"
                    - code [ref=e197]: Electronic Data Capture (EDC)
                    - text: datasets into compliant
                    - strong [ref=e198]: CDISC SDTM
                    - text: domains.
                - generic [ref=e199]:
                  - generic [ref=e200]:
                    - generic [ref=e201]:
                      - generic [ref=e202]: Commit Activity (12 Months)
                      - generic [ref=e203]: 249 Commits
                    - 'img "GitHub commit activity timeline over the last 12 months. Total commits: 249" [ref=e205]'
                  - generic [ref=e208]:
                    - generic [ref=e209]:
                      - img [ref=e210]
                      - generic [ref=e212]: "148"
                      - text: STARS
                    - generic [ref=e213]:
                      - img [ref=e214]
                      - generic [ref=e219]: "24"
                      - text: FORKS
                    - generic [ref=e220]:
                      - img [ref=e221]
                      - generic [ref=e223]: "3"
                      - text: ISSUES
                  - generic [ref=e224]:
                    - generic [ref=e225]:
                      - generic [ref=e226]: LANGUAGE STACK
                      - generic [ref=e227]: TypeScript 88%
                    - generic [ref=e228]:
                      - 'generic "TypeScript: 88%" [ref=e229]'
                      - 'generic "JavaScript: 12%" [ref=e230]'
                    - generic [ref=e231]:
                      - generic [ref=e232]: TypeScript (88%)
                      - generic [ref=e234]: JavaScript (12%)
                  - generic [ref=e236]:
                    - generic [ref=e237]:
                      - img [ref=e238]
                      - generic [ref=e240]: git log --oneline -n 5
                    - generic [ref=e241]:
                      - generic [ref=e242]:
                        - generic [ref=e243]: f1d2e3a
                        - generic [ref=e244]: "|"
                        - 'generic "perf: optimize web worker message transfer serialization" [ref=e245]'
                      - generic [ref=e246]:
                        - generic [ref=e247]: c4b5a6f
                        - generic [ref=e248]: "|"
                        - 'generic "feat: add cyclic dependency detection algorithm to DAG core" [ref=e249]'
                      - generic [ref=e250]:
                        - generic [ref=e251]: e7d8c9b
                        - generic [ref=e252]: "|"
                        - 'generic "refactor: migrate state management store to Zustand" [ref=e253]'
                      - generic [ref=e254]:
                        - generic [ref=e255]: a1b2c3d
                        - generic [ref=e256]: "|"
                        - 'generic "test: add integration test suite for AST compilation" [ref=e257]'
                      - generic [ref=e258]:
                        - generic [ref=e259]: 4f5e6d7
                        - generic [ref=e260]: "|"
                        - 'generic "initial commit: basic node workspace layout and setup" [ref=e261]'
              - generic [ref=e262]:
                - generic "Aggregate Page Views" [ref=e263]:
                  - generic [ref=e265]: "Live page views: 0"
                  - generic [ref=e266]: "0"
                  - generic [ref=e267]: VIEWS
                - generic "Bento Card Interactions" [ref=e268]:
                  - generic [ref=e270]: "Live clicks: 0"
                  - generic [ref=e271]: "0"
                  - generic [ref=e272]: CLICKS
              - generic [ref=e273]:
                - link "Analyze Architecture" [ref=e274] [cursor=pointer]:
                  - /url: /case-studies/clinical-data-mapper
                  - generic [ref=e275]: Analyze Architecture
                  - img [ref=e276]
                - generic [ref=e278]: "H: 694px"
    - generic [ref=e282]:
      - generic [ref=e283]: I
      - generic [ref=e284]: build
      - generic [ref=e285]: resilient,
      - generic [ref=e286]: type-safe
      - generic [ref=e287]: infrastructure
      - generic [ref=e288]: that
      - generic [ref=e289]: connects
      - generic [ref=e290]: low-latency
      - generic [ref=e291]: client
      - generic [ref=e292]: interfaces
      - generic [ref=e293]: with
      - generic [ref=e294]: scalable
      - generic [ref=e295]: distributed
      - generic [ref=e296]: systems,
      - generic [ref=e297]: guaranteeing
      - generic [ref=e298]: extreme
      - generic [ref=e299]: security
      - generic [ref=e300]: boundaries
      - generic [ref=e301]: and
      - generic [ref=e302]: exceptional
      - generic [ref=e303]: performance.
    - generic [ref=e305]:
      - heading "System Architect & Design Engineer" [level=2] [ref=e306]
      - paragraph [ref=e307]: Engineering High-Performance Technical Solutions
      - generic [ref=e309]:
        - generic [ref=e311]:
          - generic [ref=e312]:
            - generic [ref=e313]: FDR
            - generic [ref=e314]:
              - heading "System Architect" [level=3] [ref=e315]
              - paragraph [ref=e316]: Principal Design Engineer
          - paragraph [ref=e317]: I am a full-stack design engineer who believes technology should ultimately serve and connect people. While my background is in building robust operational engines and responsive digital products, my core philosophy is rooted in creativity, playful problem-solving, and ensuring every system I build feels deeply human and accessible.
        - generic [ref=e319]:
          - heading "Live Telemetry API" [level=3] [ref=e320]
          - paragraph [ref=e321]: Dynamic repository programming languages aggregated dynamically via GitHub cached metrics.
          - generic [ref=e322]:
            - generic [ref=e324]:
              - generic [ref=e325]: TypeScript
              - generic [ref=e326]: 59%
            - generic [ref=e329]:
              - generic [ref=e330]: Haskell
              - generic [ref=e331]: 30%
            - generic [ref=e334]:
              - generic [ref=e335]: JavaScript
              - generic [ref=e336]: 8%
            - generic [ref=e339]:
              - generic [ref=e340]: CSS
              - generic [ref=e341]: 3%
        - generic [ref=e343]:
          - heading "Core Technical Specializations" [level=3] [ref=e344]
          - generic [ref=e345]:
            - generic [ref=e346]:
              - generic [ref=e347]: "01"
              - heading "Clinical Integrations" [level=4] [ref=e348]:
                - generic [ref=e349]: Clinical Integrations
              - paragraph [ref=e350]: Resilient XML streaming engines matching CDISC ODM schemas to FDA-compliant SDTM datasets.
            - generic [ref=e351]:
              - generic [ref=e352]: "02"
              - heading "Layout Physics" [level=4] [ref=e353]:
                - generic [ref=e354]: Layout Physics
              - paragraph [ref=e355]: DOM-free userland canvas calculation loops synchronized to bypass layout reflow thrashes.
            - generic [ref=e356]:
              - generic [ref=e357]: "03"
              - heading "Serverless Scaling" [level=4] [ref=e358]:
                - generic [ref=e359]: Serverless Scaling
              - paragraph [ref=e360]: Prisma WebSocket connectivity mappings linking pools into cloud Neon databases at 1ms latencies.
            - generic [ref=e361]:
              - generic [ref=e362]: "04"
              - heading "Full-Stack Security" [level=4] [ref=e363]
              - paragraph [ref=e364]: Strict HTML sanitizers, encrypted HIPAA token rotation schemes, and dynamic sitemaps.
      - heading "Professional Experience Timeline" [level=3] [ref=e365]
      - paragraph [ref=e366]:
        - text: A Chronological Evolution of
        - generic [ref=e367]: Systems Rigor
      - generic [ref=e371]:
        - generic [ref=e376]:
          - text: 2023 — Present
          - heading "Lead Clinical Software Architect" [level=3] [ref=e377]
          - heading "Systems Integration Group" [level=4] [ref=e378]
          - paragraph [ref=e379]: Architected distributed HIPAA-compliant streaming ODM XML parsers handling 2GB+ trials data within constant 50MB memory footprints. Transitioned local SQLite storage nodes to high-speed serverless Neon Postgres clusters utilizing native pooling.
          - generic [ref=e380]:
            - generic [ref=e381]: TypeScript
            - generic [ref=e382]: Neon Postgres
            - generic [ref=e383]: CDISC
            - generic [ref=e384]: HIPAA
            - generic [ref=e385]: SAX Parser
        - generic [ref=e390]:
          - text: 2020 — 2023
          - heading "Senior Systems Engineer & UI Specialist" [level=3] [ref=e391]
          - heading "Digital Physics Labs" [level=4] [ref=e392]
          - paragraph [ref=e393]: Developed hardware-accelerated text measuring and Bento grid wrapping engines using browser canvas and custom hooks. Maintained 60FPS refresh metrics under active resizing and heavy grid item swaps.
          - generic [ref=e394]:
            - generic [ref=e395]: React 19
            - generic [ref=e396]: Next.js 16
            - generic [ref=e397]: Framer Motion
            - generic [ref=e398]: Canvas API
            - generic [ref=e399]: DX Tooling
        - generic [ref=e404]:
          - text: 2019 — 2021
          - heading "Lead Volunteer & Technical Mentor" [level=3] [ref=e405]
          - heading "Civic Code for Humanity" [level=4] [ref=e406]
          - paragraph [ref=e407]: Partnered with local nonprofits to modernize their digital presence and data systems. Taught coding bootcamps for underprivileged youth, emphasizing creativity and problem-solving.
          - generic [ref=e408]:
            - generic [ref=e409]: Civic Impact
            - generic [ref=e410]: Education
            - generic [ref=e411]: Volunteering
            - generic [ref=e412]: Accessibility
        - generic [ref=e417]:
          - text: 2018 — 2020
          - heading "Full-Stack Developer" [level=3] [ref=e418]
          - heading "CoreFlow Technologies" [level=4] [ref=e419]
          - paragraph [ref=e420]: Pioneered DAG-based Visual Node Schema builders. Engineered immutable state trees, cycle validation compilers, and OpenAPI spec translators.
          - generic [ref=e421]:
            - generic [ref=e422]: React
            - generic [ref=e423]: Zustand
            - generic [ref=e424]: AST
            - generic [ref=e425]: JSON Schema
            - generic [ref=e426]: OpenAPI
        - generic [ref=e431]:
          - text: 2016 — 2018
          - heading "President, Computer Science Society" [level=3] [ref=e432]
          - heading "University Student Leadership" [level=4] [ref=e433]
          - paragraph [ref=e434]: Led a community of 500+ students, organized weekly workshops, and fostered a culture of collaborative learning. Built mentorship programs that connected underclassmen with alumni.
          - generic [ref=e435]:
            - generic [ref=e436]: Leadership
            - generic [ref=e437]: Community Building
            - generic [ref=e438]: Mentorship
            - generic [ref=e439]: Public Speaking
    - generic [ref=e441]:
      - heading "Get In Touch" [level=2] [ref=e442]
      - paragraph [ref=e443]: Let's Collaborate on Premium Engineering Projects
      - generic [ref=e444]:
        - link "Send an email to Frederick de Ruiter at contact@fderuiter.com" [ref=e445] [cursor=pointer]:
          - /url: mailto:contact@fderuiter.com
          - generic [ref=e446]: ✉
          - generic [ref=e447]: Email Broadcast
          - generic [ref=e448]: contact@fderuiter.com
        - link "View Frederick de Ruiter's GitHub profile externally" [ref=e449] [cursor=pointer]:
          - /url: https://github.com/fderuiter
          - generic [ref=e450]: 🐙
          - generic [ref=e451]: GitHub Repos
          - generic [ref=e452]: github.com/fderuiter
        - link "View Frederick de Ruiter's LinkedIn profile externally" [ref=e453] [cursor=pointer]:
          - /url: https://linkedin.com
          - generic [ref=e454]: in
          - generic [ref=e455]: LinkedIn Network
          - generic [ref=e456]: Secure Profile Link
      - generic [ref=e457]: DESIGNED & DEVELOPED BY FREDERICK DE RUITER
  - alert [ref=e460]
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
  182 | 
  183 |   test('Audit: Command Palette Focus Restoration', async ({ page }, testInfo) => {
  184 |     // Navigate to a page with a calling button, like the 404 page
  185 |     await page.goto('/this-is-not-found');
  186 |     await page.waitForLoadState('networkidle');
  187 | 
  188 |     // Get the Search Site button
  189 |     const searchBtn = page.locator('button:has-text("Search Site")');
  190 |     await expect(searchBtn).toBeVisible();
  191 | 
  192 |     // Focus on the calling button
  193 |     await searchBtn.focus();
  194 |     await expect(searchBtn).toBeFocused();
  195 | 
  196 |     // Click the calling button to open the modal
  197 |     await searchBtn.click();
  198 | 
  199 |     // Wait for the modal combobox to be visible and focused
  200 |     const combobox = page.locator('[role="combobox"]');
  201 |     await expect(combobox).toBeVisible();
  202 |     await expect(combobox).toBeFocused();
  203 | 
  204 |     // Now run an accessibility scan on this state
  205 |     const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  206 |     const criticalSerious = results.violations.filter(
  207 |       v => v.impact === 'critical' || v.impact === 'serious'
  208 |     );
  209 | 
  210 |     // Close the command palette
  211 |     await page.keyboard.press('Escape');
  212 | 
  213 |     // Wait for the modal to be removed
  214 |     await expect(combobox).not.toBeVisible();
  215 | 
  216 |     // Verify keyboard focus returns to the calling button
  217 |     const isFocused = await searchBtn.evaluate(el => document.activeElement === el);
  218 |     expect(isFocused, "Keyboard focus did not return to the calling button when the modal closed").toBe(true);
  219 | 
  220 |     saveResult(testInfo.project.name, 'Command Palette Focus Restoration', criticalSerious, page.url());
  221 |   });
  222 | 
  223 |   test('Audit: Mobile Navigation Focus Trap', async ({ page }, testInfo) => {
  224 |     const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
  225 |     if (!isMobile) {
  226 |       // Avoid failing desktop runs, but save empty violations so it's documented in metrics
  227 |       saveResult(testInfo.project.name, 'Mobile Navigation Focus Trap', [], page.url());
  228 |       return;
  229 |     }
  230 | 
  231 |     // Go to landing page
  232 |     await page.goto('/');
  233 |     await page.waitForLoadState('networkidle');
```