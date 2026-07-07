export const DEFAULT_DEBT_ICON = 'credit-card';

export const DEBT_ICON_KEYS = [
  'shopping-cart',
  DEFAULT_DEBT_ICON,
  'house',
  'car',
  'landmark',
  'graduation',
  'briefcase',
  'banknote',
  'shirt',
  'travel',
] as const;

export type DebtIconKey = (typeof DEBT_ICON_KEYS)[number];

export function isDebtIconKey(value: string): value is DebtIconKey {
  return DEBT_ICON_KEYS.includes(value as DebtIconKey);
}
