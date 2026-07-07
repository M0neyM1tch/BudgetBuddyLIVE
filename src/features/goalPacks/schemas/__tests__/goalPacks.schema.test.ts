import { describe, expect, it } from 'vitest';
import {
  financialPriorityDraftSchema,
  goalActionUpdateSchema,
  goalPlanGoalUpdateSchema,
  goalPlanSnapshotDraftSchema,
} from '../goalPacks.schema';

describe('Goal Pack schemas', () => {
  it('normalizes financial priority location and currency codes', () => {
    const parsed = financialPriorityDraftSchema.parse({
      top_priority_type: 'emergency_fund',
      horizon: 'short_term',
      country_code: 'ca',
      currency_code: 'cad',
      monthly_income_cents: 500_000,
    });

    expect(parsed).toMatchObject({
      top_priority_type: 'emergency_fund',
      horizon: 'short_term',
      country_code: 'CA',
      currency_code: 'CAD',
      monthly_income_cents: 500_000,
    });
  });

  it('rejects confidence scores outside the planning range', () => {
    const parsed = goalPlanGoalUpdateSchema.safeParse({
      confidence_score: 101,
    });

    expect(parsed.success).toBe(false);
  });

  it('defaults snapshot arrays so a minimal plan snapshot is valid', () => {
    const parsed = goalPlanSnapshotDraftSchema.parse({
      goal_id: '00000000-0000-4000-8000-000000000001',
    });

    expect(parsed).toMatchObject({
      snapshot_kind: 'recalculation',
      progress_percent: 0,
      confidence_score: 0,
      drivers: [],
      recommendations: [],
    });
  });

  it('rejects empty action updates', () => {
    const parsed = goalActionUpdateSchema.safeParse({});

    expect(parsed.success).toBe(false);
  });
});
