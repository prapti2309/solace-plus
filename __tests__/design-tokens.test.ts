import { describe, it, expect } from 'vitest';
import { colors, typography } from '@solace-plus/design-tokens';

describe('Design Tokens Package', () => {
  it('should export primary brand colors', () => {
    expect(colors.primary[500]).toBe('#38878a');
  });

  it('should export crisis alert tokens with AAA compliance colors', () => {
    expect(colors.crisis.button).toBe('#dc2626');
    expect(colors.crisis.text).toBe('#981b1b');
  });

  it('should export standard typography scale', () => {
    expect(typography.fontFamily.sans).toContain('Plus Jakarta Sans');
  });
});
