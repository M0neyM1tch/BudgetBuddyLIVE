import { normalizeError, AppError } from '../../../shared/api/errors';
import { supabase } from '../../../shared/lib/supabase';
import { today } from '../../../shared/utils/dates';
import type { Json } from '../../../types/database.types';
import { DEFAULT_QUICK_ADD_CHIPS } from '../constants/categories';
import {
  quickAddChipsSchema,
  recurringRuleDraftSchema,
  recurringRuleUpdateSchema,
  transactionDraftSchema,
  transactionFiltersSchema,
  transactionUpdateSchema,
} from '../schemas/transactions.schema';
import type {
  QuickAddChip,
  RecurringProcessResult,
  RecurringRule,
  RecurringRuleDraft,
  RecurringRuleUpdate,
  Transaction,
  TransactionDraft,
  TransactionFilters,
  TransactionPage,
  TransactionUpdate,
  UserPreferences,
} from '../types/transactions.types';

function raise(error: unknown, fallback = 'Transaction request failed'): never {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message || fallback, normalized.code, normalized.status);
}

function sanitizeSearchTerm(value: string): string {
  return value.replace(/[%,()]/g, ' ').replace(/\s+/g, ' ').trim();
}

function requiredRow<T>(row: T | null, message: string): T {
  if (!row) throw new AppError(message, 'NOT_FOUND', 404);
  return row;
}

function recurringRulePayload<T extends { skip_backdate?: boolean }>(
  value: T,
): Omit<T, 'skip_backdate'> {
  const payload = { ...value };
  delete payload.skip_backdate;
  return payload;
}

function normalizeRecurringRuleDraftForInsert(draft: RecurringRuleDraft): RecurringRuleDraft {
  const currentDate = today();
  if (!draft.skip_backdate || draft.start_date > currentDate) return draft;

  return {
    ...draft,
    next_run_date: currentDate,
  };
}

export async function fetchTransactions(
  userId: string,
  filters: TransactionFilters,
  page = 0,
  pageSize = 25,
): Promise<TransactionPage> {
  const parsedFilters = transactionFiltersSchema.parse(filters);
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (parsedFilters.from) query = query.gte('transaction_date', parsedFilters.from);
  if (parsedFilters.to) query = query.lte('transaction_date', parsedFilters.to);
  if (parsedFilters.category) query = query.eq('category', parsedFilters.category);
  if (parsedFilters.debt_id) query = query.eq('debt_id', parsedFilters.debt_id);
  if (parsedFilters.kind) query = query.eq('kind', parsedFilters.kind);
  if (parsedFilters.amountMin != null) {
    query = query.gte('amount_cents', Math.round(parsedFilters.amountMin * 100));
  }
  if (parsedFilters.amountMax != null) {
    query = query.lte('amount_cents', Math.round(parsedFilters.amountMax * 100));
  }

  const searchTerm = parsedFilters.q ? sanitizeSearchTerm(parsedFilters.q) : '';
  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    query = query.or(
      `description.ilike.${pattern},category.ilike.${pattern},notes.ilike.${pattern}`,
    );
  }

  const { data, count, error } = await query;
  if (error) raise(error, 'Unable to load transactions');
  return {
    rows: data ?? [],
    count: count ?? 0,
    page,
    pageSize,
  };
}

