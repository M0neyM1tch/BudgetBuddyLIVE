import { describe, expect, it } from 'vitest';
import { DEFAULT_QUICK_ADD_CHIPS } from '../../constants/categories';
import { quickAddChipsSchema, transactionFiltersSchema } from '../transactions.schema';

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

  it('accepts category-only saved chips and strictly validates typed quick-add targets', () => {
    expect(quickAddChipsSchema.parse([{
      id: 'legacy', label: 'Legacy', description: '', amount_cents: 100, kind: 'expense', category: 'food',
    }])[0]?.target).toBeUndefined();

    expect(quickAddChipsSchema.safeParse([{
      id: 'bad', label: 'Bad', amount_cents: 100, kind: 'expense', category: 'food', target: { kind: 'goal' },
    }]).success).toBe(false);
  });

  it('restores the active-priority chip in the approved Reset defaults', () => {
    expect(DEFAULT_QUICK_ADD_CHIPS[0]).toMatchObject({
      id: 'active-priority',
      amount_cents: 10_000,
      target: { kind: 'active_priority' },
    });
    expect(DEFAULT_QUICK_ADD_CHIPS.map((chip) => String(chip.id))).not.toContain('coffee');
  });
});
