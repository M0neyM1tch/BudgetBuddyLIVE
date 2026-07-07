import { describe, expect, it } from 'vitest';
import {
  getDeferredGoalPackDefinitions,
  getMvpGoalPackDefinitions,
  GOAL_PACK_REGISTRY,
  isGoalType,
  isMvpGoalPackType,
} from '../goalPackRegistry';
import {
  DEFERRED_GOAL_PACK_TYPES,
  GOAL_TYPES,
  MVP_GOAL_PACK_TYPES,
} from '../../types/goalPacks.types';

describe('Goal Pack registry', () => {
  it('defines every supported goal type exactly once', () => {
    expect(Object.keys(GOAL_PACK_REGISTRY).sort()).toEqual([...GOAL_TYPES].sort());
  });

  it('keeps MVP and deferred packs separated', () => {
    expect(getMvpGoalPackDefinitions().map((pack) => pack.type)).toEqual([
      ...MVP_GOAL_PACK_TYPES,
    ]);
    expect(getDeferredGoalPackDefinitions().map((pack) => pack.type)).toEqual([
      ...DEFERRED_GOAL_PACK_TYPES,
    ]);
  });

  it('guards supported goal types', () => {
    expect(isGoalType('debt_payoff')).toBe(true);
    expect(isGoalType('fhsa_optimizer')).toBe(false);
    expect(isMvpGoalPackType('major_purchase')).toBe(true);
  });
});
