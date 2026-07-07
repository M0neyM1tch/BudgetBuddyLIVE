import type {
  CalculatorRecurringRule,
  RecurringCostRow,
  RecurringCostSummary,
} from '../types/calculator.types';

export function monthlyEquivalentFromFrequency(rule: CalculatorRecurringRule): number {
  const frequency = rule.frequency as CalculatorRecurringRule['frequency'] | 'quarterly' | 'yearly';

  switch (frequency) {
    case 'weekly':
      return Math.round((rule.amountCents * 52) / 12);
    case 'biweekly':
      return Math.round((rule.amountCents * 26) / 12);
    case 'semi_monthly':
      return rule.amountCents * 2;
    case 'monthly':
      return rule.amountCents;
    case 'quarterly':
      return Math.round(rule.amountCents / 3);
    case 'yearly':
      return Math.round(rule.amountCents / 12);
    default: {
      const exhausted: never = frequency;
      console.warn(`[BudgetBuddy] Unhandled recurring frequency: ${String(exhausted)}`);
      return rule.amountCents;
    }
  }
}

export function annualizedRecurringCost(rule: CalculatorRecurringRule): number {
  return monthlyEquivalentFromFrequency(rule) * 12;
}

export function buildRecurringCostRows(rules: CalculatorRecurringRule[]): RecurringCostRow[] {
  return rules
    .filter((rule) => rule.kind === 'expense')
    .map((rule) => ({
      id: rule.id,
      annualCents: annualizedRecurringCost(rule),
      category: rule.category,
      description: rule.description || rule.category,
      frequency: rule.frequency,
      isLikelySubscription: rule.category === 'subscriptions',
      monthlyCents: monthlyEquivalentFromFrequency(rule),
    }))
    .sort((a, b) => b.annualCents - a.annualCents);
}

export function selectedCancellationSavings(
  rows: RecurringCostRow[],
  selectedIds: Set<string>,
): number {
  return rows.reduce(
    (sum, row) => sum + (selectedIds.has(row.id) ? row.annualCents : 0),
    0,
  );
}

export function fiveYearRecurringSavings(annualCents: number): number {
  return annualCents * 5;
}

export function buildRecurringCostSummary(
  rows: RecurringCostRow[],
  selectedIds: Set<string>,
): RecurringCostSummary {
  const selectedAnnualCents = selectedCancellationSavings(rows, selectedIds);

  return {
    monthlyCents: rows.reduce((sum, row) => sum + row.monthlyCents, 0),
    annualCents: rows.reduce((sum, row) => sum + row.annualCents, 0),
    selectedAnnualCents,
    fiveYearSelectedSavingsCents: fiveYearRecurringSavings(selectedAnnualCents),
  };
}
