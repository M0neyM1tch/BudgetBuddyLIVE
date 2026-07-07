import { Constants } from '../../types/database.types';

// Re-export DB enums as runtime arrays for use in dropdowns/forms
export const DEBT_TYPES = Constants.public.Enums.debt_type;
export const PAYMENT_FREQUENCIES = Constants.public.Enums.payment_frequency;
export const RECURRING_FREQUENCIES = Constants.public.Enums.recurring_frequency;
export const TRANSACTION_KINDS = Constants.public.Enums.transaction_kind;
export const TRANSACTION_SOURCES = Constants.public.Enums.transaction_source;

export const CURRENCY_DEFAULT = 'CAD';

export const QUERY_KEYS = {
  transactions: 'transactions',
  goals: 'goals',
  debts: 'debts',
  recurringRules: 'recurring-rules',
  dashboard: 'dashboard',
  profile: 'profile',
  preferences: 'preferences',
} as const;