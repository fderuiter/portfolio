# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> Accessibility Audit Suite >> Audit: Default Landing Page State
- Location: __tests__/e2e/accessibility.spec.ts:97:7

# Error details

```
Error: Found 1 critical/serious accessibility violations in Default Page State

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
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
          - paragraph [ref=e46]: Connection established, but no published case studies were found in the database.
          - paragraph [ref=e47]: "Initialize seeding pipeline via Issue #10 to import clinical trial narratives."
    - generic [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]: I
        - text: I
      - generic [ref=e54]:
        - generic [ref=e55]: build
        - text: build
      - generic [ref=e56]:
        - generic [ref=e57]: resilient,
        - text: resilient,
      - generic [ref=e58]:
        - generic [ref=e59]: type-safe
        - text: type-safe
      - generic [ref=e60]:
        - generic [ref=e61]: infrastructure
        - text: infrastructure
      - generic [ref=e62]:
        - generic [ref=e63]: that
        - text: that
      - generic [ref=e64]:
        - generic [ref=e65]: connects
        - text: connects
      - generic [ref=e66]:
        - generic [ref=e67]: low-latency
        - text: low-latency
      - generic [ref=e68]:
        - generic [ref=e69]: client
        - text: client
      - generic [ref=e70]:
        - generic [ref=e71]: interfaces
        - text: interfaces
      - generic [ref=e72]:
        - generic [ref=e73]: with
        - text: with
      - generic [ref=e74]:
        - generic [ref=e75]: scalable
        - text: scalable
      - generic [ref=e76]:
        - generic [ref=e77]: distributed
        - text: distributed
      - generic [ref=e78]:
        - generic [ref=e79]: systems,
        - text: systems,
      - generic [ref=e80]:
        - generic [ref=e81]: guaranteeing
        - text: guaranteeing
      - generic [ref=e82]:
        - generic [ref=e83]: extreme
        - text: extreme
      - generic [ref=e84]:
        - generic [ref=e85]: security
        - text: security
      - generic [ref=e86]:
        - generic [ref=e87]: boundaries
        - text: boundaries
      - generic [ref=e88]:
        - generic [ref=e89]: and
        - text: and
      - generic [ref=e90]:
        - generic [ref=e91]: exceptional
        - text: exceptional
      - generic [ref=e92]:
        - generic [ref=e93]: performance.
        - text: performance.
    - generic [ref=e95]:
      - heading "System Architect & Design Engineer" [level=2] [ref=e96]
      - paragraph [ref=e97]: Engineering High-Performance Technical Solutions
      - generic [ref=e99]:
        - generic [ref=e101]:
          - generic [ref=e102]:
            - generic [ref=e103]: FDR
            - generic [ref=e104]:
              - heading "System Architect" [level=3] [ref=e105]
              - paragraph [ref=e106]: Principal Design Engineer
          - paragraph [ref=e107]: I am a full-stack design engineer who believes technology should ultimately serve and connect people. While my background is in building robust operational engines and responsive digital products, my core philosophy is rooted in creativity, playful problem-solving, and ensuring every system I build feels deeply human and accessible.
        - generic [ref=e109]:
          - heading "Live Telemetry API" [level=3] [ref=e110]
          - paragraph [ref=e111]: Dynamic repository programming languages aggregated dynamically via GitHub cached metrics.
          - generic [ref=e112]:
            - generic [ref=e114]:
              - generic [ref=e115]: TypeScript
              - generic [ref=e116]: 45%
            - generic [ref=e119]:
              - generic [ref=e120]: Python
              - generic [ref=e121]: 25%
            - generic [ref=e124]:
              - generic [ref=e125]: React
              - generic [ref=e126]: 15%
            - generic [ref=e129]:
              - generic [ref=e130]: Prisma
              - generic [ref=e131]: 10%
            - generic [ref=e134]:
              - generic [ref=e135]: PostgreSQL
              - generic [ref=e136]: 5%
        - generic [ref=e138]:
          - heading "Core Technical Specializations" [level=3] [ref=e139]
          - generic [ref=e140]:
            - generic [ref=e141]:
              - generic [ref=e142]: "01"
              - heading "Clinical Integrations" [level=4] [ref=e143]:
                - generic [ref=e144]: Clinical Integrations
              - paragraph [ref=e145]: Resilient XML streaming engines matching CDISC ODM schemas to FDA-compliant SDTM datasets.
            - generic [ref=e146]:
              - generic [ref=e147]: "02"
              - heading "Layout Physics" [level=4] [ref=e148]:
                - generic [ref=e149]: Layout Physics
              - paragraph [ref=e150]: DOM-free userland canvas calculation loops synchronized to bypass layout reflow thrashes.
            - generic [ref=e151]:
              - generic [ref=e152]: "03"
              - heading "Serverless Scaling" [level=4] [ref=e153]:
                - generic [ref=e154]: Serverless Scaling
              - paragraph [ref=e155]: Prisma WebSocket connectivity mappings linking pools into cloud Neon databases at 1ms latencies.
            - generic [ref=e156]:
              - generic [ref=e157]: "04"
              - heading "Full-Stack Security" [level=4] [ref=e158]
              - paragraph [ref=e159]: Strict HTML sanitizers, encrypted HIPAA token rotation schemes, and dynamic sitemaps.
      - heading "Professional Experience Timeline" [level=3] [ref=e160]
      - paragraph [ref=e161]:
        - text: A Chronological Evolution of
        - generic [ref=e162]: Systems Rigor
      - generic [ref=e166]:
        - generic [ref=e171]:
          - text: 2023 — Present
          - heading "Lead Clinical Software Architect" [level=3] [ref=e172]
          - heading "Systems Integration Group" [level=4] [ref=e173]
          - paragraph [ref=e174]: Architected distributed HIPAA-compliant streaming ODM XML parsers handling 2GB+ trials data within constant 50MB memory footprints. Transitioned local SQLite storage nodes to high-speed serverless Neon Postgres clusters utilizing native pooling.
          - generic [ref=e175]:
            - generic [ref=e176]: TypeScript
            - generic [ref=e177]: Neon Postgres
            - generic [ref=e178]: CDISC
            - generic [ref=e179]: HIPAA
            - generic [ref=e180]: SAX Parser
        - generic [ref=e185]:
          - text: 2020 — 2023
          - heading "Senior Systems Engineer & UI Specialist" [level=3] [ref=e186]
          - heading "Digital Physics Labs" [level=4] [ref=e187]
          - paragraph [ref=e188]: Developed hardware-accelerated text measuring and Bento grid wrapping engines using browser canvas and custom hooks. Maintained 60FPS refresh metrics under active resizing and heavy grid item swaps.
          - generic [ref=e189]:
            - generic [ref=e190]: React 19
            - generic [ref=e191]: Next.js 16
            - generic [ref=e192]: Framer Motion
            - generic [ref=e193]: Canvas API
            - generic [ref=e194]: DX Tooling
        - generic [ref=e199]:
          - text: 2019 — 2021
          - heading "Lead Volunteer & Technical Mentor" [level=3] [ref=e200]
          - heading "Civic Code for Humanity" [level=4] [ref=e201]
          - paragraph [ref=e202]: Partnered with local nonprofits to modernize their digital presence and data systems. Taught coding bootcamps for underprivileged youth, emphasizing creativity and problem-solving.
          - generic [ref=e203]:
            - generic [ref=e204]: Civic Impact
            - generic [ref=e205]: Education
            - generic [ref=e206]: Volunteering
            - generic [ref=e207]: Accessibility
        - generic [ref=e212]:
          - text: 2018 — 2020
          - heading "Full-Stack Developer" [level=3] [ref=e213]
          - heading "CoreFlow Technologies" [level=4] [ref=e214]
          - paragraph [ref=e215]: Pioneered DAG-based Visual Node Schema builders. Engineered immutable state trees, cycle validation compilers, and OpenAPI spec translators.
          - generic [ref=e216]:
            - generic [ref=e217]: React
            - generic [ref=e218]: Zustand
            - generic [ref=e219]: AST
            - generic [ref=e220]: JSON Schema
            - generic [ref=e221]: OpenAPI
        - generic [ref=e226]:
          - text: 2016 — 2018
          - heading "President, Computer Science Society" [level=3] [ref=e227]
          - heading "University Student Leadership" [level=4] [ref=e228]
          - paragraph [ref=e229]: Led a community of 500+ students, organized weekly workshops, and fostered a culture of collaborative learning. Built mentorship programs that connected underclassmen with alumni.
          - generic [ref=e230]:
            - generic [ref=e231]: Leadership
            - generic [ref=e232]: Community Building
            - generic [ref=e233]: Mentorship
            - generic [ref=e234]: Public Speaking
    - generic [ref=e236]:
      - heading "Get In Touch" [level=2] [ref=e237]
      - paragraph [ref=e238]: Let's Collaborate on Premium Engineering Projects
      - generic [ref=e239]:
        - link "Send an email to Frederick de Ruiter at contact@fderuiter.com" [ref=e240] [cursor=pointer]:
          - /url: mailto:contact@fderuiter.com
          - generic [ref=e241]: ✉
          - generic [ref=e242]: Email Broadcast
          - generic [ref=e243]: contact@fderuiter.com
        - link "View Frederick de Ruiter's GitHub profile externally" [ref=e244] [cursor=pointer]:
          - /url: https://github.com/fderuiter
          - generic [ref=e245]: 🐙
          - generic [ref=e246]: GitHub Repos
          - generic [ref=e247]: github.com/fderuiter
        - link "View Frederick de Ruiter's LinkedIn profile externally" [ref=e248] [cursor=pointer]:
          - /url: https://linkedin.com
          - generic [ref=e249]: in
          - generic [ref=e250]: LinkedIn Network
          - generic [ref=e251]: Secure Profile Link
      - generic [ref=e252]: DESIGNED & DEVELOPED BY FREDERICK DE RUITER
  - button "Open Next.js Dev Tools" [ref=e260] [cursor=pointer]:
    - img [ref=e261]
  - alert [ref=e266]
```

