export type FreedomCalculatorInput = {
  annualReturnRate?: number;
  currentAge?: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  horizonYears?: number;
  monthlySavings?: number;
};

export type ProjectionPoint = {
  age: number;
  balance: number;
  contributions: number;
  target: number;
  year: number;
};

export type FreedomCalculatorResult = {
  freedomAge: number | null;
  freedomNumber: number;
  growthMultiplier: number;
  investmentReturns: number;
  projectedBalance: number;
  projectionData: ProjectionPoint[];
  savingsRate: number;
  totalContributions: number;
  yearsToFreedom: number | null;
};

export const ANNUAL_RETURN_OPTIONS = [
  {
    description: 'Lower volatility, slower growth',
    label: 'Conservative',
    rate: 0.04,
  },
  {
    description: 'Diversified long-term portfolio',
    label: 'Balanced',
    rate: 0.07,
  },
  {
    description: 'Higher risk, higher growth target',
    label: 'Growth',
    rate: 0.1,
  },
] as const;

const DEFAULT_CURRENT_AGE = 30;
const DEFAULT_HORIZON_YEARS = 20;
const DEFAULT_RETURN_RATE = 0.07;
const INFLATION_RATE = 0.03;
const MAX_FREEDOM_YEARS = 60;

export function calculateFreedomSnapshot(input: FreedomCalculatorInput): FreedomCalculatorResult {
  const currentAge = input.currentAge ?? DEFAULT_CURRENT_AGE;
  const horizonYears = input.horizonYears ?? DEFAULT_HORIZON_YEARS;
  const returnRate = input.annualReturnRate ?? DEFAULT_RETURN_RATE;
  const monthlyIncome = Math.max(input.monthlyIncome, 0);
  const monthlyExpenses = Math.max(input.monthlyExpenses, 0);
  const currentSavings = Math.max(input.currentSavings, 0);
  const monthlySavings = Math.max(input.monthlySavings ?? monthlyIncome - monthlyExpenses, 0);
  const yearlyExpenses = Math.max(input.monthlyExpenses, 0) * 12;
  const freedomNumber = yearlyExpenses * 25;
  const totalSimulationYears = Math.max(horizonYears, MAX_FREEDOM_YEARS);
  const projectionData: ProjectionPoint[] = [];
  let balance = currentSavings;
  let yearsToFreedom: number | null = null;

  for (let year = 1; year <= totalSimulationYears; year += 1) {
    balance = balance * (1 + returnRate) + monthlySavings * 12;

    const target = freedomNumber * Math.pow(1 + INFLATION_RATE, year);

    if (year <= horizonYears) {
      projectionData.push({
        age: currentAge + year,
        balance: Math.round(balance),
        contributions: Math.round(currentSavings + monthlySavings * 12 * year),
        target: Math.round(target),
        year,
      });
    }

    if (yearsToFreedom === null && balance >= target) {
      yearsToFreedom = year;
    }
  }

  const projectedBalance = projectionData.at(-1)?.balance ?? currentSavings;
  const totalContributions = currentSavings + monthlySavings * 12 * horizonYears;
  const investmentReturns = projectedBalance - totalContributions;

  return {
    freedomAge: yearsToFreedom === null ? null : currentAge + yearsToFreedom,
    freedomNumber: Math.round(freedomNumber),
    growthMultiplier: totalContributions > 0 ? projectedBalance / totalContributions : 0,
    investmentReturns: Math.round(investmentReturns),
    projectedBalance: Math.round(projectedBalance),
    projectionData,
    savingsRate: monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0,
    totalContributions: Math.round(totalContributions),
    yearsToFreedom,
  };
}

export function formatWholeDollars(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    currency: 'CAD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

export type GoalStatus = 'completed' | 'on_track' | 'at_risk' | 'no_target_date';

export function calculateGoalProgress(
  currentAmountCents: number,
  targetAmountCents: number,
): number {
  if (targetAmountCents <= 0) return 0;
  return Math.min(100, Math.max(0, (currentAmountCents / targetAmountCents) * 100));
}

export function calculateAmountRemaining(
  currentAmountCents: number,
  targetAmountCents: number,
): number {
  return Math.max(0, targetAmountCents - currentAmountCents);
}

export function calculateGoalDaysRemaining(targetDate: string | null, currentDate: string): number | null {
  if (!targetDate) return null;

  const [targetYear, targetMonth, targetDay] = targetDate.split('-').map(Number);
  const [currentYear, currentMonth, currentDay] = currentDate.split('-').map(Number);
  const target = new Date(targetYear, targetMonth - 1, targetDay);
  const current = new Date(currentYear, currentMonth - 1, currentDay);

  return Math.ceil((target.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateGoalStatus(input: {
  amountRemainingCents: number;
  daysRemaining: number | null;
  progressPct: number;
}): GoalStatus {
  if (input.amountRemainingCents <= 0 || input.progressPct >= 100) return 'completed';
  if (input.daysRemaining === null) return 'no_target_date';
  if (input.daysRemaining < 0) return 'at_risk';
  if (input.progressPct >= 50 || input.daysRemaining >= 30) return 'on_track';
  return 'at_risk';
}

export function getGoalStatusLabel(status: GoalStatus): string {
  const labels: Record<GoalStatus, string> = {
    completed: 'Complete',
    on_track: 'On track',
    at_risk: 'Needs attention',
    no_target_date: 'No target date',
  };

  return labels[status];
}
