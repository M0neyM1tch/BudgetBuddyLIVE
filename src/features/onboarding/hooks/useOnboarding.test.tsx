import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { queryClient } from '../../../shared/api/queryClient';
import { onboardingKeys, useResetOnboardingWithCleanSlate } from './useOnboarding';

const mocks = vi.hoisted(() => ({ resetWorkspace: vi.fn(), userId: 'owner' as string | null }));
vi.mock('../../auth', () => ({ useAuth: () => ({ user: mocks.userId ? { id: mocks.userId } : null }) }));
vi.mock('../api/onboarding.api', () => ({
  resetOnboardingWithCleanSlate: mocks.resetWorkspace,
  completeOnboarding: vi.fn(), fetchOnboardingPreferences: vi.fn(),
  resetOnboardingPreferences: vi.fn(), saveDismissedTooltips: vi.fn(),
}));

const preferences = { user_id: 'owner', onboarding_completed_at: null, dismissed_tooltips: [] };
const defaultOptions = queryClient.getDefaultOptions();
const surfaceKeys = [
  onboardingKeys.preferences('owner'), ['dashboard'], ['transactions'], ['analytics'],
  ['goals'], ['debts'], ['calculator'], ['goal-packs'],
];
function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  queryClient.clear();
  mocks.resetWorkspace.mockReset();
  mocks.userId = 'owner';
  window.localStorage.setItem('bb_dismissed_tooltips', '["keep-until-success"]');
});
afterEach(() => {
  vi.restoreAllMocks();
  queryClient.clear();
  queryClient.setDefaultOptions(defaultOptions);
  window.localStorage.clear();
});

describe('atomic clean-slate reset lifecycle', () => {
  it('cancels stale reads before the RPC and clears local tips only after confirmed success', async () => {
    const cancel = vi.spyOn(queryClient, 'cancelQueries');
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    let resolveReset!: (value: typeof preferences) => void;
    mocks.resetWorkspace.mockImplementation(() => {
      expect(cancel).toHaveBeenCalledTimes(surfaceKeys.length);
      return new Promise((resolve) => { resolveReset = resolve; });
    });
    const { result } = renderHook(() => useResetOnboardingWithCleanSlate(), { wrapper: Wrapper });
    act(() => result.current.mutate());
    await waitFor(() => expect(mocks.resetWorkspace).toHaveBeenCalledWith('owner'));
    expect(window.localStorage.getItem('bb_dismissed_tooltips')).toBe('["keep-until-success"]');
    await act(async () => { resolveReset(preferences); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(window.localStorage.getItem('bb_dismissed_tooltips')).toBe('[]');
    expect(queryClient.getQueryData(onboardingKeys.preferences('owner'))).toEqual(preferences);
    for (const queryKey of surfaceKeys) {
      expect(cancel).toHaveBeenCalledWith({ queryKey });
      expect(invalidate).toHaveBeenCalledWith({ queryKey });
    }
  });

  it('preserves local tips and reconciles all surfaces after an ambiguous failure without retrying', async () => {
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    // An inherited retry policy must never turn a lost response into a second deletion.
    queryClient.setDefaultOptions({ ...defaultOptions, mutations: { retry: 3, retryDelay: 0 } });
    const error = new Error('Network response lost');
    mocks.resetWorkspace.mockRejectedValue(error);
    const { result } = renderHook(() => useResetOnboardingWithCleanSlate(), { wrapper: Wrapper });
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mocks.resetWorkspace).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe(error);
    expect(window.localStorage.getItem('bb_dismissed_tooltips')).toBe('["keep-until-success"]');
    for (const queryKey of surfaceKeys) expect(invalidate).toHaveBeenCalledWith({ queryKey });
  });

  it('does not reset or clear local preferences without a signed-in owner', async () => {
    mocks.userId = null;
    const { result } = renderHook(() => useResetOnboardingWithCleanSlate(), { wrapper: Wrapper });
    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mocks.resetWorkspace).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('bb_dismissed_tooltips')).toBe('["keep-until-success"]');
  });
});
