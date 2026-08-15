import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/e2e/**',
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/not-found.tsx',
        'app/**/not-found.tsx',
        'app/instrumentation.ts',
        'components/**',
        'app/globals.css',
        'lib/dungeon/types.ts',
        'lib/dungeon/index.ts',
        'lib/laser-loon/types.ts',
        'lib/laser-loon/index.ts',
        'lib/clinical-trial-chaos/types.ts',
        'lib/dx/utils.ts',
        'sentry.*.config.ts',
        'prisma.config.ts',
        'scripts/**',
        'lib/layout-config.ts',
        'hooks/usePretextLayout.tsx',
        'lib/utils.ts',
        'app/api/telemetry/sync/route.ts',
        'components/providers/SearchProvider.tsx',
        'lib/graphics-engine.ts',
        'lib/validation-scanner.ts',
        'lib/accessibility-utils.ts',
        'lib/seo.ts',
        'lib/error-sanitization.ts',
        'hooks/useResizeObserver.ts',
        'app/generated/**',
        'lib/quasi-perfect/types.ts',
        'lib/quasi-perfect/index.ts',
        'lib/garmin-types.ts',
        'lib/working-with-duck-types.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 65,
        statements: 80,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
