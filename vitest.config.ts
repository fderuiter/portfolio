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
        'components/Hero.tsx',
        'components/BentoGrid.tsx',
        'components/AnimatedGridPattern.tsx',
        'components/Navbar.tsx',
        'components/Timeline.tsx',
        'components/TextReveal.tsx',
        'components/SkillsGrid.tsx',
        'components/PretextCard.tsx',
        'components/CommandPalette.tsx',
        'components/CommitSparkline.tsx',
        'components/GarminWatchSimulator.tsx',
        'components/SearchWrapper.tsx',
        'components/TelemetryTracker.tsx',
        'components/Terminal.tsx',
        'components/RetroLabyrinth.tsx',
        'components/ui/TracingBeam.tsx',
        'components/CaseStudyShowcase.tsx',
        'components/SandboxTerminal.tsx',
        'components/UnifiedErrorLayout.tsx',
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
        'lib/github.ts',
        'hooks/useConsoleArt.ts',
        'hooks/usePersistentState.ts',
        'hooks/useResizeObserver.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
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
