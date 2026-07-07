import { normalizeError, AppError } from '../../../shared/api/errors';
import { supabase } from '../../../shared/lib/supabase';
import { today } from '../../../shared/utils/dates';
import {
  calculateAmountRemaining,
  calculateGoalDaysRemaining,
  calculateGoalProgress,
  calculateGoalStatus,
} from '../../../shared/utils/finance';
import {
  goalContributionDraftSchema,
  goalDraftSchema,
  goalUpdateSchema,
} from '../schemas/goals.schema';
import type {
  Goal,
  GoalContributionDraft,
  GoalContributionResult,
  GoalDraft,
  GoalUpdate,
  GoalWithProgress,
} from '../types/goals.types';
import type { Transaction } from '../../transactions';

function raise(error: unknown, fallback = 'Goal request failed'): never {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message || fallback, normalized.code, normalized.status);
}

function requiredRow<T>(row: T | null, message: string): T {
  if (!row) throw new AppError(message, 'NOT_FOUND', 404);
  return row;
}

export function enrichGoal(goal: Goal, currentDate = today()): GoalWithProgress {
  const progressPct = calculateGoalProgress(
    goal.current_amount_cents,
    goal.target_amount_cents,
  );
  const amountRemainingCents = calculateAmountRemaining(
    goal.current_amount_cents,
    goal.target_amount_cents,
  );
  const daysRemaining = calculateGoalDaysRemaining(goal.target_date, currentDate);

  return {
    ...goal,
    amount_remaining_cents: amountRemainingCents,
    days_remaining: daysRemaining,
    progress_pct: progressPct,
    status: calculateGoalStatus({
      amountRemainingCents,
      daysRemaining,
      progressPct,
    }),
  };
}

export async function fetchGoals(userId: string): Promise<GoalWithProgress[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('is_archived', { ascending: true })
    .order('target_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) raise(error, 'Unable to load goals');
  return (data ?? []).map((goal) => enrichGoal(goal));
}

export async function createGoal(userId: string, draft: GoalDraft): Promise<GoalWithProgress> {
  const parsed = goalDraftSchema.parse(draft);

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      name: parsed.name,
      color: parsed.color,
      icon: parsed.icon,
      target_amount_cents: parsed.target_amount_cents,
      starting_balance_cents: parsed.starting_balance_cents,
      current_amount_cents: parsed.starting_balance_cents,
      target_date: parsed.target_date,
    })
    .select()
    .single();

  if (error) raise(error, 'Unable to create goal');
  return enrichGoal(requiredRow(data, 'Goal was not created.'));
}

export async function updateGoal(
  userId: string,
  goalId: string,
  updates: Partial<GoalDraft>,
): Promise<GoalWithProgress> {
  const parsed = goalUpdateSchema.parse(updates);
  const goalUpdates: GoalUpdate = { ...parsed };
  delete goalUpdates.starting_balance_cents;

  const { data, error } = await supabase
    .from('goals')
    .update(goalUpdates)
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to update goal');
  return enrichGoal(requiredRow(data, 'Goal was not updated.'));
}

export async function archiveGoal(userId: string, goalId: string): Promise<GoalWithProgress> {
  const { data, error } = await supabase
    .from('goals')
    .update({ is_archived: true })
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to archive goal');
  return enrichGoal(requiredRow(data, 'Goal was not archived.'));
}

export async function restoreGoal(userId: string, goalId: string): Promise<GoalWithProgress> {
  const { data, error } = await supabase
    .from('goals')
    .update({ is_archived: false })
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to restore goal');
  return enrichGoal(requiredRow(data, 'Goal was not restored.'));
}

export async function deleteGoalPermanently(goalId: string): Promise<string> {
  const { data, error } = await supabase.rpc('delete_goal_permanently', {
    p_goal_id: goalId,
  });

  if (error) raise(error, 'Unable to permanently delete goal');
  return requiredRow(data as string | null, 'Goal was not deleted.');
}

export async function allocateToGoal(
  draft: GoalContributionDraft,
): Promise<GoalContributionResult> {
  const parsed = goalContributionDraftSchema.parse(draft);

  const { data, error } = await supabase.rpc('allocate_goal_contribution', {
    p_goal_id: parsed.goal_id,
    p_amount_cents: parsed.amount_cents,
    p_transaction_date: parsed.transaction_date,
    p_description: parsed.description,
    p_notes: parsed.notes ?? undefined,
  });

  if (error) raise(error, 'Unable to add funds to goal');
  const transaction = requiredRow(data as Transaction | null, 'Goal contribution was not created.');

  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('*')
    .eq('id', parsed.goal_id)
    .single();

  if (goalError) raise(goalError, 'Unable to refresh goal progress');

  return {
    goal: enrichGoal(requiredRow(goal, 'Goal progress was not refreshed.')),
    transaction,
  };
}
