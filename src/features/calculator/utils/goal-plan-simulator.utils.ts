import { centsToDisplay } from '../../../shared/utils/currency';
import {
  calculatePayoffPlan,
  type PayoffDebtRow,
  type PayoffPlanResult,
} from '../../debts/utils/debt-payoff.utils';
import { getCategoryLabel } from '../../transactions/constants/categories';
import type {
  FinancialPriority,
  GoalCalculatorKey,
  GoalPackDefinition,
  GoalPlanGoal,
} from '../../goalPacks/types/goalPacks.types';
import type { CalculatorPrefillData } from '../types/calculator.types';
import { addMonths, clamp, monthDiff } from './calculator.utils';

const AVERAGE_MONTH_DAYS = 30.4375;

type ScenarioTone = 'good' | 'neutral' | 'warn';

export type GoalPlanSimulatorScenario = {
  categoryCutPct: number;
  oneTimeBoostCents: number;
  selectedCategory: string | null;
  surplusAllocationPct: number;
  targetAmountCents: number;
  targetDate: string | null;
  monthlyContributionCents: number;
};

export type GoalPlanSimulatorCategory = {
  category: string;
  label: string;
  monthlyAverageCents: number;
};

export type GoalPlanSimulatorMetric = {
  detail?: string;
  label: string;
  tone: ScenarioTone;
  value: string;
};

export type GoalPlanSimulatorResult = {
  amountRemainingCents: number;
  baseMonthlyContributionCents: number;
  baseProjectedDate: string | null;
  categoryCutMonthlyCents: number;
  dateDeltaMonths: number | null;
  dateMovementLabel: string;
  debtComparison: GoalPlanDebtComparison | null;
  monthlyCapacityCents: number;
  monthlyLiftCents: number;
  requiredMonthlyCents: number | null;
  scenarioMonthlyContributionCents: number;
  scenarioProjectedDate: string | null;
  status: 'funded' | 'needs_contribution' | 'needs_target' | 'projected';
  surplusAllocatedCents: number;
};

export type GoalPlanDebtComparison = {
  avalanche: PayoffPlanResult;
  snowball: PayoffPlanResult;
  interestDeltaCents: number;
  fasterStrategy: 'avalanche' | 'snowball' | 'tie';
  monthsDelta: number | null;
};

export type BuildGoalPlanSimulatorInput = {
  activeDebts?: PayoffDebtRow[];
  currentDate?: Date;
  data: CalculatorPrefillData;
  goal: GoalPlanGoal;
  pack: GoalPackDefinition;
  priority: FinancialPriority;
  scenario: GoalPlanSimulatorScenario;
};

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getCurrentDate(value?: Date) {
  return toISODate(value ?? new Date());
}

function formatDate(value: string | null) {
  if (!value) return 'Needs contribution';

  return new Intl.DateTimeFormat('en-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function monthsBetween(from: string, to: string) {
  return monthDiff(parseLocalDate(from), parseLocalDate(to));
}

function monthlyCapacity(priority: FinancialPriority) {
  return Math.max(0, (priority.monthly_income_cents ?? 0) - (priority.monthly_expenses_cents ?? 0));
}

export function baseGoalMonthlyContribution(
  goal: GoalPlanGoal,
  priority: FinancialPriority,
) {
  if (goal.monthly_commitment_cents && goal.monthly_commitment_cents > 0) {
    return goal.monthly_commitment_cents;
  }

  return monthlyCapacity(priority);
}

function requiredMonthly(
  remainingCents: number,
  targetDate: string | null,
  currentDate: string,
) {
  if (remainingCents <= 0) return 0;
  if (!targetDate) return null;

  const months = Math.max(1, monthsBetween(currentDate, targetDate));
  return Math.ceil(remainingCents / months);
}

function projectedDate(
  remainingCents: number,
  monthlyContributionCents: number,
  currentDate: string,
) {
  if (remainingCents <= 0) return currentDate;
  if (monthlyContributionCents <= 0) return null;

  const months = Math.ceil(remainingCents / monthlyContributionCents);
  return toISODate(addMonths(parseLocalDate(currentDate), months));
}

function rangeMonthCount(data: CalculatorPrefillData) {
  const from = parseLocalDate(data.historyRange.from);
  const to = parseLocalDate(data.historyRange.to);
  return Math.max(1, monthDiff(from, to) + 1);
}

export function buildGoalPlanSimulatorCategories(
  data: CalculatorPrefillData,
): GoalPlanSimulatorCategory[] {
  const monthCount = rangeMonthCount(data);
  const totals = new Map<string, number>();

  for (const transaction of data.transactions) {
    if (transaction.kind !== 'expense') continue;
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amountCents);
  }

  return [...totals.entries()]
    .map(([category, totalCents]) => ({
      category,
      label: getCategoryLabel(category),
      monthlyAverageCents: Math.round(totalCents / monthCount),
    }))
    .filter((category) => category.monthlyAverageCents > 0)
    .sort((a, b) => b.monthlyAverageCents - a.monthlyAverageCents);
}

