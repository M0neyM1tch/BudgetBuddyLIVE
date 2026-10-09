import { describe, expect, it } from 'vitest';
import { requireCompleteRows } from './completeRows';

describe('single-response completeness', () => {
  it('accepts a complete empty response', () => {
    expect(requireCompleteRows({ data: [], count: 0 }, 'history')).toEqual([]);
  });

  it('accepts the exact response boundary without assuming a fixed server limit', () => {
    const data = Array.from({ length: 1_000 }, (_, id) => ({ id }));
    expect(requireCompleteRows({ data, count: 1_000 }, 'history')).toBe(data);
  });

  it('rejects truncated rows and inconsistent extra rows', () => {
    for (const count of [0, 2, 1_001]) {
      expect(() => requireCompleteRows({ data: [{ id: 1 }], count }, 'history'))
        .toThrow(/cannot show partial results/);
    }
  });

  it.each([null, undefined, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects unavailable or invalid exact count %s',
    (count) => {
      expect(() => requireCompleteRows({ data: [], count: count as number | null }, 'history'))
        .toThrow(/could not be verified/);
    },
  );

  it('rejects missing data even when the count is zero', () => {
    expect(() => requireCompleteRows({ data: null, count: 0 }, 'history'))
      .toThrow(/could not be verified/);
  });
});
