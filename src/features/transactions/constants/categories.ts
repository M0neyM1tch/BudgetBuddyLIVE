import type {
  QuickAddChip,
  TransactionCategory,
  SupportedTransactionKind,
} from '../types/transactions.types';

export const TRANSACTION_CATEGORIES = [
  { value: 'pay', label: 'Pay', group: 'Income' },
  { value: 'housing', label: 'Rent/housing', group: 'Needs' },
  { value: 'food', label: 'Food', group: 'Needs' },
  { value: 'savings', label: 'Savings', group: 'Planning' },
  { value: 'debt_payment', label: 'Debt payment', group: 'Debt' },
  { value: 'investment', label: 'Investment', group: 'Planning' },
  { value: 'subscriptions', label: 'Subscriptions', group: 'Lifestyle' },
  { value: 'transportation', label: 'Transportation', group: 'Needs' },
] as const satisfies readonly TransactionCategory[];

export const TRANSACTION_CATEGORY_VALUES = TRANSACTION_CATEGORIES.map(
  (category) => category.value,
) as [string, ...string[]];

export const TRANSACTION_KIND_OPTIONS = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
] as const satisfies readonly { value: SupportedTransactionKind; label: string }[];

export const RECURRING_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'semi_monthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

export const DEFAULT_QUICK_ADD_CHIPS = [
  {
    id: 'coffee',
    label: 'Coffee',
    description: '',
    amount_cents: 550,
    kind: 'expense',
    category: 'food',
  },
  {
    id: 'groceries',
    label: 'Groceries',
    description: '',
    amount_cents: 8500,
    kind: 'expense',
    category: 'food',
  },
  {
    id: 'fuel',
    label: 'Fuel',
    description: '',
    amount_cents: 6500,
    kind: 'expense',
    category: 'transportation',
  },
  {
    id: 'paycheck',
    label: 'Pay',
    description: '',
    amount_cents: 150000,
    kind: 'income',
    category: 'pay',
  },
] as const satisfies readonly QuickAddChip[];

export function getCategoryLabel(value: string): string {
  return TRANSACTION_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

export function getKindLabel(value: SupportedTransactionKind): string {
  return TRANSACTION_KIND_OPTIONS.find((kind) => kind.value === value)?.label ?? value;
}

export function getFrequencyLabel(value: string): string {
  return RECURRING_FREQUENCY_OPTIONS.find((frequency) => frequency.value === value)?.label ?? value;
}