function categoryCutMonthlyCents(
  categories: GoalPlanSimulatorCategory[],
  selectedCategory: string | null,
  categoryCutPct: number,
) {
  const category = categories.find((candidate) => candidate.category === selectedCategory);
  if (!category) return 0;

  return Math.round(category.monthlyAverageCents * (clamp(categoryCutPct, 0, 100) / 100));
}

function surplusAllocatedCents(
  monthlyCapacityCents: number,
  monthlyContributionCents: number,
  surplusAllocationPct: number,
) {
  const unallocatedCapacity = Math.max(0, monthlyCapacityCents - monthlyContributionCents);
  return Math.round(unallocatedCapacity * (clamp(surplusAllocationPct, 0, 100) / 100));
}

function dateMovementLabel(deltaMonths: number | null) {
  if (deltaMonths === null) return 'Set a monthly contribution';
  if (deltaMonths === 0) return 'No date change';
  if (deltaMonths < 0) return `${Math.abs(deltaMonths)} mo sooner`;
  return `${deltaMonths} mo later`;
}

function debtComparison(
  calculators: readonly GoalCalculatorKey[],
  activeDebts: PayoffDebtRow[] | undefined,
  extraMonthlyPaymentCents: number,
): GoalPlanDebtComparison | null {
  if (!calculators.includes('debtPayoffComparison')) return null;
  if (!activeDebts || activeDebts.length === 0) return null;

  const avalanche = calculatePayoffPlan(activeDebts, 'avalanche', extraMonthlyPaymentCents);
  const snowball = calculatePayoffPlan(activeDebts, 'snowball', extraMonthlyPaymentCents);
  const avalancheMonths = avalanche.monthsToDebtFree;
  const snowballMonths = snowball.monthsToDebtFree;
  let fasterStrategy: GoalPlanDebtComparison['fasterStrategy'] = 'tie';
  let monthsDelta: number | null = null;

  if (avalancheMonths !== null && snowballMonths !== null) {
    monthsDelta = Math.abs(avalancheMonths - snowballMonths);
    if (avalancheMonths < snowballMonths) fasterStrategy = 'avalanche';
    if (snowballMonths < avalancheMonths) fasterStrategy = 'snowball';
  }

  return {
    avalanche,
    snowball,
    fasterStrategy,
    interestDeltaCents: Math.abs(avalanche.totalInterestCents - snowball.totalInterestCents),
    monthsDelta,
  };
}

export function defaultGoalPlanSimulatorScenario(
  goal: GoalPlanGoal,
  priority: FinancialPriority,
): GoalPlanSimulatorScenario {
  return {
    categoryCutPct: 10,
    oneTimeBoostCents: 0,
    selectedCategory: null,
    surplusAllocationPct: 0,
    targetAmountCents: goal.target_amount_cents,
    targetDate: goal.target_date,
    monthlyContributionCents: baseGoalMonthlyContribution(goal, priority),
  };
}

export function buildGoalPlanSimulatorResult({
  activeDebts,
  currentDate,
  data,
  goal,
  pack,
  priority,
  scenario,
}: BuildGoalPlanSimulatorInput): GoalPlanSimulatorResult {
  const today = getCurrentDate(currentDate);
  const categories = buildGoalPlanSimulatorCategories(data);
  const capacityCents = monthlyCapacity(priority);
  const baseMonthlyContributionCents = baseGoalMonthlyContribution(goal, priority);
  const baseRemainingCents = Math.max(0, goal.target_amount_cents - goal.current_amount_cents);
  const scenarioRemainingCents = Math.max(
    0,
    scenario.targetAmountCents - goal.current_amount_cents - scenario.oneTimeBoostCents,
  );
  const cutMonthlyCents = categoryCutMonthlyCents(
    categories,
    scenario.selectedCategory,
    scenario.categoryCutPct,
  );
  const surplusCents = surplusAllocatedCents(
    capacityCents,
    scenario.monthlyContributionCents,
    scenario.surplusAllocationPct,
  );
  const monthlyLiftCents = cutMonthlyCents + surplusCents;
  const scenarioMonthlyContributionCents = Math.max(
    0,
    scenario.monthlyContributionCents + monthlyLiftCents,
  );
  const baseDate = projectedDate(baseRemainingCents, baseMonthlyContributionCents, today);
  const scenarioDate = projectedDate(
    scenarioRemainingCents,
    scenarioMonthlyContributionCents,
    today,
  );
  const dateDelta =
    baseDate && scenarioDate ? monthsBetween(baseDate, scenarioDate) : null;
  const requiredMonthlyCents = requiredMonthly(
    scenarioRemainingCents,
    scenario.targetDate,
    today,
  );
  const comparison = debtComparison(
    pack.calculators,
    activeDebts,
    scenarioMonthlyContributionCents,
  );

  return {
    amountRemainingCents: scenarioRemainingCents,
    baseMonthlyContributionCents,
    baseProjectedDate: baseDate,
    categoryCutMonthlyCents: cutMonthlyCents,
    dateDeltaMonths: dateDelta,
    dateMovementLabel: dateMovementLabel(dateDelta),
    debtComparison: comparison,
    monthlyCapacityCents: capacityCents,
    monthlyLiftCents,
    requiredMonthlyCents,
    scenarioMonthlyContributionCents,
    scenarioProjectedDate: scenarioDate,
    status:
      scenarioRemainingCents <= 0
        ? 'funded'
        : scenarioMonthlyContributionCents <= 0
          ? 'needs_contribution'
          : scenario.targetDate === null && scenarioDate === null
            ? 'needs_target'
            : 'projected',
    surplusAllocatedCents: surplusCents,
  };
}

