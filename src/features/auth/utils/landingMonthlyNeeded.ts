export type LandingPriorityKind = 'custom' | 'debt_payoff' | 'emergency_fund' | 'major_purchase';

export type LandingMonthlyNeededInput = {
  currentAmount: number;
  currentDate?: string;
  plannedMonthly: number;
  priorityKind: LandingPriorityKind;
  targetAmount: number;
  targetDate: string;
};

export type LandingMonthlyNeededResult = {
  amountRemaining: number;
  daysUntilTarget: number;
  monthlyGap: number;
  monthlyNeeded: number;
  monthsUntilTarget: number;
  nextAction: string;
  progressPct: number;
  status: 'ahead' | 'behind' | 'complete' | 'on_track';
};

const AVERAGE_MONTH_DAYS = 30.4375;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseLocalDate(value: string | undefined): Date | null {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function daysBetween(currentDate: string | undefined, targetDate: string): number {
  const current = parseLocalDate(currentDate) ?? new Date();
  const target = parseLocalDate(targetDate);
  if (!target) return 0;

  const currentMidnight = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
  );

  return Math.max(0, Math.ceil((target.getTime() - currentMidnight.getTime()) / MS_PER_DAY));
}

function nextActionFor(status: LandingMonthlyNeededResult['status']): string {
  if (status === 'complete') {
    return 'Choose the next priority and keep the momentum visible.';
  }

  if (status === 'ahead') {
    return 'Turn the planned monthly amount into a recurring action.';
  }

  if (status === 'on_track') {
    return 'Track the monthly amount and check progress as your cash flow changes.';
  }

  return 'Close the monthly gap or compare a later target date.';
}

export function calculateLandingMonthlyNeeded(
  input: LandingMonthlyNeededInput,
): LandingMonthlyNeededResult {
  const targetAmount = Math.max(0, Math.round(input.targetAmount));
  const currentAmount = Math.max(0, Math.round(input.currentAmount));
  const plannedMonthly = Math.max(0, Math.round(input.plannedMonthly));
  const amountRemaining = Math.max(targetAmount - currentAmount, 0);
  const daysUntilTarget = daysBetween(input.currentDate, input.targetDate);
  const monthsUntilTarget = Math.max(1, Math.ceil(daysUntilTarget / AVERAGE_MONTH_DAYS));
  const monthlyNeeded = amountRemaining === 0 ? 0 : Math.ceil(amountRemaining / monthsUntilTarget);
  const monthlyGap = monthlyNeeded - plannedMonthly;
  const progressPct =
    targetAmount <= 0 ? 0 : Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
  const status =
    amountRemaining === 0
      ? 'complete'
      : monthlyGap < 0
        ? 'ahead'
        : monthlyGap === 0
          ? 'on_track'
          : 'behind';

  return {
    amountRemaining,
    daysUntilTarget,
    monthlyGap,
    monthlyNeeded,
    monthsUntilTarget,
    nextAction: nextActionFor(status),
    progressPct,
    status,
  };
}
