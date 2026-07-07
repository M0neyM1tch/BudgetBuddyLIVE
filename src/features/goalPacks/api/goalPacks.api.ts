import { normalizeError, AppError, ErrorCodes } from '../../../shared/api/errors';
import { supabase } from '../../../shared/lib/supabase';
import type { Database, Json } from '../../../types/database.types';
import { debtDraftSchema } from '../../debts/schemas/debts.schema';
import type { DebtDraft } from '../../debts/types/debts.types';
import {
  financialPriorityDraftSchema,
  financialPriorityUpdateSchema,
  goalActionDraftSchema,
  goalActionUpdateSchema,
  goalPlanGoalUpdateSchema,
  goalPlanSnapshotDraftSchema,
  type FinancialPriorityDraft,
  type FinancialPriorityUpdateDraft,
  type GoalActionDraft,
  type GoalActionUpdateDraft,
  type GoalPlanGoalUpdateDraft,
  type GoalPlanSnapshotDraft,
} from '../schemas/goalPacks.schema';
import type { GoalDraft } from '../../goals/public';
import { goalDraftSchema } from '../../goals/schemas/goals.schema';
import {
  calculateGoalPlan,
  type GoalPlanResult,
} from '../planning/goalPlanningEngine';
import type { GoalPackDashboardData as GoalPackDashboardViewData } from '../dashboard/goalPackDashboardModel';
import type {
  FinancialPriority,
  FinancialPriorityInsert,
  FinancialPriorityUpdate,
  GoalAction,
  GoalActionInsert,
  GoalActionSource,
  GoalActionStatus,
  GoalActionUpdate,
  GoalPlanGoal,
  GoalPlanGoalUpdate,
  GoalPlanSnapshot,
  GoalPlanSnapshotInsert,
} from '../types/goalPacks.types';

function raise(error: unknown, fallback = 'Goal Pack request failed'): never {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message || fallback, normalized.code, normalized.status);
}

function requiredRow<T>(row: T | null, message: string): T {
  if (!row) throw new AppError(message, 'NOT_FOUND', 404);
  return row;
}

function parseOnboardingSetupResult(row: unknown): GoalPackOnboardingSetupResult {
  if (!row || typeof row !== 'object') {
    throw new AppError('Goal Pack onboarding setup did not return a result.', 'INVALID_RESULT', 500);
  }

  const result = row as Partial<GoalPackOnboardingSetupResult>;
  if (typeof result.goal_id !== 'string' || result.goal_id.length === 0) {
    throw new AppError('Goal Pack onboarding setup did not return a goal.', 'INVALID_RESULT', 500);
  }

  return {
    action_id: typeof result.action_id === 'string' ? result.action_id : null,
    debt_id: typeof result.debt_id === 'string' ? result.debt_id : null,
    goal_id: result.goal_id,
    reused_goal: result.reused_goal === true,
  };
}

export async function fetchActiveFinancialPriority(
  userId: string,
): Promise<FinancialPriority | null> {
  const { data, error } = await supabase
    .from('financial_priorities')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) raise(error, 'Unable to load financial priority');
  return data ?? null;
}

export async function fetchGoalPackDashboardData(
  userId: string,
): Promise<GoalPackDashboardViewData> {
  const priority = await fetchActiveFinancialPriority(userId);

  if (!priority?.active_goal_id) {
    return {
      actions: [],
      goal: null,
      priority,
      snapshot: null,
    };
  }

  const [goal, snapshots, actions] = await Promise.all([
    fetchGoalPlanGoal(userId, priority.active_goal_id),
    fetchGoalPlanSnapshots(userId, priority.active_goal_id, 1),
    fetchGoalActions(userId, {
      goalId: priority.active_goal_id,
      limit: 3,
      status: 'open',
    }),
  ]);

  return {
    actions,
    goal,
    priority,
    snapshot: snapshots[0] ?? null,
  };
}

