export const DEFAULT_GOAL_ICON = 'piggy-bank';

export const GOAL_ICON_KEYS = [
  DEFAULT_GOAL_ICON,
  'house',
  'target',
  'chart',
  'hand-coins',
  'rocket',
  'dollar',
  'car',
  'plane',
  'graduation',
  'lock',
  'check',
  'crown',
  'store',
  'tag',
  'gift',
  'receipt',
  'banknote-up',
  'badge-dollar',
  'party',
] as const;

export type GoalIconKey = (typeof GOAL_ICON_KEYS)[number];

export function isGoalIconKey(value: string): value is GoalIconKey {
  return GOAL_ICON_KEYS.includes(value as GoalIconKey);
}