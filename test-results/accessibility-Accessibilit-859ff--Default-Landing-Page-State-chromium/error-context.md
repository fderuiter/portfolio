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
            - button "ALL PROJECTS" [ref=e61] [cursor=pointer]: ALL PROJECTS
            - button "TYPESCRIPT" [ref=e63] [cursor=pointer]
            - button "PYTHON" [ref=e64] [cursor=pointer]
            - button "HASKELL" [ref=e65] [cursor=pointer]
          - generic [ref=e66]:
            - generic [ref=e67]:
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
              - generic [ref=e179]:
                - generic [ref=e180]:
                  - generic [ref=e181]:
                    - generic [ref=e182]: Haskell
                    - generic [ref=e183]: AURA-HASKELL
                  - generic [ref=e184]: "Aura: Language-Tailored Haskell Type Flow Analyzer"
                  - generic [ref=e185]:
                    - button "THE PITCH" [ref=e186] [cursor=pointer]
                    - button "THE REALITY" [ref=e187] [cursor=pointer]
                  - generic [ref=e191]:
                    - generic:
                      - generic:
                        - generic: An advanced
                        - generic: Haskell
                        - generic: static analyzer and type inference engine
                      - generic:
                        - generic: that parses GHC ASTs, traces type flow, and detects compile-time
                      - generic:
                        - generic: architectural anti-patterns with near-instantaneous feedback
                      - generic:
                        - generic: loops.
                    - paragraph [ref=e192]:
                      - text: An advanced
                      - strong [ref=e193]: Haskell
                      - text: static analyzer and type inference engine that parses GHC ASTs, traces type flow, and detects compile-time architectural anti-patterns with near-instantaneous feedback loops.
                  - generic [ref=e194]:
                    - generic [ref=e195]:
                      - generic [ref=e196]:
                        - generic [ref=e197]: Commit Activity (12 Months)
                        - generic [ref=e198]: 249 Commits
                      - 'img "GitHub commit activity timeline over the last 12 months. Total commits: 249" [ref=e200]'
                    - generic [ref=e203]:
                      - generic [ref=e204]:
                        - img [ref=e205]
                        - generic [ref=e207]: "74"
                        - text: STARS
                      - generic [ref=e208]:
                        - img [ref=e209]
                        - generic [ref=e214]: "11"
                        - text: FORKS
                      - generic [ref=e215]:
                        - img [ref=e216]
                        - generic [ref=e218]: "0"
                        - text: ISSUES
                    - generic [ref=e219]:
                      - generic [ref=e220]:
                        - generic [ref=e221]: LANGUAGE STACK
                        - generic [ref=e222]: Haskell 91%
                      - generic [ref=e223]:
                        - 'generic "Haskell: 91%" [ref=e224]'
                        - 'generic "CSS: 9%" [ref=e225]'
                      - generic [ref=e226]:
                        - generic [ref=e227]: Haskell (91%)
                        - generic [ref=e229]: CSS (9%)
                    - generic [ref=e231]:
                      - generic [ref=e232]:
                        - img [ref=e233]
                        - generic [ref=e235]: stack build --fast
                      - generic [ref=e236]:
                        - generic [ref=e238]: "[1 of 4] Compiling Core.AST ( src/Core/AST.hs, AST.o )"
                        - generic [ref=e240]: "[2 of 4] Compiling Parser.Type ( src/Parser/Type.hs, Type.o )"
                        - generic [ref=e242]: "[3 of 4] Compiling Solver.Unify ( src/Solver/Unify.hs, Unify.o )"
                        - generic [ref=e244]: "[4 of 4] Compiling Main ( app/Main.hs, Main.o )"
                        - generic [ref=e246]: Linking .stack-work/dist/x86_64/aura-compiler ...
                        - generic [ref=e248]: Build successful! Loaded 4 modules.
                - generic [ref=e249]:
                  - generic "Aggregate Page Views" [ref=e250]:
                    - generic [ref=e252]: "Live page views: 0"
                    - generic [ref=e253]: "0"
                    - generic [ref=e254]: VIEWS
                  - generic "Bento Card Interactions" [ref=e255]:
                    - generic [ref=e257]: "Live clicks: 0"
                    - generic [ref=e258]: "0"
                    - generic [ref=e259]: CLICKS
                - generic [ref=e260]:
                  - link "Analyze Architecture" [ref=e261] [cursor=pointer]:
                    - /url: /case-studies/aura-haskell
                    - generic [ref=e262]: Analyze Architecture
                    - img [ref=e263]
                  - generic [ref=e265]: "H: 676px"
            - generic [ref=e272]:
              - generic [ref=e273]:
                - generic [ref=e274]:
                  - generic [ref=e275]: TypeScript
                  - generic [ref=e276]: CLINICAL-DATA-MAPPER
                - generic [ref=e277]: "Clinical Data Standards Engine: CDISC ODM and SDTM Integration"
                - generic [ref=e278]:
                  - button "THE PITCH" [ref=e279] [cursor=pointer]
                  - button "THE REALITY" [ref=e280] [cursor=pointer]
                - generic [ref=e284]:
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
                  - paragraph [ref=e285]:
                    - text: An enterprise-grade
                    - strong [ref=e286]: TypeScript
                    - text: mapping pipeline that ingests clinical trial metadata in
                    - code [ref=e287]: CDISC Operational Data Model (ODM)
                    - text: XML format, dynamically constructs
                    - code [ref=e288]: data schemas
                    - text: ", and transforms raw"
                    - code [ref=e289]: Electronic Data Capture (EDC)
                    - text: datasets into compliant
                    - strong [ref=e290]: CDISC SDTM
                    - text: domains.
                - generic [ref=e291]:
                  - generic [ref=e292]:
                    - generic [ref=e293]:
                      - generic [ref=e294]: Commit Activity (12 Months)
                      - generic [ref=e295]: 249 Commits
                    - 'img "GitHub commit activity timeline over the last 12 months. Total commits: 249" [ref=e297]'
                  - generic [ref=e300]:
                    - generic [ref=e301]:
                      - img [ref=e302]
                      - generic [ref=e304]: "148"
                      - text: STARS
                    - generic [ref=e305]:
                      - img [ref=e306]
                      - generic [ref=e311]: "24"
                      - text: FORKS
                    - generic [ref=e312]:
                      - img [ref=e313]
                      - generic [ref=e315]: "3"
                      - text: ISSUES
                  - generic [ref=e316]:
                    - generic [ref=e317]:
                      - generic [ref=e318]: LANGUAGE STACK
                      - generic [ref=e319]: TypeScript 88%
                    - generic [ref=e320]:
                      - 'generic "TypeScript: 88%" [ref=e321]'
                      - 'generic "JavaScript: 12%" [ref=e322]'
                    - generic [ref=e323]:
                      - generic [ref=e324]: TypeScript (88%)
                      - generic [ref=e326]: JavaScript (12%)
                  - generic [ref=e328]:
                    - generic [ref=e329]:
                      - img [ref=e330]
                      - generic [ref=e332]: git log --oneline -n 5
                    - generic [ref=e333]:
                      - generic [ref=e334]:
                        - generic [ref=e335]: f1d2e3a
                        - generic [ref=e336]: "|"
                        - 'generic "perf: optimize web worker message transfer serialization" [ref=e337]'
                      - generic [ref=e338]:
                        - generic [ref=e339]: c4b5a6f
                        - generic [ref=e340]: "|"
                        - 'generic "feat: add cyclic dependency detection algorithm to DAG core" [ref=e341]'
                      - generic [ref=e342]:
                        - generic [ref=e343]: e7d8c9b
                        - generic [ref=e344]: "|"
                        - 'generic "refactor: migrate state management store to Zustand" [ref=e345]'
                      - generic [ref=e346]:
                        - generic [ref=e347]: a1b2c3d
                        - generic [ref=e348]: "|"
                        - 'generic "test: add integration test suite for AST compilation" [ref=e349]'
                      - generic [ref=e350]:
                        - generic [ref=e351]: 4f5e6d7
                        - generic [ref=e352]: "|"
                        - 'generic "initial commit: basic node workspace layout and setup" [ref=e353]'
              - generic [ref=e354]:
                - generic "Aggregate Page Views" [ref=e355]:
                  - generic [ref=e357]: "Live page views: 0"
                  - generic [ref=e358]: "0"
                  - generic [ref=e359]: VIEWS
                - generic "Bento Card Interactions" [ref=e360]:
                  - generic [ref=e362]: "Live clicks: 0"
                  - generic [ref=e363]: "0"
                  - generic [ref=e364]: CLICKS
              - generic [ref=e365]:
                - link "Analyze Architecture" [ref=e366] [cursor=pointer]:
                  - /url: /case-studies/clinical-data-mapper
                  - generic [ref=e367]: Analyze Architecture
                  - img [ref=e368]
                - generic [ref=e370]: "H: 694px"
    - generic [ref=e374]:
      - generic [ref=e375]: I
      - generic [ref=e376]: build
      - generic [ref=e377]: resilient,
      - generic [ref=e378]: type-safe
      - generic [ref=e379]: infrastructure
      - generic [ref=e380]: that
      - generic [ref=e381]: connects
      - generic [ref=e382]: low-latency
      - generic [ref=e383]: client
      - generic [ref=e384]: interfaces
      - generic [ref=e385]: with
      - generic [ref=e386]: scalable
      - generic [ref=e387]: distributed
      - generic [ref=e388]: systems,
      - generic [ref=e389]: guaranteeing
      - generic [ref=e390]: extreme
      - generic [ref=e391]: security
      - generic [ref=e392]: boundaries
      - generic [ref=e393]: and
      - generic [ref=e394]: exceptional
      - generic [ref=e395]: performance.
    - generic [ref=e397]:
      - heading "System Architect & Design Engineer" [level=2] [ref=e398]
      - paragraph [ref=e399]: Engineering High-Performance Technical Solutions
      - generic [ref=e401]:
        - generic [ref=e403]:
          - generic [ref=e404]:
            - generic [ref=e405]: FDR
            - generic [ref=e406]:
              - heading "System Architect" [level=3] [ref=e407]
              - paragraph [ref=e408]: Principal Design Engineer
          - paragraph [ref=e409]: I am a full-stack design engineer who believes technology should ultimately serve and connect people. While my background is in building robust operational engines and responsive digital products, my core philosophy is rooted in creativity, playful problem-solving, and ensuring every system I build feels deeply human and accessible.
        - generic [ref=e411]:
          - heading "Live Telemetry API" [level=3] [ref=e412]
          - paragraph [ref=e413]: Dynamic repository programming languages aggregated dynamically via GitHub cached metrics.
          - generic [ref=e414]:
            - generic [ref=e416]:
              - generic [ref=e417]: TypeScript
              - generic [ref=e418]: 59%
            - generic [ref=e421]:
              - generic [ref=e422]: Haskell
              - generic [ref=e423]: 30%
            - generic [ref=e426]:
              - generic [ref=e427]: JavaScript
              - generic [ref=e428]: 8%
            - generic [ref=e431]:
              - generic [ref=e432]: CSS
              - generic [ref=e433]: 3%
        - generic [ref=e435]:
          - heading "Core Technical Specializations" [level=3] [ref=e436]
          - generic [ref=e437]:
            - generic [ref=e438]:
              - generic [ref=e439]: "01"
              - heading "Clinical Integrations" [level=4] [ref=e440]:
                - generic [ref=e441]: Clinical Integrations
              - paragraph [ref=e442]: Resilient XML streaming engines matching CDISC ODM schemas to FDA-compliant SDTM datasets.
            - generic [ref=e443]:
              - generic [ref=e444]: "02"
              - heading "Layout Physics" [level=4] [ref=e445]:
                - generic [ref=e446]: Layout Physics
              - paragraph [ref=e447]: DOM-free userland canvas calculation loops synchronized to bypass layout reflow thrashes.
            - generic [ref=e448]:
              - generic [ref=e449]: "03"
              - heading "Serverless Scaling" [level=4] [ref=e450]:
                - generic [ref=e451]: Serverless Scaling
              - paragraph [ref=e452]: Prisma WebSocket connectivity mappings linking pools into cloud Neon databases at 1ms latencies.
            - generic [ref=e453]:
              - generic [ref=e454]: "04"
              - heading "Full-Stack Security" [level=4] [ref=e455]
              - paragraph [ref=e456]: Strict HTML sanitizers, encrypted HIPAA token rotation schemes, and dynamic sitemaps.
      - heading "Professional Experience Timeline" [level=3] [ref=e457]
      - paragraph [ref=e458]:
        - text: A Chronological Evolution of
        - generic [ref=e459]: Systems Rigor
      - generic [ref=e463]:
        - generic [ref=e468]:
          - text: 2023 — Present
          - heading "Lead Clinical Software Architect" [level=3] [ref=e469]
          - heading "Systems Integration Group" [level=4] [ref=e470]
          - paragraph [ref=e471]: Architected distributed HIPAA-compliant streaming ODM XML parsers handling 2GB+ trials data within constant 50MB memory footprints. Transitioned local SQLite storage nodes to high-speed serverless Neon Postgres clusters utilizing native pooling.
          - generic [ref=e472]:
            - generic [ref=e473]: TypeScript
            - generic [ref=e474]: Neon Postgres
            - generic [ref=e475]: CDISC
            - generic [ref=e476]: HIPAA
            - generic [ref=e477]: SAX Parser
        - generic [ref=e482]:
          - text: 2020 — 2023
          - heading "Senior Systems Engineer & UI Specialist" [level=3] [ref=e483]
          - heading "Digital Physics Labs" [level=4] [ref=e484]
          - paragraph [ref=e485]: Developed hardware-accelerated text measuring and Bento grid wrapping engines using browser canvas and custom hooks. Maintained 60FPS refresh metrics under active resizing and heavy grid item swaps.
          - generic [ref=e486]:
            - generic [ref=e487]: React 19
            - generic [ref=e488]: Next.js 16
            - generic [ref=e489]: Framer Motion
            - generic [ref=e490]: Canvas API
            - generic [ref=e491]: DX Tooling
        - generic [ref=e496]:
          - text: 2019 — 2021
          - heading "Lead Volunteer & Technical Mentor" [level=3] [ref=e497]
          - heading "Civic Code for Humanity" [level=4] [ref=e498]
          - paragraph [ref=e499]: Partnered with local nonprofits to modernize their digital presence and data systems. Taught coding bootcamps for underprivileged youth, emphasizing creativity and problem-solving.
          - generic [ref=e500]:
            - generic [ref=e501]: Civic Impact
            - generic [ref=e502]: Education
            - generic [ref=e503]: Volunteering
            - generic [ref=e504]: Accessibility
        - generic [ref=e509]:
          - text: 2018 — 2020
          - heading "Full-Stack Developer" [level=3] [ref=e510]
          - heading "CoreFlow Technologies" [level=4] [ref=e511]
          - paragraph [ref=e512]: Pioneered DAG-based Visual Node Schema builders. Engineered immutable state trees, cycle validation compilers, and OpenAPI spec translators.
          - generic [ref=e513]:
            - generic [ref=e514]: React
            - generic [ref=e515]: Zustand
            - generic [ref=e516]: AST
            - generic [ref=e517]: JSON Schema
            - generic [ref=e518]: OpenAPI
        - generic [ref=e523]:
          - text: 2016 — 2018
          - heading "President, Computer Science Society" [level=3] [ref=e524]
          - heading "University Student Leadership" [level=4] [ref=e525]
          - paragraph [ref=e526]: Led a community of 500+ students, organized weekly workshops, and fostered a culture of collaborative learning. Built mentorship programs that connected underclassmen with alumni.
          - generic [ref=e527]:
            - generic [ref=e528]: Leadership
            - generic [ref=e529]: Community Building
            - generic [ref=e530]: Mentorship
            - generic [ref=e531]: Public Speaking
    - generic [ref=e533]:
      - heading "Get In Touch" [level=2] [ref=e534]
      - paragraph [ref=e535]: Let's Collaborate on Premium Engineering Projects
      - generic [ref=e536]:
        - link "Send an email to Frederick de Ruiter at contact@fderuiter.com" [ref=e537] [cursor=pointer]:
          - /url: mailto:contact@fderuiter.com
          - generic [ref=e538]: ✉
          - generic [ref=e539]: Email Broadcast
          - generic [ref=e540]: contact@fderuiter.com
        - link "View Frederick de Ruiter's GitHub profile externally" [ref=e541] [cursor=pointer]:
          - /url: https://github.com/fderuiter
          - generic [ref=e542]: 🐙
          - generic [ref=e543]: GitHub Repos
          - generic [ref=e544]: github.com/fderuiter
        - link "View Frederick de Ruiter's LinkedIn profile externally" [ref=e545] [cursor=pointer]:
          - /url: https://linkedin.com
          - generic [ref=e546]: in
          - generic [ref=e547]: LinkedIn Network
          - generic [ref=e548]: Secure Profile Link
      - generic [ref=e549]: DESIGNED & DEVELOPED BY FREDERICK DE RUITER
  - alert [ref=e552]
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
```