import { describe, expect, it } from 'vitest';
import { lastSixFullMonthsRange, monthRange } from '../calculator.utils';

describe('selected month ranges', () => {
  it.each([
    ['2026-10', '2026-10-31'],
    ['2025-12', '2025-12-31'],
    ['2026-01', '2026-01-31'],
    ['2028-02', '2028-02-29'],
    ['2026-02', '2026-02-28'],
    ['2100-02', '2100-02-28'],
    ['2000-02', '2000-02-29'],
    ['0004-02', '0004-02-29'],
  ])('bounds %s inclusively', (month, to) => {
    expect(monthRange(month)).toEqual({ from: `${month}-01`, to });
  });

  it.each(['', '2026-00', '2026-13', '2026-1', '0000-01', '2026-10-08', 'not a month'])(
    'rejects invalid month %s', (month) => expect(monthRange(month)).toBeNull(),
  );

  it('preserves the six completed months used by the other planners across a year boundary', () => {
    expect(lastSixFullMonthsRange(new Date(2026, 0, 15))).toEqual({ from: '2025-07-01', to: '2025-12-31' });
  });
});