export async function createTransaction(
  userId: string,
  draft: TransactionDraft,
): Promise<Transaction> {
  const parsed = transactionDraftSchema.parse(draft);

  if (parsed.goal_id) {
    const { data, error } = await supabase.rpc('allocate_goal_contribution', {
      p_goal_id: parsed.goal_id,
      p_amount_cents: parsed.amount_cents,
      p_transaction_date: parsed.transaction_date,
      p_description: parsed.description,
      p_notes: parsed.notes ?? undefined,
    });

    if (error) raise(error, 'Unable to create goal contribution');
    return requiredRow(data as Transaction | null, 'Goal contribution was not created.');
  }

  if (parsed.debt_id) {
    const { data, error } = await supabase.rpc('allocate_debt_payment', {
      p_debt_id: parsed.debt_id,
      p_amount_cents: parsed.amount_cents,
      p_transaction_date: parsed.transaction_date,
      p_description: parsed.description,
      p_notes: parsed.notes ?? undefined,
      p_source: parsed.source,
      p_recurring_rule_id: parsed.recurring_rule_id ?? undefined,
    });

    if (error) raise(error, 'Unable to create debt payment');
    return requiredRow(data as Transaction | null, 'Debt payment was not created.');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount_cents: parsed.amount_cents,
      kind: parsed.kind,
      category: parsed.category,
      transaction_date: parsed.transaction_date,
      description: parsed.description,
      notes: parsed.notes,
      source: parsed.source,
      debt_id: parsed.debt_id ?? null,
      goal_id: parsed.goal_id ?? null,
      recurring_rule_id: parsed.recurring_rule_id ?? null,
    })
    .select()
    .single();

  if (error) raise(error, 'Unable to create transaction');
  return requiredRow(data, 'Transaction was not created.');
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: TransactionUpdate,
): Promise<Transaction> {
  const parsed = transactionUpdateSchema.parse(updates);

  if (parsed.goal_id) {
    if (!parsed.amount_cents || !parsed.transaction_date) {
      throw new AppError(
        'Goal contribution updates require an amount and transaction date.',
        'VALIDATION_ERROR',
        400,
      );
    }

    const { data, error } = await supabase.rpc('update_goal_contribution_transaction', {
      p_transaction_id: transactionId,
      p_amount_cents: parsed.amount_cents,
      p_transaction_date: parsed.transaction_date,
      p_description: parsed.description ?? '',
      p_notes: parsed.notes ?? undefined,
    });

    if (error) raise(error, 'Unable to update goal contribution');
    return requiredRow(data, 'Goal contribution was not updated.');
  }

  if (parsed.debt_id) {
    if (!parsed.amount_cents || !parsed.transaction_date) {
      throw new AppError(
        'Debt payment updates require an amount and transaction date.',
        'VALIDATION_ERROR',
        400,
      );
    }

    const { data, error } = await supabase.rpc('update_debt_payment_transaction', {
      p_transaction_id: transactionId,
      p_amount_cents: parsed.amount_cents,
      p_transaction_date: parsed.transaction_date,
      p_description: parsed.description ?? '',
      p_notes: parsed.notes ?? undefined,
    });

    if (error) raise(error, 'Unable to update debt payment');
    return requiredRow(data, 'Debt payment was not updated.');
  }

  const transactionUpdates = { ...parsed };
  delete transactionUpdates.recurring_frequency;
  delete transactionUpdates.recurring_start_date;
  delete transactionUpdates.recurring_notes;

  const { data, error } = await supabase
    .from('transactions')
    .update(transactionUpdates as TransactionUpdate)
    .eq('id', transactionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to update transaction');
  return requiredRow(data, 'Transaction was not updated.');
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<string> {
  if (!userId) {
    throw new AppError('You must be signed in to delete transactions.', 'AUTH_REQUIRED', 401);
  }

  const { data, error } = await supabase.rpc('delete_transaction_and_rebalance_goal', {
    p_transaction_id: transactionId,
  });

  if (error) raise(error, 'Unable to delete transaction');
  return requiredRow(data as string | null, 'Transaction was not deleted.');
}

export async function fetchRecurringRules(userId: string): Promise<RecurringRule[]> {
  const { data, error } = await supabase
    .from('recurring_rules')
    .select('*')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('next_run_date', { ascending: true });

  if (error) raise(error, 'Unable to load recurring rules');
  return data ?? [];
}

export async function createRecurringRule(
  userId: string,
  draft: RecurringRuleDraft,
): Promise<RecurringRule> {
  const parsed = normalizeRecurringRuleDraftForInsert(recurringRuleDraftSchema.parse(draft));
  const rulePayload = recurringRulePayload(parsed);

  const { data, error } = await supabase
    .from('recurring_rules')
    .insert({
      user_id: userId,
      ...rulePayload,
    })
    .select()
    .single();

  if (error) raise(error, 'Unable to create recurring rule');
  const rule = requiredRow(data, 'Recurring rule was not created.');

  if (parsed.next_run_date !== parsed.start_date) {
    const { data: updated, error: updateError } = await supabase
      .from('recurring_rules')
      .update({ next_run_date: parsed.next_run_date })
      .eq('id', rule.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) raise(updateError, 'Unable to set first occurrence date');
    return requiredRow(updated, 'Recurring rule was not updated.');
  }

  return rule;
}

export async function updateRecurringRule(
  userId: string,
  ruleId: string,
  updates: RecurringRuleUpdate,
): Promise<RecurringRule> {
  const parsed = recurringRuleUpdateSchema.parse(updates);
  const ruleUpdates = recurringRulePayload(parsed);

  const { data, error } = await supabase
    .from('recurring_rules')
    .update(ruleUpdates)
    .eq('id', ruleId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to update recurring rule');
  return requiredRow(data, 'Recurring rule was not updated.');
}

export async function deleteRecurringRule(userId: string, ruleId: string): Promise<string> {
  const { data, error } = await supabase
    .from('recurring_rules')
    .delete()
    .eq('id', ruleId)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error) raise(error, 'Unable to delete recurring rule');
  return requiredRow(data, 'Recurring rule was not deleted.').id;
}

export async function processDueRecurringRules(
  throughDate?: string,
): Promise<RecurringProcessResult> {
  const body: Record<string, string> = {};
  if (throughDate) body.through_date = throughDate;

  const { data, error } = await supabase.functions.invoke<{
    created?: number;
    rules_advanced?: number;
    skipped_paused?: number;
    paused_names?: string[];
    limited?: boolean;
  }>('process-recurring', { body });

  if (error) raise(error, 'Unable to process recurring rules');

  return {
    created: data?.created ?? 0,
    processedRules: data?.rules_advanced ?? 0,
    limited: data?.limited ?? false,
    skippedPaused: data?.skipped_paused ?? 0,
    pausedRuleNames: data?.paused_names ?? [],
  };
}

export async function fetchQuickAddChips(userId: string): Promise<QuickAddChip[]> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('quick_add_chips')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) raise(error, 'Unable to load quick-add cards');

  const parsed = quickAddChipsSchema.safeParse(data?.quick_add_chips ?? []);
  if (!parsed.success || parsed.data.length === 0) return [...DEFAULT_QUICK_ADD_CHIPS];
  return parsed.data;
}

export async function saveQuickAddChips(
  userId: string,
  chips: QuickAddChip[],
): Promise<UserPreferences> {
  const parsed = quickAddChipsSchema.parse(chips);

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        quick_add_chips: parsed as Json,
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) raise(error, 'Unable to save quick-add cards');
  return requiredRow(data, 'Quick-add cards were not saved.');
}
