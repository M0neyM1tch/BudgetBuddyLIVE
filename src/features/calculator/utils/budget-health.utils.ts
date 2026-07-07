import type {
  BudgetBucket,
  BudgetHealthBreakdown,
  BudgetHealthTargets,
  CalculatorTransaction,
} from '../types/calculator.types';

const CATEGORY_BUCKETS: Record<string, BudgetBucket> = {
  debt_payment: 'savings',
  food: 'needs',
  housing: 'needs',
  investment: 'savings',
  pay: 'ignore',
  savings: 'savings',
  subscriptions: 'wants',
  transportation: 'needs',
};

export const DEFAULT_BUDGET_TARGETS: BudgetHealthTargets = {
  needsPct: 50,
  wantsPct: 30,
  savingsPct: 20,
};

export function classifyTransactionBudgetBucket(transaction: CalculatorTransaction): BudgetBucket {
  if (transaction.kind !== 'expense') return 'ignore';
  return CATEGORY_BUCKETS[transaction.category] ?? 'wants';
}

export function buildBudgetHealthBreakdown(
  transactions: CalculatorTransaction[],
  targets: BudgetHealthTargets = DEFAULT_BUDGET_TARGETS,
): BudgetHealthBreakdown {
  const incomeCents = transactions.reduce(
    (sum, transaction) => sum + (transaction.kind === 'income' ? transaction.amountCents : 0),
    0,
  );
  const buckets = transactions.reduce(
    (summary, transaction) => {
      const bucket = classifyTransactionBudgetBucket(transaction);
      if (bucket === 'needs') summary.needsCents += transaction.amountCents;
      if (bucket === 'wants') summary.wantsCents += transaction.amountCents;
      if (bucket === 'savings') summary.savingsCents += transaction.amountCents;
      return summary;
    },
    { needsCents: 0, wantsCents: 0, savingsCents: 0 },
  );
  const divisor = Math.max(incomeCents, 1);
  const needsPct = (buckets.needsCents / divisor) * 100;
  const wantsPct = (buckets.wantsCents / divisor) * 100;
  const savingsPct = (buckets.savingsCents / divisor) * 100;

  return {
    incomeCents,
    ...buckets,
    needsPct,
    wantsPct,
    savingsPct,
    score: budgetHealthScore({ needsPct, wantsPct, savingsPct }, targets),
  };
}

export function budgetHealthScore(
  actual: Pick<BudgetHealthBreakdown, 'needsPct' | 'wantsPct' | 'savingsPct'>,
  targets: BudgetHealthTargets = DEFAULT_BUDGET_TARGETS,
): number {
  const savingsDeviation =
    actual.savingsPct < targets.savingsPct
      ? (targets.savingsPct - actual.savingsPct) * 1.5
      : (actual.savingsPct - targets.savingsPct) * 0.25;
  const deviation =
    Math.abs(actual.needsPct - targets.needsPct) +
    Math.abs(actual.wantsPct - targets.wantsPct) +
    savingsDeviation;

  return Math.max(0, Math.round(100 - deviation));
}

export function budgetHealthGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function budgetRecommendation(
  breakdown: BudgetHealthBreakdown,
  targets: BudgetHealthTargets,
): string {
  const gaps = [
    {
      label: 'needs',
      actual: breakdown.needsPct,
      target: targets.needsPct,
    },
    {
      label: 'wants',
      actual: breakdown.wantsPct,
      target: targets.wantsPct,
    },
    {
      label: 'savings and debt payoff',
      actual: breakdown.savingsPct,
      target: targets.savingsPct,
    },
  ].sort((a, b) => Math.abs(b.actual - b.target) - Math.abs(a.actual - a.target));
  const biggest = gaps[0];

  if (!biggest) return 'Your budget split is close to target.';
  if (biggest.actual > biggest.target) {
    return `Your ${biggest.label} allocation is running above target.`;
  }

  return `Your ${biggest.label} allocation is below target.`;
}