export async function upsertFinancialPriority(
  userId: string,
  draft: FinancialPriorityDraft,
): Promise<FinancialPriority> {
  const parsed = financialPriorityDraftSchema.parse(draft);
  const insert: FinancialPriorityInsert = {
    ...parsed,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('financial_priorities')
    .upsert(insert, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) raise(error, 'Unable to save financial priority');
  return requiredRow(data, 'Financial priority was not saved.');
}

export type GoalPackOnboardingSetupDraft = {
  actionDraft: GoalActionDraft;
  debtDraft?: DebtDraft | null;
  goalDraft: GoalDraft;
  goalPlanUpdate: GoalPlanGoalUpdateDraft;
  priorityDraft: FinancialPriorityDraft;
};

export type GoalPackOnboardingSetupResult = {
  action_id: string | null;
  debt_id: string | null;
  goal_id: string;
  reused_goal: boolean;
};

type GeneratedOnboardingSetupRpcArgs =
  Database['public']['Functions']['create_goal_pack_onboarding_setup_v2']['Args'];

type OnboardingSetupRpcArgs = {
  [Key in keyof GeneratedOnboardingSetupRpcArgs]: GeneratedOnboardingSetupRpcArgs[Key] | null;
};

type GeneratedRecalculationRpcArgs =
  Database['public']['Functions']['apply_goal_plan_recalculation']['Args'];
type GeneratedCompleteActionRpcArgs =
  Database['public']['Functions']['complete_goal_action_with_plan']['Args'];
type NullableRpcArgs<T> = {
  [Key in keyof T]: T[Key] | null;
};

type GoalPlanWriteResult = {
  action: GoalAction | null;
  goal: GoalPlanGoal | null;
  snapshot: GoalPlanSnapshot | null;
};

function parseGoalPlanWriteResult(row: unknown): GoalPlanWriteResult {
  if (!row || typeof row !== 'object') {
    throw new AppError('Goal plan write did not return a result.', 'INVALID_RESULT', 500);
  }

  const result = row as Partial<GoalPlanWriteResult>;

  return {
    action: (result.action ?? null) as GoalAction | null,
    goal: (result.goal ?? null) as GoalPlanGoal | null,
    snapshot: (result.snapshot ?? null) as GoalPlanSnapshot | null,
  };
}

function goalPlanRpcArgs(plan: GoalPlanResult) {
  return {
    p_confidence_score: plan.goalPlanUpdate.confidence_score ?? plan.confidenceScore,
    p_current_monthly_capacity_cents: plan.currentMonthlyCapacityCents,
    p_drivers: plan.drivers as unknown as Json,
    p_goal_type: plan.goalPlanUpdate.goal_type ?? 'custom',
    p_last_plan_calculated_at:
      plan.goalPlanUpdate.last_plan_calculated_at ?? new Date().toISOString(),
    p_monthly_commitment_cents: plan.goalPlanUpdate.monthly_commitment_cents ?? null,
    p_plan_status: plan.goalPlanUpdate.plan_status ?? 'active',
    p_planning_rules: (plan.goalPlanUpdate.planning_rules ?? {}) as Json,
    p_priority_rank: plan.goalPlanUpdate.priority_rank ?? 1,
    p_progress_percent: plan.snapshotDraft.progress_percent ?? plan.progressPercent,
    p_projected_completion_date: plan.snapshotDraft.projected_completion_date ?? null,
    p_recommendations: plan.recommendations as unknown as Json,
    p_required_monthly_cents: plan.snapshotDraft.required_monthly_cents ?? null,
    p_snapshot_confidence_score: plan.snapshotDraft.confidence_score ?? plan.confidenceScore,
  };
}

export async function createGoalPackOnboardingSetup(
  userId: string,
  draft: GoalPackOnboardingSetupDraft,
): Promise<GoalPackOnboardingSetupResult> {
  if (!userId) {
    throw new AppError('You must be signed in to create a Goal Pack setup.', 'AUTH_REQUIRED', 401);
  }

  const goal = goalDraftSchema.parse(draft.goalDraft);
  const priority = financialPriorityDraftSchema.parse(draft.priorityDraft);
  const goalPlanUpdate = goalPlanGoalUpdateSchema.parse(draft.goalPlanUpdate);
  const action = goalActionDraftSchema.parse(draft.actionDraft);
  const debt = draft.debtDraft ? debtDraftSchema.parse(draft.debtDraft) : null;

  const rpcArgs: OnboardingSetupRpcArgs = {
    p_action_description: action.description ?? null,
    p_action_due_at: action.due_at ?? null,
    p_action_impact_label: action.impact_label ?? null,
    p_action_impact_value: (action.impact_value ?? {}) as Json,
    p_action_source: action.source,
    p_action_title: action.title,
    p_action_type: action.action_type,
    p_confidence_score: goalPlanUpdate.confidence_score ?? null,
    p_country_code: priority.country_code ?? null,
    p_currency_code: priority.currency_code,
    p_debt_color: debt?.color ?? null,
    p_debt_current_balance_cents: debt?.current_balance_cents ?? null,
    p_debt_icon: debt?.icon ?? null,
    p_debt_interest_rate_basis_points: debt?.interest_rate_basis_points ?? null,
    p_debt_minimum_payment_cents: debt?.minimum_payment_cents ?? null,
    p_debt_name: debt?.name ?? null,
    p_debt_payment_frequency: debt?.payment_frequency ?? 'monthly',
    p_debt_principal_cents: debt?.principal_cents ?? null,
    p_debt_start_date: debt?.start_date ?? null,
    p_debt_type: debt?.debt_type ?? 'credit_card',
    p_goal_color: goal.color,
    p_goal_icon: goal.icon,
    p_goal_name: goal.name,
    p_goal_type: goalPlanUpdate.goal_type ?? priority.top_priority_type,
    p_horizon: priority.horizon,
    p_monthly_commitment_cents: goalPlanUpdate.monthly_commitment_cents ?? null,
    p_monthly_expenses_cents: priority.monthly_expenses_cents ?? null,
    p_monthly_income_cents: priority.monthly_income_cents ?? null,
    p_plan_status: goalPlanUpdate.plan_status ?? 'active',
    p_planning_rules: (goalPlanUpdate.planning_rules ?? {}) as Json,
    p_priority_rank: goalPlanUpdate.priority_rank ?? 1,
    p_region_code: priority.region_code ?? null,
    p_starting_balance_cents: goal.starting_balance_cents,
    p_target_amount_cents: goal.target_amount_cents,
    p_target_date: goal.target_date,
    p_top_priority_type: priority.top_priority_type,
  };

  const { data, error } = await supabase.rpc(
    'create_goal_pack_onboarding_setup_v2',
    // Supabase generated types do not currently preserve nullable SQL function args.
    rpcArgs as unknown as GeneratedOnboardingSetupRpcArgs,
  );

  if (error) raise(error, 'Unable to create Goal Pack onboarding setup');
  return parseOnboardingSetupResult(data);
}

export async function updateFinancialPriority(
  userId: string,
  updates: FinancialPriorityUpdateDraft,
): Promise<FinancialPriority> {
  const parsed = financialPriorityUpdateSchema.parse(updates);
  const priorityUpdates: FinancialPriorityUpdate = { ...parsed };

  const { data, error } = await supabase
    .from('financial_priorities')
    .update(priorityUpdates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to update financial priority');
  return requiredRow(data, 'Financial priority was not updated.');
}

export async function updateGoalPlanFields(
  userId: string,
  goalId: string,
  updates: GoalPlanGoalUpdateDraft,
): Promise<GoalPlanGoal> {
  const parsed = goalPlanGoalUpdateSchema.parse(updates);
  const goalUpdates: GoalPlanGoalUpdate = {
    ...parsed,
    planning_rules: parsed.planning_rules as Json | undefined,
  };

  const { data, error } = await supabase
    .from('goals')
    .update(goalUpdates)
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to update goal plan');
  return requiredRow(data, 'Goal plan was not updated.');
}

export async function fetchGoalPlanGoal(
  userId: string,
  goalId: string,
): Promise<GoalPlanGoal> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .single();

  if (error) raise(error, 'Unable to load goal plan');
  return requiredRow(data, 'Goal plan was not found.');
}

export async function fetchGoalAction(userId: string, actionId: string): Promise<GoalAction> {
  const { data, error } = await supabase
    .from('goal_actions')
    .select('*')
    .eq('id', actionId)
    .eq('user_id', userId)
    .single();

  if (error) raise(error, 'Unable to load goal action');
  return requiredRow(data, 'Goal action was not found.');
}

export async function fetchGoalPlanSnapshots(
  userId: string,
  goalId: string,
  limit = 5,
): Promise<GoalPlanSnapshot[]> {
  const { data, error } = await supabase
    .from('goal_plan_snapshots')
    .select('*')
    .eq('user_id', userId)
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) raise(error, 'Unable to load goal plan snapshots');
  return data ?? [];
}

