import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    execArgv: ['--max-old-space-size=4096'],
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
        'lib/dx/utils.ts',
        'sentry.*.config.ts',
        'prisma.config.ts',
        'scripts/**',
        'lib/layout-config.ts',
        'hooks/usePretextLayout.tsx',
        'lib/utils.ts',
        'components/providers/SearchProvider.tsx',
        'lib/validation-scanner.ts',
        'lib/accessibility-utils.ts',
        'hooks/useResizeObserver.ts',
        'app/generated/**',
      ],
      thresholds: {
        lines: 86,
        functions: 90,
        branches: 74,
        statements: 86,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
