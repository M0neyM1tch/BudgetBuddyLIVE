import type {
  CalculatorGoal,
  CalculatorTransaction,
  FreedomNumberResult,
  FreedomNumberScenario,
} from '../types/calculator.types';

export function averageMonthlyExpenses(transactions: CalculatorTransaction[]): number {
  const expenseTransactions = transactions.filter((transaction) => transaction.kind === 'expense');
  if (expenseTransactions.length === 0) return 0;

  const months = new Set(expenseTransactions.map((transaction) => transaction.date.slice(0, 7)));
  const total = expenseTransactions.reduce((sum, transaction) => sum + transaction.amountCents, 0);
  return Math.round(total / Math.max(months.size, 1));
}

export function inferCurrentInvestedFromGoals(goals: CalculatorGoal[]): number {
  return goals.reduce((sum, goal) => sum + goal.currentAmountCents, 0);
}

export function freedomNumber(monthlyExpensesCents: number, withdrawalRate: number): number {
  if (withdrawalRate <= 0) return 0;
  return Math.round((monthlyExpensesCents * 12) / withdrawalRate);
}

export function safeWithdrawalAmount(freedomNumberCents: number, withdrawalRate: number): number {
  return Math.round(freedomNumberCents * withdrawalRate);
}

export function yearsToFreedom(
  currentInvestedCents: number,
  monthlyContributionCents: number,
  annualReturnRate: number,
  targetFreedomNumberCents: number,
): number | null {
  if (targetFreedomNumberCents <= 0) return null;
  if (currentInvestedCents >= targetFreedomNumberCents) return 0;
  if (monthlyContributionCents <= 0 && annualReturnRate <= 0) return null;

  const monthlyRate = annualReturnRate / 12;
  let balance = Math.max(0, currentInvestedCents);

  for (let month = 1; month <= 12 * 80; month += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContributionCents;
    if (balance >= targetFreedomNumberCents) {
      return Math.ceil(month / 12);
    }
  }

  return null;
}

export function calculateFreedomNumberScenario(
  scenario: FreedomNumberScenario,
): FreedomNumberResult {
  const target = freedomNumber(scenario.monthlyExpensesCents, scenario.withdrawalRate);
  const reducedSpendTarget = freedomNumber(
    Math.max(0, scenario.monthlyExpensesCents - 25_000),
    scenario.withdrawalRate,
  );

  return {
    annualExpensesCents: scenario.monthlyExpensesCents * 12,
    freedomNumberCents: target,
    reducedSpendFreedomNumberCents: reducedSpendTarget,
    safeAnnualWithdrawalCents: safeWithdrawalAmount(target, scenario.withdrawalRate),
    yearsToFreedom: yearsToFreedom(
      scenario.currentInvestedCents,
      scenario.monthlyInvestContributionCents,
      scenario.annualReturnRate,
      target,
    ),
    reducedSpendYearsToFreedom: yearsToFreedom(
      scenario.currentInvestedCents,
      scenario.monthlyInvestContributionCents,
      scenario.annualReturnRate,
      reducedSpendTarget,
    ),
  };
}
