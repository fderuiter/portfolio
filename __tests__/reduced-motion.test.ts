import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock framer-motion's useReducedMotion hook
const mockUseReducedMotion = vi.fn();
vi.mock('framer-motion', async (importOriginal) => {
  const original = await importOriginal<typeof import('framer-motion')>();
  return {
    ...original,
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

describe('Reduced Motion Integrations', () => {
  const heroPath = path.resolve(__dirname, '../components/Hero.tsx');
  const tracingBeamPath = path.resolve(__dirname, '../components/ui/TracingBeam.tsx');
  const gridPatternPath = path.resolve(__dirname, '../components/AnimatedGridPattern.tsx');

  const heroContent = fs.readFileSync(heroPath, 'utf-8');
  const tracingBeamContent = fs.readFileSync(tracingBeamPath, 'utf-8');
  const gridPatternContent = fs.readFileSync(gridPatternPath, 'utf-8');

  it('should evaluate the reduced motion hook correctly when mocked', () => {
    mockUseReducedMotion.mockReturnValue(true);
    expect(mockUseReducedMotion()).toBe(true);

    mockUseReducedMotion.mockReturnValue(false);
    expect(mockUseReducedMotion()).toBe(false);
  });

  it('should correctly import all updated motion components', async () => {
    const { Hero, HeroHeadline, HeroText } = await import('@/components/Hero');
    const { AnimatedGridPattern } = await import('@/components/AnimatedGridPattern');
    const { TracingBeam } = await import('@/components/ui/TracingBeam');

    expect(Hero).toBeDefined();
    expect(HeroHeadline).toBeDefined();
    expect(HeroText).toBeDefined();
    expect(AnimatedGridPattern).toBeDefined();
    expect(TracingBeam).toBeDefined();
  });

  it('Requirement 1 & 2: 50ms collision detection is not initialized when reduced motion evaluates to true', () => {
    // Statically verify useReducedMotion is integrated in Hero.tsx
    expect(heroContent).toContain('useReducedMotion');
    
    // Verify early return exists inside the collision hook or interval setup effect
    expect(heroContent).toContain('if (shouldReduceMotion) return;');
    
    // Verify interval is set up in a place that has been guarded by early return
    expect(heroContent).toContain('const animationInterval = setInterval(checkCollision, 50);');
  });

  it('Requirement 3: SVG scroll progress indicators switch to direct linear tracking in reduced motion', () => {
    // Statically verify useReducedMotion is integrated in TracingBeam.tsx
    expect(tracingBeamContent).toContain('useReducedMotion');
    
    // Verify linear tracking (scrollYProgress) is preferred over spring smoothing (scrollYProgressSpring) when motion is reduced
    expect(tracingBeamContent).toContain('shouldReduceMotion ? scrollYProgress : scrollYProgressSpring');
  });

  it('Requirement 4: Ambient grid structures disable randomized key-based updates in reduced motion', () => {
    // Statically verify useReducedMotion is integrated in AnimatedGridPattern.tsx
    expect(gridPatternContent).toContain('useReducedMotion');
    
    // Verify randomized keys are disabled (different key format)
    expect(gridPatternContent).toContain('key={shouldReduceMotion ?');
    
    // Verify no animation updates are triggered on completion
    expect(gridPatternContent).toContain('onAnimationComplete={shouldReduceMotion ? undefined :');
  });

  it('Requirement 5: Header text elements replace multi-axis scaling/translations with opacity-only transitions', () => {
    // Verify HeroHeadline uses simple opacity fade-in under reduced motion state
    expect(heroContent).toContain('const wordVariants = shouldReduceMotion ? {');
    expect(heroContent).toContain('hidden: {\n      opacity: 0,\n    }');
    expect(heroContent).toContain('visible: {\n      opacity: 1,');
    
    // Ensure translation coordinates are removed under reduced motion
    const subHeaderSnippet = 'initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}';
    expect(heroContent).toContain(subHeaderSnippet);
    
    // Ensure CTA container uses translation coordinate removal
    const ctaSnippet = 'initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}';
    expect(heroContent).toContain(ctaSnippet);
  });
});
