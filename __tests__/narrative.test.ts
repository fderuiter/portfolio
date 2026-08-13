import { describe, it, expect } from 'vitest';
import { tooltipDictionary } from '@/lib/tooltip-dictionary';

describe('Dual-Narrative Mode & Tooltip Centralized Dictionary', () => {
  it('should have all required tooltip translations defined with non-empty strings', () => {
    const keys = [
      'clinicalIntegrations',
      'layoutPhysics',
      'serverlessScaling',
      'architecturalNarratives',
      'systemsRigor'
    ];

    keys.forEach((key) => {
      expect(tooltipDictionary[key]).toBeDefined();
      expect(tooltipDictionary[key].recruiter).toBeTruthy();
      expect(tooltipDictionary[key].developer).toBeTruthy();
      expect(typeof tooltipDictionary[key].recruiter).toBe('string');
      expect(typeof tooltipDictionary[key].developer).toBe('string');
    });
  });

  it('should maintain similar character lengths for recruiter and developer translations to prevent layout jitter', () => {
    // Requirements/Constraint: Static text translations must maintain similar character lengths to prevent tooltip box size overflow and visual jitter.
    Object.keys(tooltipDictionary).forEach((key) => {
      const translation = tooltipDictionary[key];
      const recLength = translation.recruiter.length;
      const devLength = translation.developer.length;
      
      const diff = Math.abs(recLength - devLength);
      // Let's assert they are within 15 characters of each other.
      expect(diff).toBeLessThan(15);
    });
  });

  it('should verify the content of recruiter and developer messages for each key', () => {
    expect(tooltipDictionary.clinicalIntegrations.recruiter).toContain("healthcare");
    expect(tooltipDictionary.clinicalIntegrations.developer).toContain("SOAP XML");

    expect(tooltipDictionary.layoutPhysics.recruiter).toContain("smooth");
    expect(tooltipDictionary.layoutPhysics.developer).toContain("60fps");

    expect(tooltipDictionary.serverlessScaling.recruiter).toContain("fast");
    expect(tooltipDictionary.serverlessScaling.developer).toContain("connection pools");

    expect(tooltipDictionary.architecturalNarratives.recruiter).toContain("human story");
    expect(tooltipDictionary.architecturalNarratives.developer).toContain("git commit");

    expect(tooltipDictionary.systemsRigor.recruiter).toContain("reliability");
    expect(tooltipDictionary.systemsRigor.developer).toContain("3 AM");
  });
});
