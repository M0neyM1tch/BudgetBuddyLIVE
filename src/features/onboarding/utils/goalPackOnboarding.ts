import { FEATURE_COLORS } from '../../../shared/constants/featurePalette';
import { displayToCents } from '../../../shared/utils/currency';
import { DEFAULT_DEBT_ICON } from '../../debts/constants/debtIconKeys';
import type { DebtDraft } from '../../debts/types/debts.types';
import type { GoalDraft } from '../../goals/public';
import type {
  FinancialPriorityDraft,
  GoalActionDraft,
  GoalHorizon,
  GoalPlanGoalUpdateDraft,
  GoalType,
} from '../../goalPacks';

export const PRIORITY_GOAL_TYPES = [
  'emergency_fund',
  'debt_payoff',
  'major_purchase',
  'custom',
] as const satisfies readonly GoalType[];

export type PriorityGoalType = (typeof PRIORITY_GOAL_TYPES)[number];

export type GoalPackOnboardingDraft = {
  age: string;
  countryCode: string;
  currentAmount: string;
  debtBalance: string;
  debtInterestRate: string;
  debtMinimumPayment: string;
  goalName: string;
  horizon: GoalHorizon;
  monthlyCommitment: string;
  monthlyEssentialExpenses: string;
  monthlyExpenses: string;
  monthlyIncome: string;
  priorityType: PriorityGoalType;
  regionCode: string;
  targetAmount: string;
  targetDate: string;
  targetMonths: string;
};

export type GoalPackOnboardingPlan = {
  actionDraft: GoalActionDraft;
  debtDraft: DebtDraft | null;
  goalDraft: GoalDraft;
  goalPlanUpdate: GoalPlanGoalUpdateDraft;
  priorityDraft: FinancialPriorityDraft;
};

type DebtOnboardingTarget = {
  debtBalanceCents: number;
  debtInterestRateBasisPoints: number;
  debtMinimumPaymentCents: number;
  targetAmountCents: number;
};

const DEFAULT_CURRENCY_CODE = 'CAD';

function optionalCents(value: string): number | null {
  if (!value.trim()) return null;
  return displayToCents(value);
}

function requiredCents(value: string, message: string): number {
  const cents = optionalCents(value);
  if (!cents || cents <= 0) throw new Error(message);
  return cents;
}

function optionalBasisPoints(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '').replace(/[^0-9.-]/g, '');
  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') return null;

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100);
}

function requiredBasisPoints(value: string, message: string): number {
  const basisPoints = optionalBasisPoints(value);
  if (basisPoints === null) throw new Error(message);
  if (basisPoints < 0 || basisPoints > 10_000) {
    throw new Error('Enter an interest rate between 0% and 100%.');
  }
  return basisPoints;
}