export async function createGoalPlanSnapshot(
  userId: string,
  draft: GoalPlanSnapshotDraft,
): Promise<GoalPlanSnapshot> {
  const parsed = goalPlanSnapshotDraftSchema.parse(draft);
  const insert: GoalPlanSnapshotInsert = {
    ...parsed,
    user_id: userId,
    drivers: parsed.drivers as Json,
    recommendations: parsed.recommendations as Json,
  };

  const { data, error } = await supabase
    .from('goal_plan_snapshots')
    .insert(insert)
    .select()
    .single();

  if (error) raise(error, 'Unable to create goal plan snapshot');
  return requiredRow(data, 'Goal plan snapshot was not created.');
}

export type FetchGoalActionsOptions = {
  actionType?: string;
  goalId?: string;
  source?: GoalActionSource;
  status?: GoalActionStatus;
  limit?: number;
};

export async function fetchGoalActions(
  userId: string,
  options: FetchGoalActionsOptions = {},
): Promise<GoalAction[]> {
  let query = supabase
    .from('goal_actions')
    .select('*')
    .eq('user_id', userId)
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (options.goalId) {
    query = query.eq('goal_id', options.goalId);
  }

  if (options.actionType) {
    query = query.eq('action_type', options.actionType);
  }

  if (options.source) {
    query = query.eq('source', options.source);
  }

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) raise(error, 'Unable to load goal actions');
  return data ?? [];
}

