import { centsToDisplay } from '../../../shared/utils/currency';
import { calculateGoalPlan, type GoalPlanDriver } from '../planning/goalPlanningEngine';
import {
  getGoalPackDefinition,
  isGoalType,
} from '../registry/goalPackRegistry';
import type {
  FinancialPriority,
  GoalAction,
  GoalPlanGoal,
  GoalPlanSnapshot,
  GoalType,
} from '../types/goalPacks.types';

export type GoalPackDashboardData = {
  actions: GoalAction[];
  goal: GoalPlanGoal | null;
  priority: FinancialPriority | null;
  snapshot: GoalPlanSnapshot | null;
};

export type GoalPackDashboardMetric = {
  isProjected?: boolean;
  label: string;
  tone: 'good' | 'watch' | 'risk' | 'neutral';
  value: string;
};

export type GoalPackDashboardModel = {
  actionDescription: string;
  actionHref: string | null;
  actionImpact: string;
  actionId: string | null;
  actionLabel: string | null;
  actionTitle: string;
  actionType: string;
  activeGoalId: string;
  amountRemainingCents: number;
  confidenceScore: number;
  currentAmountCents: number;
  drivers: GoalPlanDriver[];
  goalName: string;
  goalType: GoalType;
  lastCalculatedLabel: string;
  metrics: GoalPackDashboardMetric[];
  packDescription: string;
  packLabel: string;
  packRiskCopy: string;
  progressPercent: number;
  recommendations: string[];
  targetAmountCents: number;
};

function dateLabel(value: string | null) {
  if (!value) return 'Needs contribution';

  return new Intl.DateTimeFormat('en-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function metricLabels(goalType: GoalType) {
  if (goalType === 'debt_payoff') {
    return {
      projectedDate: 'Debt-free date',
      requiredMonthly: 'Required payoff',
    };
  }

  if (goalType === 'emergency_fund') {
    return {
      projectedDate: 'Buffer ready date',
      requiredMonthly: 'Required savings',
    };
  }

  return {
    projectedDate: 'Projected date',
    requiredMonthly: 'Required monthly',
  };
}

function inferGoalType(goal: GoalPlanGoal, priority: FinancialPriority | null): GoalType {
  const candidate = goal.goal_type || priority?.top_priority_type || 'custom';
  return isGoalType(candidate) ? candidate : 'custom';
}

function actionDescription(action: GoalAction | undefined, fallback: string) {
  return action?.description?.trim() || fallback;
}

function actionDestination(
  actionType: string,
  goal: GoalPlanGoal,
  goalType: GoalType,
): Pick<GoalPackDashboardModel, 'actionHref' | 'actionLabel'> {
  if (actionType === 'select_debt_method') {
    return { actionHref: '/dashboard/debts', actionLabel: 'Review payoff methods' };
  }

  if (actionType === 'refine_missing_target' || actionType === 'review_spending_leak') {
    return { actionHref: '/dashboard/goals', actionLabel: 'Refine goal plan' };
  }

  if (actionType === 'set_recurring_contribution' || actionType === 'confirm_contribution') {
    if (goalType === 'debt_payoff') {
      const linkedDebtId = goal.linked_debt_id;
      if (linkedDebtId) {
        return {
          actionHref: `/dashboard/transactions?new=1&debt_id=${encodeURIComponent(linkedDebtId)}`,
          actionLabel: 'Add debt payment',
        };
      }

      return { actionHref: '/dashboard/debts', actionLabel: 'Review linked debt' };
    }

    return {
      actionHref: `/dashboard/transactions?new=1&goal_id=${encodeURIComponent(goal.id)}`,
      actionLabel: 'Add contribution',
    };
  }

  return { actionHref: null, actionLabel: null };
}

function snapshotLabel(snapshot: GoalPlanSnapshot | null, goal: GoalPlanGoal) {
  const timestamp = snapshot?.created_at ?? goal.last_plan_calculated_at;
  if (!timestamp) return 'Not recalculated yet';

  return `Updated ${new Intl.DateTimeFormat('en-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp))}`;
}

export function buildGoalPackDashboardModel(
  data: GoalPackDashboardData,
): GoalPackDashboardModel | null {
  if (!data.priority?.active_goal_id || !data.goal) return null;

  const goalType = inferGoalType(data.goal, data.priority);
  const pack = getGoalPackDefinition(goalType);
  const plan = calculateGoalPlan({
    goal: data.goal,
    priority: data.priority,
  });
  const labels = metricLabels(goalType);
  const nextAction = data.actions[0];
  const fallbackAction = plan.actionDraft;
  const actionType = nextAction?.action_type ?? fallbackAction.action_type;
  const confidenceScore = data.goal.confidence_score ?? plan.confidenceScore;
  const destination =
    plan.amountRemainingCents === 0
      ? { actionHref: '/dashboard/goals', actionLabel: 'Review completed priority' }
      : actionDestination(actionType, data.goal, goalType);

  return {
    actionDescription: actionDescription(nextAction, fallbackAction.description ?? ''),
    ...destination,
    actionImpact: nextAction?.impact_label ?? fallbackAction.impact_label ?? 'Keeps the plan current.',
    actionId: nextAction?.id ?? null,
    actionTitle: nextAction?.title ?? fallbackAction.title,
    actionType,
    activeGoalId: data.goal.id,
    amountRemainingCents: plan.amountRemainingCents,
    confidenceScore,
    currentAmountCents: data.goal.current_amount_cents,
    drivers: plan.drivers,
    goalName: data.goal.name,
    goalType,
    lastCalculatedLabel: snapshotLabel(data.snapshot, data.goal),
    metrics: [
      {
        label: 'Remaining gap',
        tone: plan.amountRemainingCents <= 0 ? 'good' : 'neutral',
        value: centsToDisplay(plan.amountRemainingCents, data.priority.currency_code),
      },
      {
        label: labels.projectedDate,
        isProjected: Boolean(plan.projectedCompletionDate),
        tone: plan.projectedCompletionDate ? 'neutral' : 'watch',
        value: dateLabel(plan.projectedCompletionDate),
      },
      {
        label: labels.requiredMonthly,
        isProjected: plan.requiredMonthlyCents !== null,
        tone:
          plan.requiredMonthlyCents !== null &&
          data.goal.monthly_commitment_cents !== null &&
          data.goal.monthly_commitment_cents >= plan.requiredMonthlyCents
            ? 'good'
            : 'watch',
        value:
          plan.requiredMonthlyCents === null
            ? 'Set a date'
            : centsToDisplay(plan.requiredMonthlyCents, data.priority.currency_code),
      },
    ],
    packDescription: pack.description,
    packLabel: pack.label,
    packRiskCopy: pack.riskCopy,
    progressPercent: plan.progressPercent,
    recommendations: plan.recommendations.map((recommendation) => recommendation.title),
    targetAmountCents: data.goal.target_amount_cents,
  };
}
