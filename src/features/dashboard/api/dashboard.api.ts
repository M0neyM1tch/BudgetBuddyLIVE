import { normalizeError, AppError } from '../../../shared/api/errors';
import { supabase } from '../../../shared/lib/supabase';
import type {
  DashboardCashFlow,
  DashboardDebtSnapshot,
  DashboardGoalSnapshot,
  DashboardKpis,
  DashboardTransactionSnapshot,
} from '../types/dashboard.types';

function raise(error: unknown, fallback = 'Dashboard request failed'): never {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message || fallback, normalized.code, normalized.status);
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthBounds(date = new Date()) {
  const currentStart = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  const nextStart = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1));
  const previousStart = new Date(Date.UTC(date.getFullYear(), date.getMonth() - 1, 1));

  return {
    currentStart: toISODate(currentStart),
    nextStart: toISODate(nextStart),
    previousStart: toISODate(previousStart),
  };
}

function emptyCashFlow(): DashboardCashFlow {
  return {
    incomeCents: 0,
    expenseCents: 0,
    netCents: 0,
  };
}

function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

export async function fetchDashboardKpis(userId: string): Promise<DashboardKpis> {
  const bounds = monthBounds();

  const [transactionsResult, goalsResult, debtsResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount_cents, kind, transaction_date')
      .eq('user_id', userId)
      .in('kind', ['income', 'expense'])
      .gte('transaction_date', bounds.previousStart)
      .lt('transaction_date', bounds.nextStart),
    supabase
      .from('goals')
      .select('current_amount_cents')
      .eq('user_id', userId)
      .eq('is_archived', false),
    supabase
      .from('debts')
      .select('current_balance_cents')
      .eq('user_id', userId)
      .eq('is_archived', false),
  ]);

  if (transactionsResult.error) raise(transactionsResult.error, 'Unable to load dashboard totals');
  if (goalsResult.error) raise(goalsResult.error, 'Unable to load savings total');
  if (debtsResult.error) raise(debtsResult.error, 'Unable to load debt total');

  const currentMonth = emptyCashFlow();
  const previousMonth = emptyCashFlow();

  for (const transaction of transactionsResult.data ?? []) {
    const target =
      transaction.transaction_date >= bounds.currentStart ? currentMonth : previousMonth;

    if (transaction.kind === 'income') {
      target.incomeCents += transaction.amount_cents;
      target.netCents += transaction.amount_cents;
    }

    if (transaction.kind === 'expense') {
      target.expenseCents += transaction.amount_cents;
      target.netCents -= transaction.amount_cents;
    }
  }

  return {
    currentMonth,
    previousMonth,
    totalSavingsCents: (goalsResult.data ?? []).reduce(
      (sum, goal) => sum + goal.current_amount_cents,
      0,
    ),
    totalDebtCents: (debtsResult.data ?? []).reduce(
      (sum, debt) => sum + debt.current_balance_cents,
      0,
    ),
  };
}

export async function fetchDashboardGoals(userId: string): Promise<DashboardGoalSnapshot[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, name, icon, color, current_amount_cents, target_amount_cents')
    .eq('user_id', userId)
    .eq('is_archived', false);

  if (error) raise(error, 'Unable to load goal snapshot');

  return (data ?? [])
    .map((goal) => ({
      id: goal.id,
      name: goal.name,
      icon: goal.icon,
      color: goal.color,
      currentAmountCents: goal.current_amount_cents,
      targetAmountCents: goal.target_amount_cents,
      progressPct: calculateProgress(goal.current_amount_cents, goal.target_amount_cents),
    }))
    .sort((a, b) => b.progressPct - a.progressPct)
    .slice(0, 3);
}

export async function fetchDashboardDebts(userId: string): Promise<DashboardDebtSnapshot[]> {
  const { data: debts, error } = await supabase
    .from('debts')
    .select(
      'id, name, icon, color, current_balance_cents, interest_rate_basis_points, minimum_payment_cents',
    )
    .eq('user_id', userId)
    .eq('is_archived', false);

  if (error) raise(error, 'Unable to load debt snapshot');

  const topDebts = (debts ?? [])
    .sort((a, b) => b.interest_rate_basis_points - a.interest_rate_basis_points)
    .slice(0, 3);
  const topDebtIds = topDebts.map((debt) => debt.id);
  const nextPaymentsByDebt = new Map<string, string>();

  if (topDebtIds.length > 0) {
    const { data: rules, error: rulesError } = await supabase
      .from('recurring_rules')
      .select('debt_id, next_run_date')
      .eq('user_id', userId)
      .eq('is_active', true)
      .in('debt_id', topDebtIds)
      .order('next_run_date', { ascending: true });

    if (rulesError) raise(rulesError, 'Unable to load debt payment dates');

    for (const rule of rules ?? []) {
      if (rule.debt_id && !nextPaymentsByDebt.has(rule.debt_id)) {
        nextPaymentsByDebt.set(rule.debt_id, rule.next_run_date);
      }
    }
  }

  return topDebts.map((debt) => ({
    id: debt.id,
    name: debt.name,
    icon: debt.icon,
    color: debt.color,
    currentBalanceCents: debt.current_balance_cents,
    interestRateBasisPoints: debt.interest_rate_basis_points,
    minimumPaymentCents: debt.minimum_payment_cents,
    nextPaymentDate: nextPaymentsByDebt.get(debt.id) ?? null,
  }));
}

export async function fetchRecentDashboardTransactions(
  userId: string,
): Promise<DashboardTransactionSnapshot[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount_cents, category, created_at, description, kind, source, transaction_date')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) raise(error, 'Unable to load recent transactions');

  return (data ?? []).map((transaction) => ({
    id: transaction.id,
    amountCents: transaction.amount_cents,
    category: transaction.category,
    createdAt: transaction.created_at,
    description: transaction.description,
    kind: transaction.kind,
    source: transaction.source,
    transactionDate: transaction.transaction_date,
  }));
}
