import type { TransactionKind } from '../../transactions/types/transactions.types';

export type PeriodPreset =
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'custom';

export type DateRange = {
  from: string;
  to: string;
  preset: PeriodPreset;
};

export type AnalyticsTransaction = {
  id: string;
  date: string;
  amountCents: number;
  kind: TransactionKind;
  category: string;
};

export type NetSummary = {
  incomeCents: number;
  expensesCents: number;
  netCents: number;
  priorIncomeCents: number;
  priorExpensesCents: number;
  priorNetCents: number;
};

export type MonthlyBucket = {
  month: string;
  label: string;
  incomeCents: number;
  expensesCents: number;
  netCents: number;
};

export type CategoryBucket = {
  category: string;
  label: string;
  totalCents: number;
  percentage: number;
  priorCents?: number;
};

export type DailyBucket = {
  date: string;
  label: string;
  expensesCents: number;
};

export type AnalyticsGoalSnapshot = {
  id: string;
  name: string;
  icon: string;
  color: string | null;
  currentAmountCents: number;
  targetAmountCents: number;
  progressPct: number;
};

export type AnalyticsDebtSnapshot = {
  id: string;
  name: string;
  icon: string;
  color: string | null;
  principalCents: number;
  currentBalanceCents: number;
  interestRateBasisPoints: number;
  paidCents: number;
  progressPct: number;
};

export type CustomRangeValidation = {
  isValid: boolean;
  message: string | null;
};
