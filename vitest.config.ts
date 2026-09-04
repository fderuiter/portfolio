process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = "true";

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 15000,
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
    execArgv: ["--max-old-space-size=4096", "--no-warnings"],
    exclude: ["**/node_modules/**", "**/e2e/**"],
    // Running with >=2 concurrent forks reliably starves __tests__/crf/crf-studio.test.tsx's
    // multi-transition tests past their timeout under this project's full 2300+ test suite,
    // even though they pass instantly in isolation (confirmed: maxWorkers=2 still hangs,
    // only fully sequential execution is reliable). Disable file parallelism until the
    // underlying contention is root-caused.
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "**/node_modules/**",
        "**/e2e/**",
        "app/**/page.tsx",
        "app/**/layout.tsx",
        "app/not-found.tsx",
        "app/**/not-found.tsx",
        "app/instrumentation.ts",
        "components/**",
        "app/globals.css",
        "lib/dx/utils.ts",
        "sentry.*.config.ts",
        "prisma.config.ts",
        "scripts/**",
        "lib/layout-config.ts",
        "hooks/usePretextLayout.tsx",
        "lib/utils.ts",
        "components/providers/SearchProvider.tsx",
        "lib/validation-scanner.ts",
        "lib/accessibility-utils.ts",
        "hooks/useResizeObserver.ts",
        "app/generated/**",
        "vitest.setup.ts",
        "lib/dx/page-bench.ts",
        "lib/dungeon/types.ts",
        "lib/dungeon/index.ts",
        "lib/laser-loon/types.ts",
        "lib/laser-loon/index.ts",
        "lib/clinical-trial-chaos/types.ts",
        "lib/quasi-perfect/types.ts",
        "lib/quasi-perfect/index.ts",
        "lib/garmin-types.ts",
        "lib/working-with-duck-types.ts",
        "lib/telemetry/index.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
