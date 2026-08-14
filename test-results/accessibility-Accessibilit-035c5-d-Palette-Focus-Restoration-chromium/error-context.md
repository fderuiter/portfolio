# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> Accessibility Audit Suite >> Audit: Command Palette Focus Restoration
- Location: __tests__/e2e/accessibility.spec.ts:183:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[role="combobox"]')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('[role="combobox"]')

```

```yaml
- banner:
  - link "FDERUITER":
    - /url: /
  - navigation:
    - link "Work":
      - /url: /#case-studies
    - link "About":
      - /url: /#about
    - link "Proof Workspace":
      - /url: /proof
    - link "Transparency":
      - /url: /transparency
    - link "Simulator":
      - /url: /simulator
    - link "Contact":
      - /url: /#contact
    - link "GitHub ↗":
      - /url: https://github.com/fderuiter/portfolio
  - button "Sound Settings":
    - img
    - text: "SOUND: OFF"
    - img
- main:
  - img
  - text: "ERROR 404 LOC_X: 200px LOC_Y: 200px NORM: 0.50, 0.50"
  - heading "Route Unresolved" [level=1]
  - paragraph: The requested system node could not be resolved. This endpoint might have been deleted, moved, or never existed in the production schema.
  - text: SYSTEM_LABYRINTH.EXE OFFLINE █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ @ · · █ · · · · · · · · · █ █ █ █ · █ · █ █ █ █ █ · █ · █ █ · · · · · · · · · █ · █ · █ █ · █ █ █ █ █ █ █ · █ · █ · █ █ · █ · · · · · █ · █ · █ · █ █ · █ · █ █ █ · █ · █ · █ · █ █ · · · █ · · · · · · · █ E █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ [INITIALIZING LABYRINTH ENGINE...] Querying active partitions...
  - button "Search Site"
  - link "Return to Core":
    - /url: /
```

# Test source

```ts
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
> 201 |     await expect(combobox).toBeVisible();
      |                            ^ Error: expect(locator).toBeVisible() failed
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
  234 | 
  235 |     // Open mobile menu
  236 |     const menuTrigger = page.locator('[aria-label="Open navigation menu"]');
  237 |     await expect(menuTrigger).toBeVisible();
  238 |     await menuTrigger.click();
  239 | 
  240 |     // Wait for menu overlay to be visible
  241 |     const menuContainer = page.locator('#mobile-navigation');
  242 |     await expect(menuContainer).toBeVisible();
  243 | 
  244 |     // Wait for the automatic focus shift (100ms in code)
  245 |     await page.waitForTimeout(200);
  246 | 
  247 |     // Verify some element inside menu is currently focused
  248 |     const isFocusedInitiallyInside = await page.evaluate(() => {
  249 |       return !!document.activeElement?.closest('#mobile-navigation');
  250 |     });
  251 |     expect(isFocusedInitiallyInside).toBe(true);
  252 | 
  253 |     // Run Axe audit on the open mobile menu state
  254 |     const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  255 |     const criticalSerious = results.violations.filter(
  256 |       v => v.impact === 'critical' || v.impact === 'serious'
  257 |     );
  258 | 
  259 |     // Press Tab multiple times to verify focus is trapped within the mobile menu container
  260 |     let focusEscaped = false;
  261 |     for (let i = 0; i < 20; i++) {
  262 |       await page.keyboard.press('Tab');
  263 |       const inside = await page.evaluate(() => {
  264 |         return !!document.activeElement?.closest('#mobile-navigation');
  265 |       });
  266 |       if (!inside) {
  267 |         focusEscaped = true;
  268 |         break;
  269 |       }
  270 |     }
  271 | 
  272 |     expect(focusEscaped, "Focus escaped the open menu container on mobile-sized viewport during Tab navigation").toBe(false);
  273 | 
  274 |     // Press Shift+Tab multiple times to verify focus is trapped within the mobile menu container
  275 |     for (let i = 0; i < 20; i++) {
  276 |       await page.keyboard.press('Shift+Tab');
  277 |       const inside = await page.evaluate(() => {
  278 |         return !!document.activeElement?.closest('#mobile-navigation');
  279 |       });
  280 |       if (!inside) {
  281 |         focusEscaped = true;
  282 |         break;
  283 |       }
  284 |     }
  285 | 
  286 |     expect(focusEscaped, "Focus escaped the open menu container on mobile-sized viewport during Shift+Tab navigation").toBe(false);
  287 | 
  288 |     saveResult(testInfo.project.name, 'Mobile Navigation Focus Trap', criticalSerious, page.url());
  289 |   });
  290 | });
  291 | 
```