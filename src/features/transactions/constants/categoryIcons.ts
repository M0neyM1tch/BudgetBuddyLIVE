import {
  Banknote,
  Bus,
  CreditCard,
  Home,
  Landmark,
  PiggyBank,
  Receipt,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

export const TRANSACTION_CATEGORY_ICONS: Record<string, LucideIcon> = {
  debt_payment: CreditCard,
  food: Utensils,
  housing: Home,
  investment: Landmark,
  pay: Banknote,
  savings: PiggyBank,
  subscriptions: Receipt,
  transportation: Bus,
};

export function getCategoryIcon(category: string): LucideIcon {
  return TRANSACTION_CATEGORY_ICONS[category] ?? Receipt;
}
