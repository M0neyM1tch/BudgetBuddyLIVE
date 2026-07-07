import type { Json } from '../../../types/database.types';
import type {
  FinancialPriority,
  GoalActionRuleKey,
  GoalPlanGoal,
  GoalType,
} from '../types/goalPacks.types';
import type {
  GoalActionDraft,
  GoalPlanGoalUpdateDraft,
  GoalPlanSnapshotDraft,
} from '../schemas/goalPacks.schema';

export type GoalPlanDriver = {
  key: string;
  label: string;
  tone: 'good' | 'watch' | 'risk' | 'neutral';
  value: string;
};

export type GoalPlanRecommendation = {
  action: GoalActionRuleKey;
  body: string;
  impactLabel: string;
  title: string;
};

export type GoalPlanResult = {
  actionDraft: GoalActionDraft;
  amountRemainingCents: number;
  confidenceScore: number;
  currentMonthlyCapacityCents: number;
  drivers: GoalPlanDriver[];
  goalPlanUpdate: GoalPlanGoalUpdateDraft;
  progressPercent: number;
  projectedCompletionDate: string | null;
  recommendations: GoalPlanRecommendation[];
  requiredMonthlyCents: number | null;
  snapshotDraft: GoalPlanSnapshotDraft;
};

export type GoalPlanningInput = {
  currentDate?: string;
  goal: GoalPlanGoal;
  priority: FinancialPriority | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayIsoDate() {
  return formatIsoDate(new Date());
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addCalendarMonths(value: string, months: number) {
  const date = parseIsoDate(value);
  date.setMonth(date.getMonth() + months);
  return date;
}

function differenceInMonths(from: string, to: string) {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}

function moneyLabel(cents: number) {
  return new Intl.NumberFormat('en-CA', {
    currency: 'CAD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(cents / 100);
}

function getMonthlyCapacity(priority: FinancialPriority | null) {
  const income = priority?.monthly_income_cents ?? 0;
  const expenses = priority?.monthly_expenses_cents ?? 0;
  return Math.max(0, income - expenses);
}

function getRequiredMonthlyCents(goal: GoalPlanGoal, amountRemainingCents: number, currentDate: string) {
  if (amountRemainingCents <= 0) return 0;
  if (!goal.target_date) return null;

  const monthsUntilTarget = Math.max(
    1,
    differenceInMonths(currentDate, goal.target_date),
  );

  return Math.ceil(amountRemainingCents / monthsUntilTarget);
}

type DebtPlanningRules = {
  interestRateBasisPoints: number;
  minimumPaymentCents: number;
};

function isRecord(value: Json | null | undefined): value is Record<string, Json | undefined> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberRule(value: Json | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function debtPlanningRules(goal: GoalPlanGoal): DebtPlanningRules | null {
  if (!isRecord(goal.planning_rules)) return null;
  const onboarding = goal.planning_rules.onboarding;
  if (!isRecord(onboarding)) return null;

  const interestRateBasisPoints = numberRule(onboarding.debtInterestRateBasisPoints);
  const minimumPaymentCents = numberRule(onboarding.debtMinimumPaymentCents);

  if (interestRateBasisPoints === null || minimumPaymentCents === null) return null;

  return {
    interestRateBasisPoints,
    minimumPaymentCents,
  };
}

function requiredDebtMonthlyCents(
  amountRemainingCents: number,
  interestRateBasisPoints: number,
  monthsUntilTarget: number,
) {
  const monthlyRate = interestRateBasisPoints / 10_000 / 12;
  if (monthlyRate <= 0) return Math.ceil(amountRemainingCents / monthsUntilTarget);

  return Math.ceil(
    (amountRemainingCents * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -monthsUntilTarget)),
  );
}

function getDebtRequiredMonthlyCents(
  goal: GoalPlanGoal,
  amountRemainingCents: number,
  currentDate: string,
  rules: DebtPlanningRules | null,
) {
  if (!rules) return getRequiredMonthlyCents(goal, amountRemainingCents, currentDate);
  if (amountRemainingCents <= 0) return 0;
  if (!goal.target_date) return null;

  const monthsUntilTarget = Math.max(
    1,
    differenceInMonths(currentDate, goal.target_date),
  );

  return requiredDebtMonthlyCents(
    amountRemainingCents,
    rules.interestRateBasisPoints,
    monthsUntilTarget,
  );
}

function getProjectedCompletionDate(
  amountRemainingCents: number,
  monthlyCommitmentCents: number,
  currentDate: string,
) {
  if (amountRemainingCents <= 0) return currentDate;
  if (monthlyCommitmentCents <= 0) return null;

  const monthsToGoal = Math.ceil(amountRemainingCents / monthlyCommitmentCents);
  return formatIsoDate(addCalendarMonths(currentDate, monthsToGoal));
}

function getProjectedDebtCompletionDate(
  amountRemainingCents: number,
  monthlyCommitmentCents: number,
  currentDate: string,
  rules: DebtPlanningRules | null,
) {
  if (!rules) {
    return getProjectedCompletionDate(amountRemainingCents, monthlyCommitmentCents, currentDate);
  }

  if (amountRemainingCents <= 0) return currentDate;
  if (monthlyCommitmentCents <= 0) return null;

  const monthlyRate = rules.interestRateBasisPoints / 10_000 / 12;
  let balanceCents = amountRemainingCents;

  for (let month = 1; month <= 600; month += 1) {
    const interestCents = Math.round(balanceCents * monthlyRate);
    const nextBalanceCents = balanceCents + interestCents - monthlyCommitmentCents;

    if (nextBalanceCents >= balanceCents && balanceCents > 0) return null;
    if (nextBalanceCents <= 0) return formatIsoDate(addCalendarMonths(currentDate, month));

    balanceCents = nextBalanceCents;
  }

  return null;
}

function inferGoalType(goal: GoalPlanGoal, priority: FinancialPriority | null): GoalType {
  return (goal.goal_type || priority?.top_priority_type || 'custom') as GoalType;
}

function getMonthlyCommitment(goal: GoalPlanGoal, priority: FinancialPriority | null) {
  if (goal.monthly_commitment_cents !== null && goal.monthly_commitment_cents !== undefined) {
    return goal.monthly_commitment_cents;
  }

  return getMonthlyCapacity(priority);
}

function confidenceScore(input: {
  amountRemainingCents: number;
  currentMonthlyCapacityCents: number;
  goal: GoalPlanGoal;
  monthlyCommitmentCents: number;
  projectedCompletionDate: string | null;
  requiredMonthlyCents: number | null;
}) {
  if (input.amountRemainingCents <= 0) return 100;

  let score = 40;
  if (input.monthlyCommitmentCents > 0) score += 20;
  if (input.currentMonthlyCapacityCents >= input.monthlyCommitmentCents && input.monthlyCommitmentCents > 0) {
    score += 15;
  }
  if (input.requiredMonthlyCents !== null) {
    score += input.monthlyCommitmentCents >= input.requiredMonthlyCents ? 20 : -10;
  }
  if (input.projectedCompletionDate && input.goal.target_date) {
    score += input.projectedCompletionDate <= input.goal.target_date ? 10 : -10;
  }
  if (!input.goal.target_date) score -= 5;

  return clamp(score, 10, 95);
}

function buildDrivers(input: {
  amountRemainingCents: number;
  currentMonthlyCapacityCents: number;
  monthlyCommitmentCents: number;
  projectedCompletionDate: string | null;
  requiredMonthlyCents: number | null;
}) {
  const drivers: GoalPlanDriver[] = [
    {
      key: 'remaining_gap',
      label: 'Remaining gap',
      tone: input.amountRemainingCents <= 0 ? 'good' : 'neutral',
      value: moneyLabel(input.amountRemainingCents),
    },
    {
      key: 'monthly_capacity',
      label: 'Estimated monthly capacity',
      tone:
        input.currentMonthlyCapacityCents >= input.monthlyCommitmentCents
          ? 'good'
          : 'watch',
      value: moneyLabel(input.currentMonthlyCapacityCents),
    },
  ];

  if (input.requiredMonthlyCents !== null) {
    drivers.push({
      key: 'required_monthly',
      label: 'Required monthly',
      tone:
        input.monthlyCommitmentCents >= input.requiredMonthlyCents
          ? 'good'
          : 'risk',
      value: moneyLabel(input.requiredMonthlyCents),
    });
  }

  drivers.push({
    key: 'projected_date',
    label: 'Projected date',
    tone: input.projectedCompletionDate ? 'neutral' : 'watch',
    value: input.projectedCompletionDate ?? 'Needs contribution',
  });

  return drivers;
}

function buildRecommendations(input: {
  amountRemainingCents: number;
  goalType: GoalType;
  monthlyCommitmentCents: number;
  requiredMonthlyCents: number | null;
}) {
  const recommendations: GoalPlanRecommendation[] = [];

  if (input.amountRemainingCents <= 0) {
    recommendations.push({
      action: 'confirm_contribution',
      body: 'Mark the goal complete or choose the next priority.',
      impactLabel: 'Keeps the plan current.',
      title: 'Close out this goal',
    });
    return recommendations;
  }

  if (input.monthlyCommitmentCents <= 0) {
    recommendations.push({
      action: 'set_recurring_contribution',
      body: 'Add a realistic monthly contribution so BudgetBuddy can project a completion date.',
      impactLabel: 'Creates a visible target date.',
      title: 'Set a monthly contribution',
    });
  }

  if (
    input.requiredMonthlyCents !== null &&
    input.monthlyCommitmentCents > 0 &&
    input.monthlyCommitmentCents < input.requiredMonthlyCents
  ) {
    recommendations.push({
      action: 'review_spending_leak',
      body: `Model ${moneyLabel(input.requiredMonthlyCents - input.monthlyCommitmentCents)} per month in spending changes or compare a later target date.`,
      impactLabel: 'Improves target-date confidence.',
      title: 'Close the monthly gap',
    });
  }

  if (input.goalType === 'debt_payoff') {
    recommendations.push({
      action: 'select_debt_method',
      body: 'Compare avalanche and snowball as common payoff scenarios before planning extra payments.',
      impactLabel: 'Turns debt payoff into a clearer scenario.',
      title: 'Compare payoff methods',
    });
  }

  if (input.goalType === 'custom') {
    recommendations.push({
      action: 'refine_missing_target',
      body: 'Add one more detail to make this custom goal easier to measure.',
      impactLabel: 'Makes future plan prompts sharper.',
      title: 'Refine this goal',
    });
  }

  return recommendations.slice(0, 3);
}

function actionFromRecommendation(recommendation: GoalPlanRecommendation): GoalActionDraft {
  return {
    action_type: recommendation.action,
    description: recommendation.body,
    impact_label: recommendation.impactLabel,
    source: 'system',
    title: recommendation.title,
  };
}

function serializePlanningRules(input: {
  amountRemainingCents: number;
  currentDate: string;
  currentMonthlyCapacityCents: number;
  monthlyCommitmentCents: number;
  projectedCompletionDate: string | null;
  requiredMonthlyCents: number | null;
}) {
  return {
    engine: {
      amountRemainingCents: input.amountRemainingCents,
      currentDate: input.currentDate,
      currentMonthlyCapacityCents: input.currentMonthlyCapacityCents,
      monthlyCommitmentCents: input.monthlyCommitmentCents,
      projectedCompletionDate: input.projectedCompletionDate,
      requiredMonthlyCents: input.requiredMonthlyCents,
      version: 1,
    },
    source: 'planning_engine',
  } satisfies Record<string, Json | undefined>;
}

export function calculateGoalPlan({
  currentDate = todayIsoDate(),
  goal,
  priority,
}: GoalPlanningInput): GoalPlanResult {
  const goalType = inferGoalType(goal, priority);
  const debtRules = goalType === 'debt_payoff' ? debtPlanningRules(goal) : null;
  const amountRemainingCents = Math.max(0, goal.target_amount_cents - goal.current_amount_cents);
  const progressPercent =
    goal.target_amount_cents > 0
      ? clamp((goal.current_amount_cents / goal.target_amount_cents) * 100, 0, 100)
      : 0;
  const currentMonthlyCapacityCents = getMonthlyCapacity(priority);
  const monthlyCommitmentCents = getMonthlyCommitment(goal, priority);
  const requiredMonthlyCents =
    goalType === 'debt_payoff'
      ? getDebtRequiredMonthlyCents(goal, amountRemainingCents, currentDate, debtRules)
      : getRequiredMonthlyCents(goal, amountRemainingCents, currentDate);
  const projectedCompletionDate =
    goalType === 'debt_payoff'
      ? getProjectedDebtCompletionDate(
          amountRemainingCents,
          monthlyCommitmentCents,
          currentDate,
          debtRules,
        )
      : getProjectedCompletionDate(
          amountRemainingCents,
          monthlyCommitmentCents,
          currentDate,
        );
  const confidence = confidenceScore({
    amountRemainingCents,
    currentMonthlyCapacityCents,
    goal,
    monthlyCommitmentCents,
    projectedCompletionDate,
    requiredMonthlyCents,
  });
  const drivers = buildDrivers({
    amountRemainingCents,
    currentMonthlyCapacityCents,
    monthlyCommitmentCents,
    projectedCompletionDate,
    requiredMonthlyCents,
  });
  const recommendations = buildRecommendations({
    amountRemainingCents,
    goalType,
    monthlyCommitmentCents,
    requiredMonthlyCents,
  });
  const fallbackRecommendation: GoalPlanRecommendation = {
    action: 'confirm_contribution',
    body: `Confirm the next ${moneyLabel(monthlyCommitmentCents)} contribution to keep the plan moving.`,
    impactLabel: 'Keeps the projected date reliable.',
    title: 'Confirm next contribution',
  };
  const nextRecommendation = recommendations[0] ?? fallbackRecommendation;
  const planningRules = serializePlanningRules({
    amountRemainingCents,
    currentDate,
    currentMonthlyCapacityCents,
    monthlyCommitmentCents,
    projectedCompletionDate,
    requiredMonthlyCents,
  });

  return {
    actionDraft: actionFromRecommendation(nextRecommendation),
    amountRemainingCents,
    confidenceScore: confidence,
    currentMonthlyCapacityCents,
    drivers,
    goalPlanUpdate: {
      confidence_score: confidence,
      goal_type: goalType,
      last_plan_calculated_at: parseIsoDate(currentDate).toISOString(),
      monthly_commitment_cents: monthlyCommitmentCents,
      plan_status: amountRemainingCents <= 0 ? 'completed' : 'active',
      planning_rules: planningRules,
      priority_rank: goal.priority_rank ?? 1,
    },
    progressPercent,
    projectedCompletionDate,
    recommendations,
    requiredMonthlyCents,
    snapshotDraft: {
      confidence_score: confidence,
      current_monthly_capacity_cents: currentMonthlyCapacityCents,
      drivers,
      goal_id: goal.id,
      progress_percent: Number(progressPercent.toFixed(2)),
      projected_completion_date: projectedCompletionDate,
      recommendations,
      required_monthly_cents: requiredMonthlyCents,
      snapshot_kind: 'recalculation',
    },
  };
}
