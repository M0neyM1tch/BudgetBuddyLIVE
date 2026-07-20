import type { GoalAction } from '../types/goalPacks.types';

export type GoalPackMomentumReward = {
  body: string;
  impactLabel: string;
  title: string;
};

const ACTION_REWARD_COPY: Record<string, string> = {
  confirm_contribution: 'Progress confirmed and the plan snapshot is current.',
  refine_missing_target: 'The goal is clearer, so future plan prompts can be sharper.',
  review_spending_leak: 'A spending review turned into visible plan momentum.',
  select_debt_method: 'The debt payoff plan has a clearer next step.',
  set_recurring_contribution: 'A recurring contribution makes the plan easier to maintain.',
};

export function buildGoalPackMomentumReward(
  action: Pick<GoalAction, 'action_type' | 'impact_label' | 'title'>,
): GoalPackMomentumReward {
  return {
    body:
      ACTION_REWARD_COPY[action.action_type] ??
      'The action is complete and BudgBeacon saved a fresh plan snapshot.',
    impactLabel: action.impact_label ?? 'Plan momentum updated.',
    title: `${action.title} complete`,
  };
}
