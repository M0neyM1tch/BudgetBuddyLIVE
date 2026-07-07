import type {
  RecurringFrequency,
  TransactionKind,
} from '../../transactions';

export type CalculatorTabKey =
  | 'goal-plan'
  | 'freedom-number'
  | 'budget-health'
  | 'compound-growth'
  | 'recurring-costs';

export type CalculatorTransaction = {
  id: string;
  amountCents: number;
  category: string;
  date: string;
  description: string;
  goalId: string | null;
  kind: TransactionKind;
};

export type CalculatorRecurringRule = {
  id: string;
  amountCents: number;
  category: string;
  debtId: string | null;
  description: string;
  frequency: RecurringFrequency;
  kind: TransactionKind;
  nextRunDate: string;
};

export type CalculatorGoal = {
  id: string;
  name: string;
  currentAmountCents: number;
  targetAmountCents: number;
  targetDate: string | null;
};

export type CalculatorPrefillData = {
  transactions: CalculatorTransaction[];
  recurringRules: CalculatorRecurringRule[];
  goals: CalculatorGoal[];
  historyRange: {
    from: string;
    to: string;
  };
};

export type FreedomNumberScenario = {
  monthlyExpensesCents: number;
  withdrawalRate: number;
  annualReturnRate: number;
  monthlyInvestContributionCents: number;
  currentInvestedCents: number;
};

export type FreedomNumberResult = {
  annualExpensesCents: number;
  freedomNumberCents: number;
  reducedSpendFreedomNumberCents: number;
  safeAnnualWithdrawalCents: number;
  yearsToFreedom: number | null;
  reducedSpendYearsToFreedom: number | null;
};

export type BudgetBucket = 'needs' | 'wants' | 'savings' | 'ignore';

export type BudgetHealthBreakdown = {
  incomeCents: number;
  needsCents: number;
  wantsCents: number;
  savingsCents: number;
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
  score: number;
};

export type BudgetHealthTargets = {
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
};

export type CompoundGrowthScenario = {
  principalCents: number;
  monthlyContributionCents: number;
  annualRate: number;
  years: number;
};

export type GrowthPoint = {
  year: number;
  balanceCents: number;
  contributionsCents: number;
  growthCents: number;
};

export type CompoundGrowthResult = {
  futureValueCents: number;
  totalContributionsCents: number;
  investmentGrowthCents: number;
  plusHundredFutureValueCents: number;
  series: GrowthPoint[];
};

export type RecurringCostRow = {
  id: string;
  annualCents: number;
  category: string;
  description: string;
  frequency: RecurringFrequency;
  isLikelySubscription: boolean;
  monthlyCents: number;
};

export type RecurringCostSummary = {
  monthlyCents: number;
  annualCents: number;
  selectedAnnualCents: number;
  fiveYearSelectedSavingsCents: number;
};
