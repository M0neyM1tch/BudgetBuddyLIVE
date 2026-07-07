import { describe, expect, it } from 'vitest';
import { buildGoalPackMomentumReward } from '../goalPackMomentumModel';

describe('buildGoalPackMomentumReward', () => {
  it('uses action-specific reward copy when available', () => {
    const reward = buildGoalPackMomentumReward({
      action_type: 'set_recurring_contribution',
      impact_label: 'Creates a visible target date.',
      title: 'Set a monthly contribution',
    });

    expect(reward).toEqual({
      body: 'A recurring contribution makes the plan easier to maintain.',
      impactLabel: 'Creates a visible target date.',
      title: 'Set a monthly contribution complete',
    });
  });

  it('falls back to generic momentum copy for unknown action types', () => {
    const reward = buildGoalPackMomentumReward({
      action_type: 'custom-action',
      impact_label: null,
      title: 'Review plan',
    });

    expect(reward).toEqual({
      body: 'The action is complete and BudgetBuddy saved a fresh plan snapshot.',
      impactLabel: 'Plan momentum updated.',
      title: 'Review plan complete',
    });
  });
});
