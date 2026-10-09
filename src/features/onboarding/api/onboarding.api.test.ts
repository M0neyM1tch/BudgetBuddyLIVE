import { beforeEach, describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
const upsertMock = vi.fn();
const rpcMock = vi.fn();
const rpcSingleMock = vi.fn();

vi.mock('../../../shared/lib/supabase', () => ({
  supabase: {
    from: fromMock,
    rpc: rpcMock,
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

    throw new Error(`Unexpected table request: ${table}`);
  });
}

beforeEach(() => {
  fromMock.mockReset();
  upsertMock.mockReset();
  rpcMock.mockReset().mockReturnValue({ single: rpcSingleMock });
  rpcSingleMock.mockReset();
});

describe('onboarding preference reset contract', () => {
  it('uses one owner-derived reset RPC without independent deletes or preference writes', async () => {
    rpcSingleMock.mockResolvedValue({
      data: { user_id: 'user-id', onboarding_completed_at: null, dismissed_tooltips: [] },
      error: null,
    });

    const preferences = await resetOnboardingWithCleanSlate('user-id');

    expect(rpcMock).toHaveBeenCalledExactlyOnceWith('reset_onboarding_with_clean_slate');
    expect(fromMock).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
    expect(preferences.onboarding_completed_at).toBeNull();
    expect(preferences.dismissed_tooltips).toEqual([]);
  });

  it.each([
    ['a lock conflict', { code: '55P03', message: 'Another reset is in progress. Refresh and try again.' }],
    ['a failed final preference write', { code: '23514', message: 'Preference update failed' }],
    ['an unavailable migration', { code: 'PGRST202', message: 'Reset is unavailable' }],
  ])('surfaces %s without falling back to separate destructive requests', async (_label, error) => {
    rpcSingleMock.mockResolvedValue({ data: null, error });
    await expect(resetOnboardingWithCleanSlate('user-id')).rejects.toMatchObject(error);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it.each([
    null,
    { user_id: 'different-user', onboarding_completed_at: null, dismissed_tooltips: [] },
    { user_id: 'user-id', onboarding_completed_at: '2026-10-08T00:00:00Z', dismissed_tooltips: [] },
  ])('does not confirm reset from a missing, wrong-owner or incomplete response', async (data) => {
    rpcSingleMock.mockResolvedValue({ data, error: null });
    await expect(resetOnboardingWithCleanSlate('user-id')).rejects.toMatchObject({ code: 'RESET_NOT_CONFIRMED' });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('describes a lost network response as unconfirmed and does not repeat the reset', async () => {
    rpcSingleMock.mockResolvedValue({ data: null, error: { code: '', message: 'Failed to fetch' } });
    await expect(resetOnboardingWithCleanSlate('user-id')).rejects.toMatchObject({
      code: 'RESET_NOT_CONFIRMED',
      message: 'The reset could not be confirmed. Refresh your workspace before trying again.',
    });
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(fromMock).not.toHaveBeenCalled();
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
