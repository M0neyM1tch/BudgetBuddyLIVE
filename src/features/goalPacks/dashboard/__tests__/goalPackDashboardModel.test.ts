import { describe, expect, it } from 'vitest';
import { buildGoalPackDashboardModel } from '../goalPackDashboardModel';
import type {
  FinancialPriority,
  GoalAction,
  GoalPlanGoal,
  GoalPlanSnapshot,
} from '../../types/goalPacks.types';

const goal: GoalPlanGoal = {
  color: '#00ffaa',
  confidence_score: 68,
  created_at: '2026-06-30T00:00:00.000Z',
  current_amount_cents: 2_500_00,
  goal_type: 'major_purchase',
  icon: 'house',
  id: '00000000-0000-4000-8000-000000000001',
  is_archived: false,
  last_plan_calculated_at: '2026-06-30T00:00:00.000Z',
  monthly_commitment_cents: 500_00,
  name: 'First home fund',
  plan_status: 'active',
  planning_rules: {},
  priority_rank: 1,
  starting_balance_cents: 2_000_00,
  target_amount_cents: 10_000_00,
  target_date: '2027-02-28',
  updated_at: '2026-06-30T00:00:00.000Z',
  user_id: '00000000-0000-4000-8000-000000000010',
};

const priority: FinancialPriority = {
  active_goal_id: goal.id,
  country_code: 'CA',
  created_at: '2026-06-30T00:00:00.000Z',
  currency_code: 'CAD',
  horizon: 'medium_term',
  id: '00000000-0000-4000-8000-000000000020',
  monthly_expenses_cents: 3_000_00,
  monthly_income_cents: 5_500_00,
  region_code: 'ON',
  top_priority_type: 'major_purchase',
  updated_at: '2026-06-30T00:00:00.000Z',
  user_id: goal.user_id,
};

const snapshot: GoalPlanSnapshot = {
  confidence_score: 68,
  created_at: '2026-07-01T00:00:00.000Z',
  current_monthly_capacity_cents: 2_500_00,
  drivers: [],
  goal_id: goal.id,
  id: '00000000-0000-4000-8000-000000000030',
  progress_percent: 25,
  projected_completion_date: '2027-09-30',
  recommendations: [],
  required_monthly_cents: 93_750,
  snapshot_kind: 'recalculation',
  user_id: goal.user_id,
};

const action: GoalAction = {
  action_type: 'review_spending_leak',
  completed_at: null,
  created_at: '2026-07-01T00:00:00.000Z',
  description: 'Find the monthly gap or move the target date.',
  dismissed_at: null,
  due_at: null,
  goal_id: goal.id,
  id: '00000000-0000-4000-8000-000000000040',
  impact_label: 'Improves target-date confidence.',
  impact_value: {},
  source: 'system',
  status: 'open',
  title: 'Close the monthly gap',
  updated_at: '2026-07-01T00:00:00.000Z',
  user_id: goal.user_id,
};

describe('buildGoalPackDashboardModel', () => {
  it('returns null when there is no active priority goal', () => {
    expect(
      buildGoalPackDashboardModel({
        actions: [],
        goal: null,
        priority: null,
        snapshot: null,
      }),
    ).toBeNull();
  });

  it('builds dashboard-ready active priority content', () => {
    const model = buildGoalPackDashboardModel({
      actions: [action],
      goal,
      priority,
      snapshot,
    });

    expect(model).toMatchObject({
      actionId: action.id,
      actionImpact: 'Improves target-date confidence.',
      actionTitle: 'Close the monthly gap',
      actionType: 'review_spending_leak',
      amountRemainingCents: 750_000,
      confidenceScore: 68,
      goalName: 'First home fund',
      packLabel: 'Major Purchase / Home Fund',
      packRiskCopy:
        'Major purchase and home-fund timelines are estimates based on target amount, savings, and contribution assumptions; they do not assess mortgage approval, tax treatment, or legal readiness.',
      progressPercent: 25,
    });
    expect(model?.metrics.map((metric) => metric.label)).toEqual([
      'Remaining gap',
      'Projected date',
      'Required monthly',
      'Confidence',
    ]);
  });

  it('uses debt-specific labels for debt payoff goals', () => {
    const model = buildGoalPackDashboardModel({
      actions: [],
      goal: {
        ...goal,
        current_amount_cents: 0,
        goal_type: 'debt_payoff',
        monthly_commitment_cents: 400_00,
        target_amount_cents: 8_200_00,
        target_date: null,
      },
      priority: {
        ...priority,
        top_priority_type: 'debt_payoff',
      },
      snapshot: null,
    });

    expect(model?.metrics.map((metric) => metric.label)).toContain('Debt-free date');
    expect(model?.metrics.map((metric) => metric.label)).toContain('Required payoff');
    expect(model?.recommendations).toContain('Compare payoff methods');
  });

  it('marks fallback recommendations as not persisted actions', () => {
    const model = buildGoalPackDashboardModel({
      actions: [],
      goal,
      priority,
      snapshot,
    });

    expect(model?.actionId).toBeNull();
    expect(model?.actionType).toBe('review_spending_leak');
  });
});
