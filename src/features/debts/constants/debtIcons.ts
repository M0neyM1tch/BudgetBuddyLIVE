import {
  Banknote,
  BriefcaseBusiness,
  Car,
  CreditCard,
  GraduationCap,
  House,
  Landmark,
  Shirt,
  ShoppingCart,
  TicketsPlane,
  type LucideIcon,
} from 'lucide-react';
import { DEFAULT_DEBT_ICON, type DebtIconKey } from './debtIconKeys';

export type DebtIconOption = {
  Icon: LucideIcon;
  key: DebtIconKey;
  label: string;
};

export const DEBT_ICON_OPTIONS: DebtIconOption[] = [
  { key: 'shopping-cart', label: 'Shopping', Icon: ShoppingCart },
  { key: DEFAULT_DEBT_ICON, label: 'Credit card', Icon: CreditCard },
  { key: 'house', label: 'Home', Icon: House },
  { key: 'car', label: 'Vehicle', Icon: Car },
  { key: 'landmark', label: 'Bank loan', Icon: Landmark },
  { key: 'graduation', label: 'Education', Icon: GraduationCap },
  { key: 'briefcase', label: 'Business', Icon: BriefcaseBusiness },
  { key: 'banknote', label: 'Cash loan', Icon: Banknote },
  { key: 'shirt', label: 'Personal', Icon: Shirt },
  { key: 'travel', label: 'Travel', Icon: TicketsPlane },
];

export function getDebtIconOption(icon: string | null | undefined): DebtIconOption {
  return DEBT_ICON_OPTIONS.find((option) => option.key === icon) ?? DEBT_ICON_OPTIONS[1];
}
