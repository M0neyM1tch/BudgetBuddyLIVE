import { beforeEach, describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
const upsertMock = vi.fn();
const deletedTables: string[] = [];

vi.mock('../../../shared/lib/supabase', () => ({
  supabase: {
    from: fromMock,
  },
}));

const {
  completeOnboarding,
  resetOnboardingPreferences,
  resetOnboardingWithCleanSlate,
} = await import('./onboarding.api');

function configurePreferenceResponse(onboardingCompletedAt: string | null) {
  upsertMock.mockImplementation((payload: Record<string, unknown>) => {
    return {
      payload,
      select: () => ({
        single: async () => ({
          data: {
            dismissed_tooltips: [],
            onboarding_completed_at: onboardingCompletedAt,
            user_id: 'user-id',
          },
          error: null,
        }),
      }),
    };
  });

  fromMock.mockImplementation((table: string) => {
    if (table === 'user_preferences') {
      return { upsert: upsertMock };
    }

    return {
      delete: () => ({
        eq: async () => {
          deletedTables.push(table);
          return { error: null };
        },
      }),
    };
  });
}

beforeEach(() => {
  fromMock.mockReset();
  upsertMock.mockReset();
  deletedTables.length = 0;
});

describe('onboarding preference reset contract', () => {
  it('persists a null completion state and returns the same state for clean-slate reset', async () => {
    configurePreferenceResponse(null);

    const preferences = await resetOnboardingWithCleanSlate('user-id');

    expect(upsertMock).toHaveBeenCalledWith(
      {
        dismissed_tooltips: [],
        onboarding_completed_at: null,
        quick_add_chips: [],
        user_id: 'user-id',
      },
      { onConflict: 'user_id' },
    );
    expect(preferences.onboarding_completed_at).toBeNull();
    expect(deletedTables).toEqual([
      'goal_actions',
      'goal_plan_snapshots',
      'financial_priorities',
      'transactions',
      'recurring_rules',
      'goals',
      'debts',
    ]);
  });

  it('keeps repeated clean-slate resets idempotent', async () => {
    configurePreferenceResponse(null);

    const first = await resetOnboardingWithCleanSlate('user-id');
    const second = await resetOnboardingWithCleanSlate('user-id');

    expect(first.onboarding_completed_at).toBeNull();
    expect(second.onboarding_completed_at).toBeNull();
    expect(upsertMock).toHaveBeenCalledTimes(2);
  });

  it('continues to persist a fresh timestamp for normal completion', async () => {
    const completedAt = '2026-08-09T00:00:00.000Z';
    configurePreferenceResponse(completedAt);

    const preferences = await completeOnboarding('user-id', completedAt);

    expect(upsertMock).toHaveBeenCalledWith(
      {
        onboarding_completed_at: completedAt,
        user_id: 'user-id',
      },
      { onConflict: 'user_id' },
    );
    expect(preferences.onboarding_completed_at).toBe(completedAt);
  });

  it('keeps the standard onboarding reset null', async () => {
    configurePreferenceResponse(null);

    const preferences = await resetOnboardingPreferences('user-id');

    expect(upsertMock).toHaveBeenCalledWith(
      {
        dismissed_tooltips: [],
        onboarding_completed_at: null,
        user_id: 'user-id',
      },
      { onConflict: 'user_id' },
    );
    expect(preferences.onboarding_completed_at).toBeNull();
  });
});