function optionalInteger(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function cleanCode(value: string, fallback: string) {
  return (value.trim() || fallback).toUpperCase();
}

function confidenceScore(draft: GoalPackOnboardingDraft, targetDate: string | null) {
  let score = 45;
  if (optionalCents(draft.monthlyIncome)) score += 10;
  if (optionalCents(draft.monthlyExpenses)) score += 10;
  if (optionalCents(draft.monthlyCommitment) || optionalCents(draft.debtMinimumPayment)) {
    score += 15;
  }
  if (optionalBasisPoints(draft.debtInterestRate) !== null) score += 5;
  if (optionalCents(draft.debtMinimumPayment)) score += 5;
  if (targetDate) score += 10;
  if (optionalInteger(draft.age)) score += 5;
  return Math.min(score, 85);
}

function horizonFromTargetDate(targetDate: string | null): GoalHorizon {
  if (!targetDate) return 'unknown';

  const today = new Date();
  const target = new Date(`${targetDate}T00:00:00`);
  const months =
    (target.getFullYear() - today.getFullYear()) * 12 +
    (target.getMonth() - today.getMonth());

  if (months <= 12) return 'short_term';
  if (months <= 60) return 'medium_term';
  return 'long_term';
}

function priorityName(type: PriorityGoalType, customName: string) {
  const trimmed = customName.trim();
  if (trimmed) return trimmed;

  if (type === 'emergency_fund') return 'Emergency fund';
  if (type === 'debt_payoff') return 'Debt payoff plan';
  if (type === 'major_purchase') return 'Major purchase fund';
  return 'Custom goal';
}

function iconForType(type: PriorityGoalType) {
  if (type === 'emergency_fund') return 'lock';
  if (type === 'debt_payoff') return 'check';
  if (type === 'major_purchase') return 'house';
  return 'target';
}

function targetForDraft(draft: GoalPackOnboardingDraft) {
  if (draft.priorityType === 'emergency_fund') {
    const monthlyEssentialExpensesCents = requiredCents(
      draft.monthlyEssentialExpenses,
      'Enter monthly essential expenses for your emergency fund.',
    );
    const targetMonths = optionalInteger(draft.targetMonths);
    if (!targetMonths || targetMonths < 1) {
      throw new Error('Enter a target buffer of at least 1 month.');
    }

    return {
      targetAmountCents: monthlyEssentialExpensesCents * targetMonths,
      monthlyEssentialExpensesCents,
      targetMonths,
    };
  }

  if (draft.priorityType === 'debt_payoff') {
    const debtBalanceCents = requiredCents(
      draft.debtBalance,
      'Enter the debt balance you want to focus on.',
    );
    const debtInterestRateBasisPoints = requiredBasisPoints(
      draft.debtInterestRate,
      'Enter the debt interest rate. Use 0 if it is an interest-free debt.',
    );
    const debtMinimumPaymentCents = requiredCents(
      draft.debtMinimumPayment,
      'Enter the minimum monthly payment for this debt.',
    );
    return {
      targetAmountCents: debtBalanceCents,
      debtBalanceCents,
      debtInterestRateBasisPoints,
      debtMinimumPaymentCents,
    };
  }

  return {
    targetAmountCents: requiredCents(
      draft.targetAmount,
      'Enter a target amount greater than zero.',
    ),
  };
}

function actionForDraft(draft: GoalPackOnboardingDraft): GoalActionDraft {
  if (draft.priorityType === 'debt_payoff') {
    return {
      action_type: 'select_debt_method',
      title: 'Choose a payoff method',
      description: 'Compare avalanche and snowball as scenarios before locking in your first payoff plan.',
      impact_label: 'Turns the debt goal into a focused payoff order.',
      source: 'onboarding',
    };
  }

  if (draft.priorityType === 'custom') {
    return {
      action_type: 'refine_missing_target',
      title: 'Make the goal more specific',
      description: 'Add one concrete detail that makes this goal easier to measure.',
      impact_label: 'Sharper goals create better next actions.',
      source: 'onboarding',
    };
  }

  return {
    action_type: 'set_recurring_contribution',
    title: 'Set the first recurring contribution',
    description: 'Pick a realistic transfer amount so BudgetBuddy can track plan momentum.',
    impact_label: 'Creates the first repeatable progress step.',
    source: 'onboarding',
  };
}

export function buildGoalPackOnboardingPlan(
  draft: GoalPackOnboardingDraft,
): GoalPackOnboardingPlan {
  const target = targetForDraft(draft);
  const currentAmountCents = optionalCents(draft.currentAmount) ?? 0;
  if (currentAmountCents > target.targetAmountCents) {
    throw new Error('Current progress cannot be greater than the target amount.');
  }

  const debtTarget: DebtOnboardingTarget | null =
    draft.priorityType === 'debt_payoff' && 'debtBalanceCents' in target
      ? (target as DebtOnboardingTarget)
      : null;
  const monthlyCommitmentCents = debtTarget
    ? debtTarget.debtMinimumPaymentCents
    : (optionalCents(draft.monthlyCommitment) ?? null);
  const targetDate = draft.targetDate || null;
  const goalName = priorityName(draft.priorityType, draft.goalName);
  const debtDraft: DebtDraft | null =
    debtTarget
      ? {
          color: FEATURE_COLORS[0],
          current_balance_cents: debtTarget.debtBalanceCents,
          debt_type: 'credit_card',
          icon: DEFAULT_DEBT_ICON,
          interest_rate_basis_points: debtTarget.debtInterestRateBasisPoints,
          minimum_payment_cents: debtTarget.debtMinimumPaymentCents,
          name: goalName,
          payment_frequency: 'monthly',
          principal_cents: debtTarget.debtBalanceCents,
          start_date: null,
        }
      : null;

  return {
    goalDraft: {
      color: FEATURE_COLORS[0],
      icon: iconForType(draft.priorityType),
      name: goalName,
      starting_balance_cents: draft.priorityType === 'debt_payoff' ? 0 : currentAmountCents,
      target_amount_cents: target.targetAmountCents,
      target_date: targetDate,
    },
    priorityDraft: {
      country_code: null,
      currency_code: DEFAULT_CURRENCY_CODE,
      horizon: horizonFromTargetDate(targetDate),
      monthly_expenses_cents: optionalCents(draft.monthlyExpenses),
      monthly_income_cents: optionalCents(draft.monthlyIncome),
      region_code: null,
      top_priority_type: draft.priorityType,
    },
    goalPlanUpdate: {
      confidence_score: confidenceScore(draft, targetDate),
      goal_type: draft.priorityType,
      last_plan_calculated_at: new Date().toISOString(),
      monthly_commitment_cents: monthlyCommitmentCents,
      plan_status: 'active',
      planning_rules: {
        onboarding: {
          age: optionalInteger(draft.age),
          countryCode: cleanCode(draft.countryCode, 'CA'),
          currencyCode: DEFAULT_CURRENCY_CODE,
          debtBalanceCents: 'debtBalanceCents' in target ? target.debtBalanceCents : null,
          debtId: null,
          debtInterestRateBasisPoints:
            'debtInterestRateBasisPoints' in target
              ? target.debtInterestRateBasisPoints
              : null,
          debtMinimumPaymentCents:
            'debtMinimumPaymentCents' in target ? target.debtMinimumPaymentCents : null,
          monthlyEssentialExpensesCents:
            'monthlyEssentialExpensesCents' in target
              ? target.monthlyEssentialExpensesCents
              : null,
          priorityType: draft.priorityType,
          targetMonths: 'targetMonths' in target ? target.targetMonths : null,
        },
        source: 'priority_onboarding',
        version: 1,
      },
      priority_rank: 1,
    },
    actionDraft: actionForDraft(draft),
    debtDraft,
  };
}
