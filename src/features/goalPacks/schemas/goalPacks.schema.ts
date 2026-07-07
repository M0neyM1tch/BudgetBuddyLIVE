import { z } from 'zod';
import {
  GOAL_ACTION_SOURCES,
  GOAL_ACTION_STATUSES,
  GOAL_HORIZONS,
  GOAL_PLAN_SNAPSHOT_KINDS,
  GOAL_PLAN_STATUSES,
  GOAL_TYPES,
} from '../types/goalPacks.types';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid YYYY-MM-DD date.');

const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true, message: 'Use a valid ISO date-time.' });

const nonNegativeCentsSchema = z
  .number()
  .int('Amount must be stored as whole cents.')
  .min(0, 'Amount cannot be negative.')
  .max(100_000_000_000, 'Amount is too large.');

const confidenceScoreSchema = z
  .number()
  .int('Confidence must be a whole number.')
  .min(0, 'Confidence cannot be below 0.')
  .max(100, 'Confidence cannot be above 100.');

const jsonObjectSchema = z.record(z.string(), z.unknown());
const jsonObjectArraySchema = z.array(jsonObjectSchema);

const countryCodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z]{2,3}$/i, 'Use a 2 or 3 letter country code.')
  .transform((value) => value.toUpperCase());

const regionCodeSchema = z.string().trim().min(1).max(12);

const currencyCodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z]{3}$/i, 'Use a 3 letter currency code.')
  .transform((value) => value.toUpperCase());

const optionalTextSchema = (maxLength: number) => z.string().trim().min(1).max(maxLength);

function hasDefinedValue(value: Record<string, unknown>) {
  return Object.values(value).some((fieldValue) => fieldValue !== undefined);
}

export const goalTypeSchema = z.enum(GOAL_TYPES);
export const goalHorizonSchema = z.enum(GOAL_HORIZONS);
export const goalPlanStatusSchema = z.enum(GOAL_PLAN_STATUSES);
export const goalPlanSnapshotKindSchema = z.enum(GOAL_PLAN_SNAPSHOT_KINDS);
export const goalActionStatusSchema = z.enum(GOAL_ACTION_STATUSES);
export const goalActionSourceSchema = z.enum(GOAL_ACTION_SOURCES);

export const goalPlanGoalUpdateSchema = z
  .object({
    goal_type: goalTypeSchema.optional(),
    priority_rank: z.number().int().positive().max(50).nullable().optional(),
    monthly_commitment_cents: nonNegativeCentsSchema.nullable().optional(),
    confidence_score: confidenceScoreSchema.nullable().optional(),
    plan_status: goalPlanStatusSchema.optional(),
    planning_rules: jsonObjectSchema.optional(),
    last_plan_calculated_at: isoDateTimeSchema.nullable().optional(),
  })
  .refine(hasDefinedValue, 'At least one goal planning field is required.');

export const financialPriorityDraftSchema = z.object({
  active_goal_id: z.string().uuid().nullable().optional(),
  top_priority_type: goalTypeSchema.default('custom'),
  horizon: goalHorizonSchema.default('unknown'),
  country_code: countryCodeSchema.nullable().optional(),
  region_code: regionCodeSchema.nullable().optional(),
  currency_code: currencyCodeSchema.default('CAD'),
  monthly_income_cents: nonNegativeCentsSchema.nullable().optional(),
  monthly_expenses_cents: nonNegativeCentsSchema.nullable().optional(),
});

export const financialPriorityUpdateSchema = z
  .object({
    active_goal_id: z.string().uuid().nullable().optional(),
    top_priority_type: goalTypeSchema.optional(),
    horizon: goalHorizonSchema.optional(),
    country_code: countryCodeSchema.nullable().optional(),
    region_code: regionCodeSchema.nullable().optional(),
    currency_code: currencyCodeSchema.optional(),
    monthly_income_cents: nonNegativeCentsSchema.nullable().optional(),
    monthly_expenses_cents: nonNegativeCentsSchema.nullable().optional(),
  })
  .refine(hasDefinedValue, 'At least one priority field is required.');

export const goalPlanSnapshotDraftSchema = z.object({
  goal_id: z.string().uuid(),
  snapshot_kind: goalPlanSnapshotKindSchema.default('recalculation'),
  progress_percent: z.number().min(0).max(100).default(0),
  projected_completion_date: isoDateSchema.nullable().optional(),
  required_monthly_cents: nonNegativeCentsSchema.nullable().optional(),
  current_monthly_capacity_cents: nonNegativeCentsSchema.nullable().optional(),
  confidence_score: confidenceScoreSchema.default(0),
  drivers: jsonObjectArraySchema.default([]),
  recommendations: jsonObjectArraySchema.default([]),
});

export const goalActionDraftSchema = z.object({
  goal_id: z.string().uuid().nullable().optional(),
  action_type: optionalTextSchema(80),
  title: optionalTextSchema(140),
  description: optionalTextSchema(500).nullable().optional(),
  impact_label: optionalTextSchema(140).nullable().optional(),
  impact_value: jsonObjectSchema.default({}),
  source: goalActionSourceSchema.default('system'),
  status: goalActionStatusSchema.default('open'),
  due_at: isoDateTimeSchema.nullable().optional(),
  completed_at: isoDateTimeSchema.nullable().optional(),
  dismissed_at: isoDateTimeSchema.nullable().optional(),
});

export const goalActionUpdateSchema = z
  .object({
    goal_id: z.string().uuid().nullable().optional(),
    action_type: optionalTextSchema(80).optional(),
    title: optionalTextSchema(140).optional(),
    description: optionalTextSchema(500).nullable().optional(),
    impact_label: optionalTextSchema(140).nullable().optional(),
    impact_value: jsonObjectSchema.optional(),
    source: goalActionSourceSchema.optional(),
    status: goalActionStatusSchema.optional(),
    due_at: isoDateTimeSchema.nullable().optional(),
    completed_at: isoDateTimeSchema.nullable().optional(),
    dismissed_at: isoDateTimeSchema.nullable().optional(),
  })
  .refine(hasDefinedValue, 'At least one action field is required.');

export type GoalPlanGoalUpdateDraft = z.input<typeof goalPlanGoalUpdateSchema>;
export type FinancialPriorityDraft = z.input<typeof financialPriorityDraftSchema>;
export type FinancialPriorityUpdateDraft = z.input<typeof financialPriorityUpdateSchema>;
export type GoalPlanSnapshotDraft = z.input<typeof goalPlanSnapshotDraftSchema>;
export type GoalActionDraft = z.input<typeof goalActionDraftSchema>;
export type GoalActionUpdateDraft = z.input<typeof goalActionUpdateSchema>;
