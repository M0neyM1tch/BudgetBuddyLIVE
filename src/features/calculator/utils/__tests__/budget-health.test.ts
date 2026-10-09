import { describe, expect, it } from 'vitest';
import type { CalculatorTransaction } from '../../types/calculator.types';
import { buildBudgetHealthBreakdown } from '../budget-health.utils';

function transaction(overrides: Partial<CalculatorTransaction>): CalculatorTransaction {
  return {
    id: 'synthetic-transaction',
    amountCents: 10_000,
    category: 'savings',
    date: '2026-07-01',
    description: 'Synthetic fixture',
    goalId: null,
    kind: 'transfer',
    ...overrides,
  };
}

describe('Budget Health savings allocations', () => {
  it('includes applied goal and debt allocations in the savings percentage and score', () => {
    const result = buildBudgetHealthBreakdown([
      transaction({ kind: 'income', category: 'pay', amountCents: 500_000 }),
      transaction({ kind: 'expense', category: 'housing', amountCents: 250_000 }),
      transaction({ kind: 'expense', category: 'subscriptions', amountCents: 150_000 }),
      transaction({ category: 'savings', amountCents: 50_000, allocationAppliedCents: 50_000 }),
      transaction({ category: 'debt_payment', amountCents: 50_000, allocationAppliedCents: 50_000 }),
    ]);

    expect(result).toMatchObject({ savingsCents: 100_000, savingsPct: 20, score: 100 });
  });

  it('counts only the applied portion of capped allocations and preserves zero or missing amounts', () => {
    const result = buildBudgetHealthBreakdown([
      transaction({ amountCents: 10_000, allocationAppliedCents: 2_000 }),
      transaction({ category: 'debt_payment', amountCents: 10_000, allocationAppliedCents: 3_000 }),
      transaction({ amountCents: 10_000, allocationAppliedCents: 0 }),
      transaction({ amountCents: 10_000 }),
      transaction({ category: 'debt_payment', amountCents: 10_000 }),
    ]);

    expect(result.savingsCents).toBe(5_000);
  });

  it('preserves manually recorded savings, investments, and debt expenses without an allocation', () => {
    const result = buildBudgetHealthBreakdown([
      transaction({ kind: 'expense', category: 'savings', amountCents: 10_000, allocationAppliedCents: 0 }),
      transaction({ kind: 'expense', category: 'investment', amountCents: 20_000 }),
      transaction({ kind: 'expense', category: 'debt_payment', amountCents: 30_000 }),
    ]);

    expect(result.savingsCents).toBe(60_000);
  });

  it('does not count income or unrelated transfers as savings or spending', () => {
    const result = buildBudgetHealthBreakdown([
      transaction({ kind: 'income', category: 'savings', amountCents: 100_000 }),
      transaction({ kind: 'transfer', category: 'housing', allocationAppliedCents: 10_000 }),
      transaction({ kind: 'transfer', category: 'investment', allocationAppliedCents: 10_000 }),
    ]);

    expect(result).toMatchObject({ incomeCents: 100_000, savingsCents: 0, needsCents: 0, wantsCents: 0 });
  });
});
