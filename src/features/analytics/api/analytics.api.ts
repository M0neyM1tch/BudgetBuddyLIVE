import { normalizeError, AppError } from '../../../shared/api/errors';
import { supabase } from '../../../shared/lib/supabase';
import {
  debtProgress,
  goalProgress,
  sortDebtsByInterest,
  sortGoalsByProgress,
} from '../utils/analytics.utils';
import type {
  AnalyticsDebtSnapshot,
  AnalyticsGoalSnapshot,
  AnalyticsTransaction,
  DateRange,
} from '../types/analytics.types';

function raise(error: unknown, fallback = 'Analytics request failed'): never {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message || fallback, normalized.code, normalized.status);
}

export async function fetchAnalyticsTransactions(
  userId: string,
  range: DateRange,
): Promise<AnalyticsTransaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, transaction_date, amount_cents, kind, category')
    .eq('user_id', userId)
    .gte('transaction_date', range.from)
    .lte('transaction_date', range.to)
    .order('transaction_date', { ascending: true });

  if (error) raise(error, 'Unable to load analytics transactions');

  return (data ?? []).map((transaction) => ({
    id: transaction.id,
    date: transaction.transaction_date,
    amountCents: transaction.amount_cents,
    kind: transaction.kind,
    category: transaction.category,
  }));
}

export async function fetchAnalyticsGoals(userId: string): Promise<AnalyticsGoalSnapshot[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, name, icon, color, current_amount_cents, target_amount_cents')
    .eq('user_id', userId)
    .eq('is_archived', false);

  if (error) raise(error, 'Unable to load analytics goals');

  return sortGoalsByProgress(
    (data ?? []).map((goal) => ({
      id: goal.id,
      name: goal.name,
      icon: goal.icon,
      color: goal.color,
      currentAmountCents: goal.current_amount_cents,
      targetAmountCents: goal.target_amount_cents,
      progressPct: goalProgress(goal.current_amount_cents, goal.target_amount_cents),
    })),
  );
}

export async function fetchAnalyticsDebts(userId: string): Promise<AnalyticsDebtSnapshot[]> {
  const { data, error } = await supabase
    .from('debts')
    .select('id, name, icon, color, principal_cents, current_balance_cents, interest_rate_basis_points')
    .eq('user_id', userId)
    .eq('is_archived', false);

  if (error) raise(error, 'Unable to load analytics debts');

  return sortDebtsByInterest(
    (data ?? []).map((debt) => {
      const paidCents = Math.max(0, debt.principal_cents - debt.current_balance_cents);

      return {
        id: debt.id,
        name: debt.name,
        icon: debt.icon,
        color: debt.color,
        principalCents: debt.principal_cents,
        currentBalanceCents: debt.current_balance_cents,
        interestRateBasisPoints: debt.interest_rate_basis_points,
        paidCents,
        progressPct: debtProgress(debt.principal_cents, debt.current_balance_cents),
      };
    }),
  );
}