async function fetchReusableOpenGoalAction(
  userId: string,
  action: GoalActionDraft,
): Promise<GoalAction | null> {
  const parsed = goalActionDraftSchema.parse(action);
  if (!parsed.goal_id || parsed.status !== 'open') return null;

  const existingActions = await fetchGoalActions(userId, {
    actionType: parsed.action_type,
    goalId: parsed.goal_id,
    limit: 1,
    source: parsed.source,
    status: 'open',
  });

  return existingActions[0] ?? null;
}

export async function createGoalAction(
  userId: string,
  draft: GoalActionDraft,
): Promise<GoalAction> {
  const parsed = goalActionDraftSchema.parse(draft);
  const reusableAction = await fetchReusableOpenGoalAction(userId, parsed);
  if (reusableAction) return reusableAction;

  const insert: GoalActionInsert = {
    ...parsed,
    user_id: userId,
    impact_value: parsed.impact_value as Json,
  };

  const { data, error } = await supabase
    .from('goal_actions')
    .insert(insert)
    .select()
    .single();

  if (error) {
    const normalized = normalizeError(error);
    if (normalized.code === ErrorCodes.DUPLICATE) {
      const racedAction = await fetchReusableOpenGoalAction(userId, parsed);
      if (racedAction) return racedAction;
    }

    raise(error, 'Unable to create goal action');
  }
  return requiredRow(data, 'Goal action was not created.');
}

export async function updateGoalAction(
  userId: string,
  actionId: string,
  updates: GoalActionUpdateDraft,
): Promise<GoalAction> {
  const parsed = goalActionUpdateSchema.parse(updates);
  const actionUpdates: GoalActionUpdate = {
    ...parsed,
    impact_value: parsed.impact_value as Json | undefined,
  };

  const { data, error } = await supabase
    .from('goal_actions')
    .update(actionUpdates)
    .eq('id', actionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) raise(error, 'Unable to update goal action');
  return requiredRow(data, 'Goal action was not updated.');
}

export type CompleteGoalActionResult = {
  action: GoalAction;
  goal: GoalPlanGoal | null;
  plan: GoalPlanResult | null;
  snapshot: GoalPlanSnapshot | null;
};

export type CompleteGoalActionOptions = {
  completedAt?: string;
  currentDate?: string;
};

