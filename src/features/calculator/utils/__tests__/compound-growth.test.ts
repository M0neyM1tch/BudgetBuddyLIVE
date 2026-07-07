import { describe, expect, it } from 'vitest';
import { compoundFutureValue } from '../compound-growth.utils';

describe('compound growth annual compounding', () => {
  it('returns $1,628.89 for $1,000 at 5% for 10 years', () => {
    expect(compoundFutureValue(100_000, 0, 0.05, 10)).toBe(162_889);
  });

  it('returns principal when rate and contributions are zero', () => {
    expect(compoundFutureValue(100_000, 0, 0, 10)).toBe(100_000);
  });

  it('returns zero for zero principal and zero contributions', () => {
    expect(compoundFutureValue(0, 0, 0.05, 10)).toBe(0);
  });

  it('adds yearly contributions under annual compounding', () => {
    expect(compoundFutureValue(0, 10_000, 0, 2)).toBe(240_000);
  });
});
