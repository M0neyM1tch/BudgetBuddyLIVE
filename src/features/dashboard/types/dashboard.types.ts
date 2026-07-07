import type { TransactionKind } from '../../transactions/types/transactions.types';

export type DashboardKpis = {
  currentMonth: DashboardCashFlow;
  previousMonth: DashboardCashFlow;
  totalSavingsCents: number;
  totalDebtCents: number;
};

export type DashboardCashFlow = {
  incomeCents: number;
  expenseCents: number;
  netCents: number;
};

export type DashboardGoalSnapshot = {
  id: string;
  name: string;
  icon: string;
  color: string | null;
  currentAmountCents: number;
  targetAmountCents: number;
  progressPct: number;
};

export type DashboardDebtSnapshot = {
  id: string;
  name: string;
  icon: string;
  color: string | null;
  currentBalanceCents: number;
  interestRateBasisPoints: number;
  minimumPaymentCents: number;
  nextPaymentDate: string | null;
};

export type DashboardTransactionSnapshot = {
  id: string;
  amountCents: number;
  category: string;
  createdAt: string;
  description: string;
  kind: TransactionKind;
  source: string;
  transactionDate: string;
};
