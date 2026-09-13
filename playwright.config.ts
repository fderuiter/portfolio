import { defineConfig, devices } from "@playwright/test";

/**
 * When set, probes run against an already-deployed origin (production, or a
 * Preview URL) instead of a locally built app. Booting a local server in that
 * case is both pointless and a hard failure, because nothing has been built.
 */
const externalBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: externalBaseUrl || "http://localhost:3000",
    trace: "on-first-retry",
  },
  expect: {
    timeout: 15000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Tablet Safari",
      use: { ...devices["iPad (gen 7)"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  // Only manage a local server when there is no external target to probe.
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          PLAYWRIGHT_TEST: "true",
          SKIP_DB_HEALTH_CHECK: "true",
        },
      },
});
