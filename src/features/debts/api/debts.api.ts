import { AppError, normalizeError } from '../../../shared/api/errors';
import { supabase } from '../../../shared/lib/supabase';
import type { Transaction } from '../../transactions';
import {
  debtContributionDraftSchema,
  debtDraftSchema,
  debtUpdateSchema,
} from '../schemas/debts.schema';
import type {
  Debt,
  DebtContributionDraft,
  DebtDraft,
  DebtUpdate,
  DebtWithProgress,
} from '../types/debts.types';

function raise(error: unknown, fallback = 'Debt request failed'): never {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message || fallback, normalized.code, normalized.status);
}

function requiredRow<T>(row: T | null, message: string): T {
  if (!row) throw new AppError(message, 'NOT_FOUND', 404);
  return row;
}

function calculateDebtProgress(principalCents: number, currentBalanceCents: number): number {
  if (principalCents <= 0) return currentBalanceCents <= 0 ? 100 : 0;
  return Math.min(
    100,
    Math.max(0, ((principalCents - currentBalanceCents) / principalCents) * 100),
  );
}

function calculateDebtStatus(debt: Debt): DebtWithProgress['status'] {
  if (debt.current_balance_cents <= 0) return 'paid_off';
  if (debt.minimum_payment_cents <= 0) return 'no_payment';
  if (debt.interest_rate_basis_points >= 1_800) return 'high_interest';
  return 'on_track';
}

export function enrichDebt(debt: Debt): DebtWithProgress {
  const paidDownCents = Math.max(0, debt.principal_cents - debt.current_balance_cents);
  const estimatedMonthlyInterestCents = Math.round(
    debt.current_balance_cents * (debt.interest_rate_basis_points / 10_000 / 12),
  );

  return {
    ...debt,
    estimated_monthly_interest_cents: estimatedMonthlyInterestCents,
    paid_down_cents: paidDownCents,
    payoff_progress_pct: calculateDebtProgress(
      debt.principal_cents,
      debt.current_balance_cents,
    ),
    status: calculateDebtStatus(debt),
  };
}

export async function fetchDebts(userId: string): Promise<DebtWithProgress[]> {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('is_archived', { ascending: true })
    .order('current_balance_cents', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) raise(error, 'Unable to load debts');
  return (data ?? []).map((debt) => enrichDebt(debt));
}

export async function createDebt(userId: string, draft: DebtDraft): Promise<DebtWithProgress> {
  const parsed = debtDraftSchema.parse(draft);

  const { data, error } = await supabase
    .from('debts')
    .insert({
      user_id: userId,
      name: parsed.name,
      debt_type: parsed.debt_type,
      color: parsed.color,
      icon: parsed.icon,
      principal_cents: parsed.principal_cents,
      current_balance_cents: parsed.current_balance_cents,
      interest_rate_basis_points: parsed.interest_rate_basis_points,
      minimum_payment_cents: parsed.minimum_payment_cents,
      payment_frequency: parsed.payment_frequency,
      start_date: parsed.start_date,
    })
    .select()
    .single();

  if (error) raise(error, 'Unable to create debt');
  return enrichDebt(requiredRow(data, 'Debt was not created.'));
}

export async function updateDebt(
  userId: string,
  debtId: string,
  updates: Partial<DebtDraft>,
): Promise<DebtWithProgress> {
  const parsed = debtUpdateSchema.parse(updates);
  const debtUpdates: DebtUpdate = { ...parsed };

  const { data, error } = await supabase
    .from('debts')
    .update(debtUpdates)
    .eq('id', debtId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to update debt');
  return enrichDebt(requiredRow(data, 'Debt was not updated.'));
}

export async function archiveDebt(userId: string, debtId: string): Promise<DebtWithProgress> {
  const { data, error } = await supabase
    .from('debts')
    .update({ is_archived: true })
    .eq('id', debtId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to archive debt');
  return enrichDebt(requiredRow(data, 'Debt was not archived.'));
}

export async function restoreDebt(userId: string, debtId: string): Promise<DebtWithProgress> {
  const { data, error } = await supabase
    .from('debts')
    .update({ is_archived: false })
    .eq('id', debtId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to restore debt');
  return enrichDebt(requiredRow(data, 'Debt was not restored.'));
}

export async function deleteDebtPermanently(debtId: string): Promise<string> {
  const { data, error } = await supabase.rpc('delete_debt_permanently', {
    p_debt_id: debtId,
  });

  if (error) raise(error, 'Unable to permanently delete debt');
  return requiredRow(data as string | null, 'Debt was not deleted.');
}

export async function fetchActiveDebts(userId: string): Promise<DebtWithProgress[]> {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .gt('current_balance_cents', 0)
    .order('current_balance_cents', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) raise(error, 'Unable to load active debts');
  return (data ?? []).map((debt) => enrichDebt(debt));
}

export async function allocateDebtPayment(
  draft: DebtContributionDraft,
): Promise<Transaction> {
  const parsed = debtContributionDraftSchema.parse(draft);

  const { data, error } = await supabase.rpc('allocate_debt_payment', {
    p_debt_id: parsed.debt_id,
    p_amount_cents: parsed.amount_cents,
    p_transaction_date: parsed.transaction_date,
    p_description: parsed.description,
    p_notes: parsed.notes ?? undefined,
  });

  if (error) raise(error, 'Unable to record debt payment');
  return requiredRow(data as Transaction | null, 'Debt payment was not created.');
}

export async function updateDebtPaymentTransaction(
  transactionId: string,
  patch: {
    amount_cents: number;
    description?: string;
    notes?: string | null;
    transaction_date: string;
  },
): Promise<Transaction> {
  const { data, error } = await supabase.rpc('update_debt_payment_transaction', {
    p_transaction_id: transactionId,
    p_amount_cents: patch.amount_cents,
    p_transaction_date: patch.transaction_date,
    p_description: patch.description ?? '',
    p_notes: patch.notes ?? undefined,
  });

  if (error) raise(error, 'Unable to update debt payment');
  return requiredRow(data as Transaction | null, 'Debt payment was not updated.');
}