# Test source

```ts
  10  |   if (!fs.existsSync(dir)) {
  11  |     fs.mkdirSync(dir, { recursive: true });
  12  |   }
  13  |   const safeStateName = stateName.replace(/[^a-zA-Z0-9]/g, '_');
  14  |   const filename = `${projectName}-${safeStateName}.json`;
  15  |   const filePath = path.join(dir, filename);
  16  |   
  17  |   const resultData = {
  18  |     project: projectName,
  19  |     state: stateName,
  20  |     url: checkedUrl,
  21  |     violationsCount: violations.length,
  22  |     violations: violations.map(v => ({
  23  |       id: v.id,
  24  |       impact: v.impact,
  25  |       description: v.description,
  26  |       help: v.help,
  27  |       helpUrl: v.helpUrl,
  28  |       nodes: v.nodes.map((n: any) => ({
  29  |         target: n.target,
  30  |         html: n.html
  31  |       }))
  32  |     })),
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
> 110 |     expect(criticalSerious.length, `Found ${criticalSerious.length} critical/serious accessibility violations in Default Page State`).toBe(0);
      |                                                                                                                                       ^ Error: Found 1 critical/serious accessibility violations in Default Page State
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
  133 |     expect(criticalSerious.length, `Found ${criticalSerious.length} critical/serious accessibility violations after TypeScript filtering`).toBe(0);
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