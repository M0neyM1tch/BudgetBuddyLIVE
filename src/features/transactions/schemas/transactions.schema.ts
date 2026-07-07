import { z } from 'zod';
import {
  RECURRING_FREQUENCY_OPTIONS,
  TRANSACTION_CATEGORY_VALUES,
} from '../constants/categories';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid YYYY-MM-DD date.');

const amountCentsSchema = z
  .number()
  .int('Amount must be stored as whole cents.')
  .positive('Amount must be greater than zero.')
  .max(100_000_000, 'Amount must be less than $1,000,000.');

const amountDollarsFilterSchema = z.coerce
  .number()
  .min(0, 'Amount must be zero or greater.')
  .max(1_000_000, 'Amount must be less than $1,000,000.');

export const transactionKindSchema = z.enum(['income', 'expense', 'transfer']);
export const supportedTransactionKindSchema = z.enum(['income', 'expense']);
export const transactionCategorySchema = z.enum(TRANSACTION_CATEGORY_VALUES);
export const recurringFrequencySchema = z.enum(
  RECURRING_FREQUENCY_OPTIONS.map((frequency) => frequency.value) as [
    'weekly',
    'biweekly',
    'semi_monthly',
    'monthly',
  ],
);

export const transactionFiltersSchema = z
  .object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    category: transactionCategorySchema.optional(),
    debt_id: z.string().uuid().nullable().optional(),
    kind: supportedTransactionKindSchema.optional(),
    amountMin: amountDollarsFilterSchema.optional(),
    amountMax: amountDollarsFilterSchema.optional(),
    q: z.string().trim().max(80).optional(),
  })
  .refine(
    (filters) => !filters.from || !filters.to || filters.from <= filters.to,
    { message: 'Start date must be before end date.', path: ['from'] },
  )
  .refine(
    (filters) =>
      filters.amountMin == null ||
      filters.amountMax == null ||
      filters.amountMin <= filters.amountMax,
    { message: 'Minimum amount must be less than maximum amount.', path: ['amountMin'] },
  );

export const transactionDraftSchema = z.object({
  amount_cents: amountCentsSchema,
  kind: transactionKindSchema,
  category: transactionCategorySchema,
  transaction_date: isoDateSchema,
  description: z.string().trim().max(120).optional().default(''),
  notes: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .transform((value) => value || null),
  source: z.enum(['manual', 'recurring']).default('manual'),
  goal_id: z.string().uuid().nullable().optional(),
  debt_id: z.string().uuid().nullable().optional(),
  recurring_rule_id: z.string().uuid().nullable().optional(),
  recurring_frequency: recurringFrequencySchema.optional(),
  recurring_start_date: isoDateSchema.optional(),
  recurring_notes: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .transform((value) => value || null),
});

export const transactionUpdateSchema = transactionDraftSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one transaction field is required.',
);

export const recurringRuleDraftSchema = z.object({
  amount_cents: amountCentsSchema,
  kind: transactionKindSchema,
  category: transactionCategorySchema,
  debt_id: z.string().uuid().nullable().optional(),
  description: z.string().trim().max(120).optional().default(''),
  frequency: recurringFrequencySchema,
  start_date: isoDateSchema,
  next_run_date: isoDateSchema,
  day_of_month: z.number().int().min(1).max(31).nullable(),
  is_active: z.boolean().default(true),
  notes: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .transform((value) => value || null),
  skip_backdate: z.boolean().optional().default(false),
});

export const recurringRuleUpdateSchema = recurringRuleDraftSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one recurring rule field is required.',
);

export const quickAddChipSchema = z.object({
  id: z.string().trim().min(1).max(48),
  label: z.string().trim().min(1).max(24),
  description: z.string().trim().max(80).optional().default(''),
  amount_cents: amountCentsSchema,
  kind: supportedTransactionKindSchema,
  category: transactionCategorySchema,
});

export const quickAddChipsSchema = z.array(quickAddChipSchema).max(6);
