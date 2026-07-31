import { describe, expect, it } from 'vitest';
import { clampTransactionPage, totalTransactionPages } from './pagination';

describe('transaction pagination', () => {
  it('supports the approved page sizes and returns to a valid page after filtering or deletion', () => {
    expect(totalTransactionPages(101, 25)).toBe(5);
    expect(totalTransactionPages(101, 100)).toBe(2);
    expect(clampTransactionPage(4, 25, 25)).toBe(0);
    expect(clampTransactionPage(1, 0, 10)).toBe(0);
  });
});
