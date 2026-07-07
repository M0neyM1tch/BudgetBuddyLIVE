import { describe, expect, it } from 'vitest';
import { transactionFiltersSchema } from '../transactions.schema';

describe('transactionFiltersSchema', () => {
  it('accepts amount range filters as dollars', () => {
    const parsed = transactionFiltersSchema.parse({
      kind: 'expense',
      category: 'food',
      amountMin: '10.50',
      amountMax: '75',
    });

    expect(parsed).toMatchObject({
      kind: 'expense',
      category: 'food',
      amountMin: 10.5,
      amountMax: 75,
    });
  });

  it('rejects inverted amount ranges', () => {
    const parsed = transactionFiltersSchema.safeParse({
      amountMin: '100',
      amountMax: '50',
    });

    expect(parsed.success).toBe(false);
  });

  it('keeps empty filter state valid', () => {
    expect(transactionFiltersSchema.parse({})).toEqual({});
  });
});