export function buildGoalPlanSimulatorMetrics(
  result: GoalPlanSimulatorResult,
  currencyCode: string,
): GoalPlanSimulatorMetric[] {
  return [
    {
      detail: result.baseProjectedDate
        ? `Base date: ${formatDate(result.baseProjectedDate)}`
        : 'Current plan needs a monthly contribution.',
      label: 'Scenario date',
      tone:
        result.dateDeltaMonths !== null && result.dateDeltaMonths < 0
          ? 'good'
          : result.scenarioProjectedDate
            ? 'neutral'
            : 'warn',
      value: formatDate(result.scenarioProjectedDate),
    },
    {
      detail: result.monthlyLiftCents > 0
        ? `${centsToDisplay(result.monthlyLiftCents, currencyCode)} from category or surplus scenarios.`
        : 'Uses the monthly contribution entered here.',
      label: 'Monthly funding',
      tone: result.scenarioMonthlyContributionCents > 0 ? 'good' : 'warn',
      value: centsToDisplay(result.scenarioMonthlyContributionCents, currencyCode),
    },
    {
      detail: result.requiredMonthlyCents === null
        ? 'Add a target date to compare required monthly funding.'
        : 'Based on the scenario target date.',
      label: 'Required monthly',
      tone:
        result.requiredMonthlyCents === null ||
        result.scenarioMonthlyContributionCents >= result.requiredMonthlyCents
          ? 'good'
          : 'warn',
      value:
        result.requiredMonthlyCents === null
          ? 'Set a date'
          : centsToDisplay(result.requiredMonthlyCents, currencyCode),
    },
    {
      detail: result.dateMovementLabel,
      label: 'Remaining gap',
      tone: result.amountRemainingCents <= 0 ? 'good' : 'neutral',
      value: centsToDisplay(result.amountRemainingCents, currencyCode),
    },
  ];
}

export function scenarioSummary(result: GoalPlanSimulatorResult, currencyCode: string) {
  if (result.status === 'funded') {
    return 'This scenario funds the active goal with the assumptions shown.';
  }

  if (result.status === 'needs_contribution') {
    return 'Add a monthly contribution or scenario lever to estimate a projected date.';
  }

  if (result.requiredMonthlyCents !== null && result.scenarioMonthlyContributionCents < result.requiredMonthlyCents) {
    return `This scenario is about ${centsToDisplay(
      result.requiredMonthlyCents - result.scenarioMonthlyContributionCents,
      currencyCode,
    )} per month below the target-date pace.`;
  }

  if (result.dateDeltaMonths !== null && result.dateDeltaMonths < 0) {
    return `This scenario moves the projected date ${Math.abs(result.dateDeltaMonths)} months sooner.`;
  }

  return 'This scenario keeps assumptions visible without changing your saved plan.';
}

export function categoryCutImpactLabel(
  category: GoalPlanSimulatorCategory | undefined,
  cutPct: number,
  currencyCode: string,
) {
  if (!category) return 'Choose a category to estimate a monthly shift.';

  const monthlyCut = Math.round(category.monthlyAverageCents * (clamp(cutPct, 0, 100) / 100));
  return `${cutPct.toFixed(0)}% of ${category.label} is about ${centsToDisplay(
    monthlyCut,
    currencyCode,
  )}/mo.`;
}

export function estimateMonthlyFromPeriod(totalCents: number, days: number) {
  return Math.round((totalCents * AVERAGE_MONTH_DAYS) / Math.max(1, days));
}
