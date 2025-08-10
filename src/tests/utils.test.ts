import { describe, it, expect, vi } from 'vitest';
import { calcPrice, needsUpdate } from '@/lib/utils';

describe('calcPrice', () => {
  it('adds VAT 7% only when excise disabled', () => {
    expect(calcPrice(100, false)).toBe(107);
  });
  it('adds VAT 7% and excise 8.8% when enabled', () => {
    // 100 + 7 + 8.8 = 115.8
    expect(calcPrice(100, true)).toBe(115.8);
  });
  it('handles negative and NaN as 0', () => {
    expect(calcPrice(-10, true)).toBe(0);
    // @ts-expect-error deliberate NaN
    expect(calcPrice(Number('x'), true)).toBe(0);
  });
});

describe('needsUpdate', () => {
  it('true when > 6 months', () => {
    const now = new Date('2025-01-01');
    const sevenMonthsAgo = new Date('2024-06-01').toISOString();
    expect(needsUpdate(sevenMonthsAgo, now)).toBe(true);
  });
  it('false when within 6 months', () => {
    const now = new Date('2025-01-01');
    const twoMonthsAgo = new Date('2024-11-01').toISOString();
    expect(needsUpdate(twoMonthsAgo, now)).toBe(false);
  });
  it('true for invalid date', () => {
    expect(needsUpdate('invalid-date')).toBe(true);
  });
});