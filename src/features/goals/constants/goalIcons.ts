import {
  BadgeDollarSign,
  BanknoteArrowUp,
  CarFront,
  ChartNoAxesCombined,
  CircleCheck,
  CircleDollarSign,
  Crown,
  Gift,
  Goal,
  GraduationCap,
  HandCoins,
  House,
  LockKeyhole,
  PartyPopper,
  PiggyBank,
  PlaneTakeoff,
  Receipt,
  Rocket,
  Store,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { DEFAULT_GOAL_ICON, type GoalIconKey } from './goalIconKeys';

export type GoalIconOption = {
  Icon: LucideIcon;
  key: GoalIconKey;
  label: string;
};

export const GOAL_ICON_OPTIONS: GoalIconOption[] = [
  { key: DEFAULT_GOAL_ICON, label: 'Savings',   Icon: PiggyBank },
  { key: 'house',           label: 'Home',       Icon: House },
  { key: 'target',          label: 'Goal',       Icon: Goal },
  { key: 'chart',           label: 'Growth',     Icon: ChartNoAxesCombined },
  { key: 'hand-coins',      label: 'Income',     Icon: HandCoins },
  { key: 'rocket',          label: 'Launch',     Icon: Rocket },
  { key: 'dollar',          label: 'Money',      Icon: CircleDollarSign },
  { key: 'car',             label: 'Vehicle',    Icon: CarFront },
  { key: 'plane',           label: 'Travel',     Icon: PlaneTakeoff },
  { key: 'graduation',      label: 'Education',  Icon: GraduationCap },
  { key: 'lock',            label: 'Security',   Icon: LockKeyhole },
  { key: 'check',           label: 'Complete',   Icon: CircleCheck },
  { key: 'crown',           label: 'Milestone',  Icon: Crown },
  { key: 'store',           label: 'Shopping',   Icon: Store },
  { key: 'tag',             label: 'Budget',     Icon: Tag },
  { key: 'gift',            label: 'Gift',       Icon: Gift },
  { key: 'receipt',         label: 'Bills',      Icon: Receipt },
  { key: 'banknote-up',     label: 'Invest',     Icon: BanknoteArrowUp },
  { key: 'badge-dollar',    label: 'Reward',     Icon: BadgeDollarSign },
  { key: 'party',           label: 'Celebrate',  Icon: PartyPopper },
];

export function getGoalIconOption(icon: string | null | undefined): GoalIconOption {
  return GOAL_ICON_OPTIONS.find((option) => option.key === icon) ?? GOAL_ICON_OPTIONS[0];
}