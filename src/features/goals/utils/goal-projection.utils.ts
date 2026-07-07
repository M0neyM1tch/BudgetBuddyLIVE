import { addMonths } from '../../../shared/utils/dates';
import type { Transaction } from '../../transactions';
import type { GoalWithProgress } from '../types/goals.types';

export type GoalProjection = {
  estimatedFinishDate: string | null;
  monthsRemaining: number | null;
  remainingCents: number;
  requiredMonthlyCents: number | null;
  timeSavedMonths: number | null;
};

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function trailingMonthlyGoalContribution(
  goalId: string,
  transactions: Transaction[],
): number {
  // This uses the raw Transaction shape, where the date column is transaction_date.
  // If this ever accepts CalculatorTransaction instead, update this access to date.
  const goalTransactions = transactions.filter(
    (transaction) => transaction.goal_id === goalId && transaction.kind !== 'income',
  );
  if (goalTransactions.length === 0) return 0;

  const months = new Set(goalTransactions.map((transaction) => transaction.transaction_date.slice(0, 7)));
  const total = goalTransactions.reduce((sum, transaction) => sum + transaction.amount_cents, 0);

  return Math.round(total / Math.max(months.size, 1));
}

export function projectGoalTimeline(
  goal: GoalWithProgress,
  monthlyContributionCents: number,
  increaseScenarioCents = 10_000,
): GoalProjection {
  const remainingCents = Math.max(0, goal.target_amount_cents - goal.current_amount_cents);
  const targetDate = goal.target_date ? new Date(`${goal.target_date}T00:00:00`) : null;
  const today = new Date();

  if (remainingCents === 0) {
    return {
      estimatedFinishDate: toISODate(today),
      monthsRemaining: 0,
      remainingCents,
      requiredMonthlyCents: 0,
      timeSavedMonths: 0,
    };
  }

  const monthsRemaining =
    monthlyContributionCents > 0 ? Math.ceil(remainingCents / monthlyContributionCents) : null;
  const fasterMonths =
    monthlyContributionCents + increaseScenarioCents > 0
      ? Math.ceil(remainingCents / (monthlyContributionCents + increaseScenarioCents))
      : null;
  const requiredMonthlyCents =
    targetDate && targetDate > today
      ? Math.ceil(
          remainingCents /
            Math.max(
              1,
              (targetDate.getFullYear() - today.getFullYear()) * 12 +
                targetDate.getMonth() -
                today.getMonth(),
            ),
        )
      : null;

  return {
    estimatedFinishDate:
      monthsRemaining === null ? null : toISODate(addMonths(today, monthsRemaining)),
    monthsRemaining,
    remainingCents,
    requiredMonthlyCents,
    timeSavedMonths:
      monthsRemaining !== null && fasterMonths !== null
        ? Math.max(0, monthsRemaining - fasterMonths)
        : null,
  };
}
