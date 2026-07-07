import type { Enums, Tables, TablesInsert, TablesUpdate } from '../../../types/database.types';

export type Transaction = Tables<'transactions'>;
export type TransactionInsert = TablesInsert<'transactions'>;
export type TransactionUpdate = TablesUpdate<'transactions'>;

export type RecurringRule = Tables<'recurring_rules'>;
export type RecurringRuleInsert = TablesInsert<'recurring_rules'>;
export type RecurringRuleUpdate = TablesUpdate<'recurring_rules'>;

export type UserPreferences = Tables<'user_preferences'>;

export type TransactionKind = Enums<'transaction_kind'>;
export type TransactionSource = Enums<'transaction_source'>;
export type RecurringFrequency = Enums<'recurring_frequency'>;

export type SupportedTransactionKind = Extract<TransactionKind, 'income' | 'expense'>;

export type TransactionCategory = {
  value: string;
  label: string;
  group: 'Income' | 'Needs' | 'Lifestyle' | 'Planning' | 'Debt';
};

export type TransactionFilters = {
  from?: string;
  to?: string;
  category?: string;
  debt_id?: string | null;
  kind?: SupportedTransactionKind;
  amountMin?: number;
  amountMax?: number;
  q?: string;
};

export type TransactionPage = {
  rows: Transaction[];
  count: number;
  page: number;
  pageSize: number;
};

export type TransactionDraft = {
  amount_cents: number;
  kind: TransactionKind;
  category: string;
  transaction_date: string;
  description: string;
  notes: string | null;
  source: Extract<TransactionSource, 'manual' | 'recurring'>;
  debt_id?: string | null;
  goal_id?: string | null;
  recurring_rule_id?: string | null;
  recurring_frequency?: RecurringFrequency;
  recurring_start_date?: string;
  recurring_notes?: string | null;
};

export type RecurringRuleDraft = {
  amount_cents: number;
  kind: TransactionKind;
  category: string;
  debt_id?: string | null;
  description: string;
  frequency: RecurringFrequency;
  start_date: string;
  next_run_date: string;
  day_of_month: number | null;
  is_active: boolean;
  notes: string | null;
  skip_backdate?: boolean;
};

export type QuickAddChip = {
  id: string;
  label: string;
  description: string;
  amount_cents: number;
  kind: SupportedTransactionKind;
  category: string;
};

export type TransactionSummary = {
  income_cents: number;
  expense_cents: number;
  net_cents: number;
};

export type RecurringProcessResult = {
  created: number;
  processedRules: number;
  limited: boolean;
  skippedPaused: number;
  pausedRuleNames: string[];
};
