import { z } from 'zod';
import { DEFAULT_DEBT_ICON, DEBT_ICON_KEYS } from '../constants/debtIconKeys';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid YYYY-MM-DD date.');

const centsSchema = z
  .number()
  .int('Amount must be stored as whole cents.')
  .min(0, 'Amount cannot be negative.')
  .max(100_000_000, 'Amount must be less than $1,000,000.');

export const debtTypeSchema = z.enum([
  'mortgage',
  'car_loan',
  'student_loan',
  'credit_card',
  'line_of_credit',
  'personal_loan',
  'other',
]);

export const paymentFrequencySchema = z.enum([
  'weekly',
  'biweekly',
  'semi_monthly',
  'monthly',
]);

// ✅ Step 1: Raw ZodObject — no refinement, safe to call .partial() on
const debtDraftBaseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100, 'Name must be 100 characters or less.'),
  debt_type: debtTypeSchema.default('personal_loan'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Choose a valid color.')
    .nullable()
    .optional()
    .default('#00ffaa'),
  icon: z.enum(DEBT_ICON_KEYS).default(DEFAULT_DEBT_ICON),
  principal_cents: centsSchema,
  current_balance_cents: centsSchema,
  interest_rate_basis_points: z
    .number()
    .int('Interest rate must be stored as basis points.')
    .min(0, 'Interest rate cannot be negative.')
    .max(10_000, 'Interest rate must be 100% or less.')
    .default(0),
  minimum_payment_cents: centsSchema,
  payment_frequency: paymentFrequencySchema.default('monthly'),
  start_date: isoDateSchema.nullable().optional().transform((value) => value || null),
});

// ✅ Step 2: Full draft schema — refinement applied on top of the base
export const debtDraftSchema = debtDraftBaseSchema.refine(
  (value) =>
    value.principal_cents === 0 || value.current_balance_cents <= value.principal_cents,
  {
    message: 'Current balance cannot exceed the original balance.',
    path: ['current_balance_cents'],
  },
);

// ✅ Step 3: Update schema — .partial() on the base (no refinement), then its own refinement
export const debtUpdateSchema = debtDraftBaseSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one debt field is required.',
  );

export const debtContributionDraftSchema = z.object({
  debt_id: z.string().uuid('Invalid debt ID.'),
  amount_cents: z
    .number()
    .int('Amount must be stored as whole cents.')
    .positive('Payment amount must be greater than zero.')
    .max(100_000_000, 'Amount must be less than $1,000,000.'),
  transaction_date: isoDateSchema,
  description: z.string().trim().max(120).optional().default(''),
  notes: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .transform((value) => value || null),
});