export async function completeGoalAction(
  userId: string,
  actionId: string,
  options: CompleteGoalActionOptions = {},
): Promise<CompleteGoalActionResult> {
  const completedAt = options.completedAt ?? new Date().toISOString();
  const action = await fetchGoalAction(userId, actionId);

  if (!action.goal_id) {
    const completedAction = await updateGoalAction(userId, actionId, {
      completed_at: completedAt,
      dismissed_at: null,
      status: 'completed',
    });

    return {
      action: completedAction,
      goal: null,
      plan: null,
      snapshot: null,
    };
  }

  const [priority, goal] = await Promise.all([
    fetchActiveFinancialPriority(userId),
    fetchGoalPlanGoal(userId, action.goal_id),
  ]);
  const plan = calculateGoalPlan({
    currentDate: options.currentDate,
    goal,
    priority,
  });
  const rpcArgs: NullableRpcArgs<GeneratedCompleteActionRpcArgs> = {
    ...goalPlanRpcArgs(plan),
    p_action_id: actionId,
    p_completed_at: completedAt,
  };
  const { data, error } = await supabase.rpc(
    'complete_goal_action_with_plan',
    // Supabase generated types do not currently preserve nullable SQL function args.
    rpcArgs as unknown as GeneratedCompleteActionRpcArgs,
  );

  if (error) raise(error, 'Unable to complete goal action');

  const result = parseGoalPlanWriteResult(data);

  return {
    action: requiredRow(result.action, 'Goal action was not completed.'),
    goal: requiredRow(result.goal, 'Goal plan was not updated.'),
    plan,
    snapshot: requiredRow(result.snapshot, 'Goal plan snapshot was not created.'),
  };
}

export type DismissGoalActionOptions = {
  dismissedAt?: string;
};

export async function dismissGoalAction(
  userId: string,
  actionId: string,
  options: DismissGoalActionOptions = {},
): Promise<GoalAction> {
  return updateGoalAction(userId, actionId, {
    completed_at: null,
    dismissed_at: options.dismissedAt ?? new Date().toISOString(),
    status: 'dismissed',
  });
}

export type RecalculateGoalPlanOptions = {
  currentDate?: string;
};

export type RecalculateGoalPlanResult = {
  action: GoalAction | null;
  goal: GoalPlanGoal;
  plan: GoalPlanResult;
  snapshot: GoalPlanSnapshot;
};

export async function recalculateGoalPlan(
  userId: string,
  goalId: string,
  options: RecalculateGoalPlanOptions = {},
): Promise<RecalculateGoalPlanResult> {
  const [priority, goal] = await Promise.all([
    fetchActiveFinancialPriority(userId),
    fetchGoalPlanGoal(userId, goalId),
  ]);
  const plan = calculateGoalPlan({
    currentDate: options.currentDate,
    goal,
    priority,
  });
  const rpcArgs: NullableRpcArgs<GeneratedRecalculationRpcArgs> = {
    ...goalPlanRpcArgs(plan),
    p_action_description: plan.actionDraft.description ?? null,
    p_action_due_at: plan.actionDraft.due_at ?? null,
    p_action_impact_label: plan.actionDraft.impact_label ?? null,
    p_action_impact_value: (plan.actionDraft.impact_value ?? {}) as Json,
    p_action_source: plan.actionDraft.source ?? 'system',
    p_action_title: plan.actionDraft.title,
    p_action_type: plan.actionDraft.action_type,
    p_goal_id: goalId,
    p_snapshot_kind: plan.snapshotDraft.snapshot_kind ?? 'recalculation',
  };
  const { data, error } = await supabase.rpc(
    'apply_goal_plan_recalculation',
    // Supabase generated types do not currently preserve nullable SQL function args.
    rpcArgs as unknown as GeneratedRecalculationRpcArgs,
  );

  if (error) raise(error, 'Unable to recalculate goal plan');

  const result = parseGoalPlanWriteResult(data);

  return {
    action: result.action,
    goal: requiredRow(result.goal, 'Goal plan was not updated.'),
    plan,
    snapshot: requiredRow(result.snapshot, 'Goal plan snapshot was not created.'),
  };
}

export async function recalculateActiveGoalPlan(
  userId: string,
  options: RecalculateGoalPlanOptions = {},
): Promise<RecalculateGoalPlanResult> {
  const priority = await fetchActiveFinancialPriority(userId);

  if (!priority?.active_goal_id) {
    throw new AppError('Choose an active priority before recalculating a plan.', 'NO_ACTIVE_GOAL', 400);
  }

  return recalculateGoalPlan(userId, priority.active_goal_id, options);
}
