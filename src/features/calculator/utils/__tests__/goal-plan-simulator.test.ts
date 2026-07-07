import { describe, expect, it } from 'vitest';
import type {
  FinancialPriority,
  GoalPackDefinition,
  GoalPlanGoal,
} from '../../../goalPacks/types/goalPacks.types';
import type { CalculatorPrefillData } from '../../types/calculator.types';
import {
  buildGoalPlanSimulatorCategories,
  buildGoalPlanSimulatorResult,
  defaultGoalPlanSimulatorScenario,
} from '../goal-plan-simulator.utils';

const priority = {
  currency_code: 'CAD',
  monthly_expenses_cents: 2_000_00,
  monthly_income_cents: 4_000_00,
  top_priority_type: 'major_purchase',
} as FinancialPriority;

const goal = {
  current_amount_cents: 2_000_00,
  goal_type: 'major_purchase',
  id: 'goal-1',
  monthly_commitment_cents: 500_00,
  name: 'House fund',
  target_amount_cents: 10_000_00,
  target_date: '2027-01-01',
} as GoalPlanGoal;

const pack = {
  calculators: ['contributionChange', 'dateChange', 'targetChange', 'categoryCutImpact'],
} as GoalPackDefinition;

const data: CalculatorPrefillData = {
  goals: [],
  historyRange: {
    from: '2026-01-01',
    to: '2026-02-28',
  },
  recurringRules: [],
  transactions: [
    {
      amountCents: 60_000,
      category: 'food',
      date: '2026-01-10',
      description: 'Groceries',
      goalId: null,
      id: 'transaction-1',
      kind: 'expense',
    },
    {
      amountCents: 40_000,
      category: 'food',
      date: '2026-02-10',
      description: 'Groceries',
      goalId: null,
      id: 'transaction-2',
      kind: 'expense',
    },
    {
      amountCents: 300_000,
      category: 'pay',
      date: '2026-02-15',
      description: 'Pay',
      goalId: null,
      id: 'transaction-3',
      kind: 'income',
    },
  ],
};

describe('goal plan simulator', () => {
  it('moves the projected date sooner when monthly contribution increases', () => {
    const scenario = {
      ...defaultGoalPlanSimulatorScenario(goal, priority),
      monthlyContributionCents: 1_000_00,
    };

    const result = buildGoalPlanSimulatorResult({
      currentDate: new Date('2026-01-01T00:00:00'),
      data,
      goal,
      pack,
      priority,
      scenario,
    });

    expect(result.baseProjectedDate).toBe('2027-05-01');
    expect(result.scenarioProjectedDate).toBe('2026-09-01');
    expect(result.dateDeltaMonths).toBe(-8);
  });

  it('adds category-cut scenarios to monthly funding', () => {
    const categories = buildGoalPlanSimulatorCategories(data);
    const scenario = {
      ...defaultGoalPlanSimulatorScenario(goal, priority),
      categoryCutPct: 20,
      selectedCategory: 'food',
    };

    const result = buildGoalPlanSimulatorResult({
      currentDate: new Date('2026-01-01T00:00:00'),
      data,
      goal,
      pack,
      priority,
      scenario,
    });

    expect(categories[0]).toMatchObject({
      category: 'food',
      label: 'Food',
      monthlyAverageCents: 50_000,
    });
    expect(result.categoryCutMonthlyCents).toBe(10_000);
    expect(result.scenarioMonthlyContributionCents).toBe(60_000);
  });

  it('builds debt payoff comparisons when the pack supports debt simulators', () => {
    const debtPack = {
      calculators: ['debtPayoffComparison'],
    } as GoalPackDefinition;
    const scenario = {
      ...defaultGoalPlanSimulatorScenario(goal, priority),
      monthlyContributionCents: 300_00,
    };

    const result = buildGoalPlanSimulatorResult({
      activeDebts: [
        {
          id: 'card',
          interestRateBasisPoints: 1_990,
          minimumPaymentCents: 75_00,
          name: 'Credit card',
          startingBalanceCents: 5_000_00,
        },
        {
          id: 'loan',
          interestRateBasisPoints: 700,
          minimumPaymentCents: 100_00,
          name: 'Loan',
          startingBalanceCents: 2_000_00,
        },
      ],
      currentDate: new Date('2026-01-01T00:00:00'),
      data,
      goal,
      pack: debtPack,
      priority,
      scenario,
    });

    expect(result.debtComparison).not.toBeNull();
    expect(result.debtComparison?.avalanche.orderedDebts[0]?.id).toBe('card');
    expect(result.debtComparison?.snowball.orderedDebts[0]?.id).toBe('loan');
  });
});
