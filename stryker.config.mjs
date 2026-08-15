// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "vitest",
  testRunnerNodeArgs: ["--import", "tsx"],
  vitest: {
    configFile: "vitest.config.ts",
  },
  mutate: [
    "lib/proof-utils.ts",
    "lib/masonry.ts",
    "lib/error-sanitization.ts",
    "lib/security.ts",
    "!lib/**/*.d.ts",
  ],
  thresholds: {
    high: 85,
    low: 75,
    break: 80,
  },
  concurrency: 4,
  timeoutMS: 15000,
  tempDirName: ".stryker-tmp",
  cleanTempDir: true,
};

export default config;
