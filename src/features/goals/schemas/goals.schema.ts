import { z } from 'zod';
import { DEFAULT_GOAL_ICON, GOAL_ICON_KEYS } from '../constants/goalIconKeys';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid YYYY-MM-DD date.');

const amountCentsSchema = z
  .number()
  .int('Amount must be stored as whole cents.')
  .positive('Amount must be greater than zero.')
  .max(100_000_000, 'Amount must be less than $1,000,000.');

const optionalTextSchema = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .optional()
  .transform((value) => value || null);

export const goalDraftSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100, 'Name must be 100 characters or less.'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Choose a valid color.')
    .nullable()
    .optional()
    .default('#10b981'),
  icon: z.enum(GOAL_ICON_KEYS).default(DEFAULT_GOAL_ICON),
  target_amount_cents: amountCentsSchema,
  starting_balance_cents: z
    .number()
    .int('Starting balance must be stored as whole cents.')
    .min(0, 'Starting balance cannot be negative.')
    .max(100_000_000, 'Starting balance must be less than $1,000,000.')
    .default(0),
  target_date: isoDateSchema.nullable().optional().transform((value) => value || null),
});

export const goalUpdateSchema = goalDraftSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one goal field is required.',
);

export const goalContributionDraftSchema = z.object({
  goal_id: z.string().uuid(),
  amount_cents: amountCentsSchema,
  transaction_date: isoDateSchema,
  description: z.string().trim().max(120).optional().default(''),
  notes: optionalTextSchema,
});
