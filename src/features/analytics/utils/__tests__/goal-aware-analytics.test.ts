import { describe, expect, it } from 'vitest';
import type { GoalPlanSnapshot } from '../../../goalPacks/types/goalPacks.types';
import type { AnalyticsTransaction, DateRange } from '../../types/analytics.types';
import { buildGoalAwareAnalyticsModel } from '../goal-aware-analytics.utils';

const range: DateRange = {
  from: '2026-06-01',
  preset: 'custom',
  to: '2026-06-30',
};

const plan = {
  amountRemainingCents: 8_000_00,
  confidenceScore: 72,
  currencyCode: 'CAD',
  currentAmountCents: 2_000_00,
  goalName: 'Emergency fund',
  goalType: 'emergency_fund' as const,
  monthlyCommitmentCents: 800_00,
  projectedCompletionDate: '2027-04-01',
  requiredMonthlyCents: 700_00,
  targetAmountCents: 10_000_00,
};

function transaction(
  id: string,
  amountCents: number,
  kind: AnalyticsTransaction['kind'],
  category: string,
): AnalyticsTransaction {
  return {
    amountCents,
    category,
    date: '2026-06-15',
    id,
    kind,
  };
}

function snapshot(overrides: Partial<GoalPlanSnapshot>): GoalPlanSnapshot {
  return {
    confidence_score: 70,
    created_at: '2026-06-30T00:00:00Z',
    current_monthly_capacity_cents: 800_00,
    drivers: [],
    goal_id: 'goal-1',
    id: 'snapshot-1',
    progress_percent: 20,
    projected_completion_date: '2027-04-01',
    recommendations: [],
    required_monthly_cents: 700_00,
    snapshot_kind: 'recalculation',
    user_id: 'user-1',
    ...overrides,
  };
}

describe('buildGoalAwareAnalyticsModel', () => {
  it('marks the plan covered when monthlyized net cash flow exceeds the monthly target', () => {
    const model = buildGoalAwareAnalyticsModel({
      latestSnapshot: snapshot({ id: 'latest' }),
      plan,
      previousSnapshot: null,
      priorTransactions: [],
      range,
      transactions: [
        transaction('income-1', 3_500_00, 'income', 'salary'),
        transaction('expense-1', 1_800_00, 'expense', 'groceries'),
      ],
    });

    expect(model.planStatus.tone).toBe('good');
    expect(model.metrics.find((metric) => metric.label === 'Monthly gap')?.value).toBe('Covered');
  });

  it('explains cash-flow tightening and category increases against the prior period', () => {
    const model = buildGoalAwareAnalyticsModel({
      latestSnapshot: null,
      plan,
      previousSnapshot: null,
      priorTransactions: [
        transaction('prior-income', 3_500_00, 'income', 'salary'),
        transaction('prior-food', 150_00, 'expense', 'food'),
        transaction('prior-housing', 2_800_00, 'expense', 'housing'),
      ],
      range,
      transactions: [
        transaction('income-1', 3_500_00, 'income', 'salary'),
        transaction('expense-1', 550_00, 'expense', 'food'),
        transaction('expense-2', 2_800_00, 'expense', 'housing'),
      ],
    });

    expect(model.changeInsights[0]?.body).toContain('tightened');
    expect(model.changeInsights.some((insight) => insight.body.includes('Food spending rose'))).toBe(true);
    expect(model.spendingLevers[0]?.label).toBe('Rent/housing');
  });

  it('surfaces plan snapshot date movement', () => {
    const model = buildGoalAwareAnalyticsModel({
      latestSnapshot: snapshot({
        id: 'latest',
        projected_completion_date: '2027-03-01',
      }),
      plan,
      previousSnapshot: snapshot({
        id: 'previous',
        projected_completion_date: '2027-04-01',
      }),
      priorTransactions: [transaction('prior-income', 2_500_00, 'income', 'salary')],
      range,
      transactions: [transaction('income-1', 2_700_00, 'income', 'salary')],
    });

    expect(model.changeInsights.some((insight) => insight.body.includes('days sooner'))).toBe(true);
  });
});
