import { normalizeError, AppError } from '../../../shared/api/errors';
import { supabase } from '../../../shared/lib/supabase';
import type {
  CalculatorGoal,
  CalculatorRecurringRule,
  CalculatorTransaction,
} from '../types/calculator.types';

function raise(error: unknown, fallback = 'Calculator request failed'): never {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message || fallback, normalized.code, normalized.status);
}

export async function fetchCalculatorTransactions(
  userId: string,
  from: string,
  to: string,
): Promise<CalculatorTransaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount_cents, category, description, goal_id, kind, transaction_date')
    .eq('user_id', userId)
    .gte('transaction_date', from)
    .lte('transaction_date', to)
    .order('transaction_date', { ascending: false })
    .limit(750);

  if (error) raise(error, 'Unable to load calculator transactions');

  return (data ?? []).map((transaction) => ({
    id: transaction.id,
    amountCents: transaction.amount_cents,
    category: transaction.category,
    date: transaction.transaction_date,
    description: transaction.description,
    goalId: transaction.goal_id,
    kind: transaction.kind,
  }));
}

export async function fetchCalculatorRecurringRules(
  userId: string,
): Promise<CalculatorRecurringRule[]> {
  const { data, error } = await supabase
    .from('recurring_rules')
    .select('id, amount_cents, category, debt_id, description, frequency, kind, next_run_date')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('amount_cents', { ascending: false });

  if (error) raise(error, 'Unable to load recurring calculator data');

  return (data ?? []).map((rule) => ({
    id: rule.id,
    amountCents: rule.amount_cents,
    category: rule.category,
    debtId: rule.debt_id,
    description: rule.description,
    frequency: rule.frequency,
    kind: rule.kind,
    nextRunDate: rule.next_run_date,
  }));
}

export async function fetchCalculatorGoals(userId: string): Promise<CalculatorGoal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, name, current_amount_cents, target_amount_cents, target_date')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('target_amount_cents', { ascending: false });

  if (error) raise(error, 'Unable to load calculator goals');

  return (data ?? []).map((goal) => ({
    id: goal.id,
    name: goal.name,
    currentAmountCents: goal.current_amount_cents,
    targetAmountCents: goal.target_amount_cents,
    targetDate: goal.target_date,
  }));
}
