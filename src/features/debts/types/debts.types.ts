import type { Enums, Tables, TablesInsert, TablesUpdate } from '../../../types/database.types';
import type { Transaction } from '../../transactions';

export type Debt = Tables<'debts'>;
export type DebtInsert = TablesInsert<'debts'>;
export type DebtUpdate = TablesUpdate<'debts'>;

export type DebtType = Enums<'debt_type'>;
export type PaymentFrequency = Enums<'payment_frequency'>;

export type DebtDraft = {
  color: string | null;
  current_balance_cents: number;
  debt_type: DebtType;
  icon: string;
  interest_rate_basis_points: number;
  minimum_payment_cents: number;
  name: string;
  payment_frequency: PaymentFrequency;
  principal_cents: number;
  start_date: string | null;
};

export type DebtStatus = 'paid_off' | 'on_track' | 'high_interest' | 'no_payment';

export type DebtWithProgress = Debt & {
  estimated_monthly_interest_cents: number;
  paid_down_cents: number;
  payoff_progress_pct: number;
  status: DebtStatus;
};

export type DebtSummary = {
  activeCount: number;
  highInterestCount: number;
  paidOffCount: number;
  totalBalanceCents: number;
  totalMinimumPaymentCents: number;
  totalPrincipalCents: number;
};

export type DebtContributionDraft = {
  amount_cents: number;
  debt_id: string;
  description?: string;
  notes?: string | null;
  transaction_date: string;
};

export type DebtContributionResult = {
  transaction: Transaction;
};
