import { normalizeError, AppError } from '../../../shared/api/errors';
import { requireCompleteRows } from '../../../shared/api/completeRows';
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
  const result = await supabase
    .from('transactions')
    .select('id, transaction_date, amount_cents, kind, category', { count: 'exact' })
    .eq('user_id', userId)
    .gte('transaction_date', range.from)
    .lte('transaction_date', range.to)
    .order('transaction_date', { ascending: true });

  if (result.error) raise(result.error, 'Unable to load analytics transactions');

  return requireCompleteRows(result, 'analytics transaction history').map((transaction) => ({
    id: transaction.id,
    date: transaction.transaction_date,
    amountCents: transaction.amount_cents,
    kind: transaction.kind,
    category: transaction.category,
  }));
}

export async function fetchAnalyticsGoals(userId: string): Promise<AnalyticsGoalSnapshot[]> {
  const result = await supabase
    .from('goals')
    .select('id, name, icon, color, current_amount_cents, target_amount_cents', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_archived', false);

  if (result.error) raise(result.error, 'Unable to load analytics goals');

  return sortGoalsByProgress(
    requireCompleteRows(result, 'analytics goals').map((goal) => ({
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
  const result = await supabase
    .from('debts')
    .select('id, name, icon, color, principal_cents, current_balance_cents, interest_rate_basis_points', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_archived', false);

  if (result.error) raise(result.error, 'Unable to load analytics debts');

  return sortDebtsByInterest(
    requireCompleteRows(result, 'analytics debts').map((debt) => {
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
