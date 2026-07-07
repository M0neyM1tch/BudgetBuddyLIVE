import type { DebtType, PaymentFrequency } from '../types/debts.types';

export const DEBT_TYPE_OPTIONS = [
  { value: 'credit_card', label: 'Credit card' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'car_loan', label: 'Car loan' },
  { value: 'student_loan', label: 'Student loan' },
  { value: 'line_of_credit', label: 'Line of credit' },
  { value: 'personal_loan', label: 'Personal loan' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly { value: DebtType; label: string }[];

export const PAYMENT_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'semi_monthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
] as const satisfies readonly { value: PaymentFrequency; label: string }[];

export function getDebtTypeLabel(value: DebtType): string {
  return DEBT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getPaymentFrequencyLabel(value: PaymentFrequency): string {
  return PAYMENT_FREQUENCY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
