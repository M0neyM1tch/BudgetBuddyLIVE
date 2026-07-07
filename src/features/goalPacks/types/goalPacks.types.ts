import type { Tables, TablesInsert, TablesUpdate } from '../../../types/database.types';

export const GOAL_TYPES = [
  'emergency_fund',
  'debt_payoff',
  'major_purchase',
  'home_fund',
  'custom',
  'retirement',
  'general_savings',
  'bill_reliability',
] as const;

export type GoalType = (typeof GOAL_TYPES)[number];

export const MVP_GOAL_PACK_TYPES = [
  'emergency_fund',
  'debt_payoff',
  'major_purchase',
  'custom',
] as const satisfies readonly GoalType[];

export type MvpGoalPackType = (typeof MVP_GOAL_PACK_TYPES)[number];

export const DEFERRED_GOAL_PACK_TYPES = [
  'home_fund',
  'retirement',
  'general_savings',
  'bill_reliability',
] as const satisfies readonly GoalType[];

export type DeferredGoalPackType = (typeof DEFERRED_GOAL_PACK_TYPES)[number];

export const GOAL_HORIZONS = [
  'short_term',
  'medium_term',
  'long_term',
  'ongoing',
  'unknown',
] as const;

export type GoalHorizon = (typeof GOAL_HORIZONS)[number];

export const GOAL_PLAN_STATUSES = [
  'draft',
  'active',
  'paused',
  'completed',
  'archived',
] as const;

export type GoalPlanStatus = (typeof GOAL_PLAN_STATUSES)[number];

export const GOAL_PLAN_SNAPSHOT_KINDS = [
  'initial',
  'recalculation',
  'action_completed',
  'manual_update',
  'scheduled_review',
  'scenario_applied',
] as const;

export type GoalPlanSnapshotKind = (typeof GOAL_PLAN_SNAPSHOT_KINDS)[number];

export const GOAL_ACTION_STATUSES = ['open', 'completed', 'dismissed', 'expired'] as const;

export type GoalActionStatus = (typeof GOAL_ACTION_STATUSES)[number];

export const GOAL_ACTION_SOURCES = [
  'onboarding',
  'system',
  'scenario',
  'user',
  'recurring_review',
] as const;

export type GoalActionSource = (typeof GOAL_ACTION_SOURCES)[number];

export const GOAL_PACK_INPUT_TYPES = [
  'currency',
  'date',
  'integer',
  'money',
  'percent',
  'select',
  'text',
] as const;

export type GoalPackInputType = (typeof GOAL_PACK_INPUT_TYPES)[number];

export type GoalPackInput = {
  key: string;
  label: string;
  type: GoalPackInputType;
  helperText?: string;
  required: boolean;
};

export type GoalDashboardCardKey =
  | 'activeGoalHero'
  | 'goalProgress'
  | 'planConfidence'
  | 'nextAction'
  | 'planDrivers'
  | 'laterGoals'
  | 'supportingGuardrail'
  | 'recentTransactions';

export type GoalCalculatorKey =
  | 'contributionChange'
  | 'dateChange'
  | 'targetChange'
  | 'debtPayoffComparison'
  | 'categoryCutImpact'
  | 'surplusAllocation';

export type GoalPlanningRuleKey =
  | 'cashFlowCapacity'
  | 'requiredMonthlyContribution'
  | 'projectedCompletionDate'
  | 'confidenceScore'
  | 'debtMethodComparison';

export type GoalActionRuleKey =
  | 'set_recurring_contribution'
  | 'confirm_contribution'
  | 'refine_missing_target'
  | 'review_spending_leak'
  | 'select_debt_method';

export type GoalPackDefinition = {
  type: GoalType;
  label: string;
  description: string;
  lifecycle: 'mvp' | 'deferred';
  requiredInputs: GoalPackInput[];
  optionalInputs: GoalPackInput[];
  dashboardCards: GoalDashboardCardKey[];
  calculators: GoalCalculatorKey[];
  planningRules: GoalPlanningRuleKey[];
  actionRules: GoalActionRuleKey[];
  riskCopy: string;
};

export type GoalPackRegistry = Record<GoalType, GoalPackDefinition>;

export type GoalPlanGoal = Tables<'goals'>;
export type GoalPlanGoalUpdate = TablesUpdate<'goals'>;

export type FinancialPriority = Tables<'financial_priorities'>;
export type FinancialPriorityInsert = TablesInsert<'financial_priorities'>;
export type FinancialPriorityUpdate = TablesUpdate<'financial_priorities'>;

export type GoalPlanSnapshot = Tables<'goal_plan_snapshots'>;
export type GoalPlanSnapshotInsert = TablesInsert<'goal_plan_snapshots'>;

export type GoalAction = Tables<'goal_actions'>;
export type GoalActionInsert = TablesInsert<'goal_actions'>;
export type GoalActionUpdate = TablesUpdate<'goal_actions'>;
