import { describe, expect, it } from 'vitest';
import {
  buildGoalPackOnboardingPlan,
  type GoalPackOnboardingDraft,
} from '../goalPackOnboarding';

const baseDraft: GoalPackOnboardingDraft = {
  age: '32',
  countryCode: 'ca',
  currentAmount: '1000',
  debtBalance: '',
  debtInterestRate: '',
  debtMinimumPayment: '',
  goalName: '',
  horizon: 'short_term',
  monthlyCommitment: '250',
  monthlyEssentialExpenses: '',
  monthlyExpenses: '3000',
  monthlyIncome: '5200',
  priorityType: 'major_purchase',
  regionCode: 'ON',
  targetAmount: '25000',
  targetDate: '2027-06-30',
  targetMonths: '3',
};

describe('buildGoalPackOnboardingPlan', () => {
  it('creates a major purchase priority, starter goal, and first action', () => {
    const plan = buildGoalPackOnboardingPlan({
      ...baseDraft,
      goalName: 'First home fund',
    });

    expect(plan.goalDraft).toMatchObject({
      icon: 'house',
      name: 'First home fund',
      starting_balance_cents: 100_000,
      target_amount_cents: 2_500_000,
      target_date: '2027-06-30',
    });
    expect(plan.priorityDraft).toMatchObject({
      country_code: null,
      currency_code: 'CAD',
      horizon: 'short_term',
      top_priority_type: 'major_purchase',
    });
    expect(plan.goalPlanUpdate).toMatchObject({
      goal_type: 'major_purchase',
      monthly_commitment_cents: 25_000,
      plan_status: 'active',
      priority_rank: 1,
    });
    expect(plan.actionDraft.action_type).toBe('set_recurring_contribution');
  });

  it('derives emergency fund target from essentials and target months', () => {
    const plan = buildGoalPackOnboardingPlan({
      ...baseDraft,
      currentAmount: '500',
      monthlyCommitment: '300',
      monthlyEssentialExpenses: '2100',
      priorityType: 'emergency_fund',
      targetAmount: '',
      targetMonths: '4',
    });

    expect(plan.goalDraft).toMatchObject({
      icon: 'lock',
      name: 'Emergency fund',
      starting_balance_cents: 50_000,
      target_amount_cents: 840_000,
    });
    expect(plan.goalPlanUpdate.planning_rules).toMatchObject({
      onboarding: {
        monthlyEssentialExpensesCents: 210_000,
        targetMonths: 4,
      },
    });
  });

  it('builds debt payoff as a focused goal and payoff-method action', () => {
    const plan = buildGoalPackOnboardingPlan({
      ...baseDraft,
      currentAmount: '',
      debtBalance: '8200',
      debtInterestRate: '19.99',
      debtMinimumPayment: '150',
      priorityType: 'debt_payoff',
      targetAmount: '',
      targetDate: '',
    });

    expect(plan.goalDraft).toMatchObject({
      icon: 'check',
      name: 'Debt payoff plan',
      starting_balance_cents: 0,
      target_amount_cents: 820_000,
      target_date: null,
    });
    expect(plan.goalPlanUpdate).toMatchObject({
      goal_type: 'debt_payoff',
      monthly_commitment_cents: 15_000,
    });
    expect(plan.debtDraft).toMatchObject({
      current_balance_cents: 820_000,
      interest_rate_basis_points: 1_999,
      minimum_payment_cents: 15_000,
      name: 'Debt payoff plan',
      principal_cents: 820_000,
    });
    expect(plan.actionDraft.action_type).toBe('select_debt_method');
  });

  it('requires interest and minimum payment for debt payoff onboarding', () => {
    expect(() =>
      buildGoalPackOnboardingPlan({
        ...baseDraft,
        currentAmount: '',
        debtBalance: '8200',
        debtInterestRate: '',
        debtMinimumPayment: '150',
        priorityType: 'debt_payoff',
        targetAmount: '',
      }),
    ).toThrow('Enter the debt interest rate.');

    expect(() =>
      buildGoalPackOnboardingPlan({
        ...baseDraft,
        currentAmount: '',
        debtBalance: '8200',
        debtInterestRate: '19.99',
        debtMinimumPayment: '',
        priorityType: 'debt_payoff',
        targetAmount: '',
      }),
    ).toThrow('Enter the minimum monthly payment for this debt.');
  });

  it('rejects missing targets for amount-based packs', () => {
    expect(() =>
      buildGoalPackOnboardingPlan({
        ...baseDraft,
        targetAmount: '',
      }),
    ).toThrow('Enter a target amount greater than zero.');
  });
});
