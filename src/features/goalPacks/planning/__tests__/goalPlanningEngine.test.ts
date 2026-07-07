import { describe, expect, it } from 'vitest';
import { calculateGoalPlan } from '../goalPlanningEngine';
import type { FinancialPriority, GoalPlanGoal } from '../../types/goalPacks.types';

const baseGoal: GoalPlanGoal = {
  color: '#00ffaa',
  confidence_score: null,
  created_at: '2026-06-30T00:00:00.000Z',
  current_amount_cents: 2_000_00,
  goal_type: 'major_purchase',
  icon: 'house',
  id: '00000000-0000-4000-8000-000000000001',
  is_archived: false,
  last_plan_calculated_at: null,
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

const basePriority: FinancialPriority = {
  active_goal_id: baseGoal.id,
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
  user_id: baseGoal.user_id,
};

describe('calculateGoalPlan', () => {
  it('calculates progress, required monthly, projected date, and confidence', () => {
    const plan = calculateGoalPlan({
      currentDate: '2026-06-30',
      goal: baseGoal,
      priority: basePriority,
    });

    expect(plan.amountRemainingCents).toBe(800_000);
    expect(plan.progressPercent).toBe(20);
    expect(plan.requiredMonthlyCents).toBe(100_000);
    expect(plan.projectedCompletionDate).toBe('2027-10-30');
    expect(plan.confidenceScore).toBeLessThan(70);
    expect(plan.snapshotDraft).toMatchObject({
      goal_id: baseGoal.id,
      progress_percent: 20,
      required_monthly_cents: 100_000,
      snapshot_kind: 'recalculation',
    });
  });

  it('uses cash-flow capacity when the goal has no monthly commitment', () => {
    const plan = calculateGoalPlan({
      currentDate: '2026-06-30',
      goal: {
        ...baseGoal,
        monthly_commitment_cents: null,
        target_date: null,
      },
      priority: basePriority,
    });

    expect(plan.currentMonthlyCapacityCents).toBe(250_000);
    expect(plan.goalPlanUpdate.monthly_commitment_cents).toBe(250_000);
    expect(plan.projectedCompletionDate).toBe('2026-10-30');
    expect(plan.requiredMonthlyCents).toBeNull();
  });

  it('preserves an explicit zero monthly commitment instead of using cash-flow capacity', () => {
    const plan = calculateGoalPlan({
      currentDate: '2026-06-30',
      goal: {
        ...baseGoal,
        monthly_commitment_cents: 0,
        target_date: null,
      },
      priority: basePriority,
    });

    expect(plan.currentMonthlyCapacityCents).toBe(250_000);
    expect(plan.goalPlanUpdate.monthly_commitment_cents).toBe(0);
    expect(plan.projectedCompletionDate).toBeNull();
    expect(plan.actionDraft.action_type).toBe('set_recurring_contribution');
  });

  it('recommends setting a contribution when no cash-flow signal exists', () => {
    const plan = calculateGoalPlan({
      currentDate: '2026-06-30',
      goal: {
        ...baseGoal,
        monthly_commitment_cents: null,
        target_date: null,
      },
      priority: {
        ...basePriority,
        monthly_expenses_cents: null,
        monthly_income_cents: null,
      },
    });

    expect(plan.projectedCompletionDate).toBeNull();
    expect(plan.actionDraft).toMatchObject({
      action_type: 'set_recurring_contribution',
      title: 'Set a monthly contribution',
    });
  });

  it('adds debt payoff method guidance for debt goals', () => {
    const plan = calculateGoalPlan({
      currentDate: '2026-06-30',
      goal: {
        ...baseGoal,
        current_amount_cents: 0,
        goal_type: 'debt_payoff',
        monthly_commitment_cents: 400_00,
        target_amount_cents: 8_200_00,
        target_date: null,
      },
      priority: {
        ...basePriority,
        top_priority_type: 'debt_payoff',
      },
    });

    expect(plan.recommendations.some((item) => item.action === 'select_debt_method')).toBe(true);
  });

  it('factors onboarding debt interest into debt payoff timing', () => {
    const plan = calculateGoalPlan({
      currentDate: '2026-06-30',
      goal: {
        ...baseGoal,
        current_amount_cents: 0,
        goal_type: 'debt_payoff',
        monthly_commitment_cents: 550_00,
        planning_rules: {
          onboarding: {
            debtInterestRateBasisPoints: 1_999,
            debtMinimumPaymentCents: 150_00,
          },
        },
        target_amount_cents: 8_200_00,
        target_date: '2027-02-28',
      },
      priority: {
        ...basePriority,
        top_priority_type: 'debt_payoff',
      },
    });

    expect(plan.requiredMonthlyCents).toBe(110_332);
    expect(plan.requiredMonthlyCents).toBeGreaterThan(102_500);
    expect(plan.projectedCompletionDate).toBe('2027-12-30');
  });
});
