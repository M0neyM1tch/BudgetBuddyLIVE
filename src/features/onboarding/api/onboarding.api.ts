import { AppError, normalizeError } from '../../../shared/api/errors';
import { supabase } from '../../../shared/lib/supabase';
import type { OnboardingPreferences } from '../types/onboarding.types';

function raise(error: unknown, fallback = 'Onboarding request failed'): never {
  const normalized = normalizeError(error);
  throw new AppError(normalized.message || fallback, normalized.code, normalized.status);
}

function normalizeDismissedTooltips(value: string[] | null | undefined): string[] {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export async function fetchOnboardingPreferences(
  userId: string,
): Promise<OnboardingPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('user_id,onboarding_completed_at,dismissed_tooltips')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) raise(error, 'Unable to load onboarding preferences');

  return {
    user_id: userId,
    onboarding_completed_at: data?.onboarding_completed_at ?? null,
    dismissed_tooltips: normalizeDismissedTooltips(data?.dismissed_tooltips),
  };
}

export async function completeOnboarding(
  userId: string,
  completedAt = new Date().toISOString(),
): Promise<OnboardingPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        onboarding_completed_at: completedAt,
      },
      { onConflict: 'user_id' },
    )
    .select('user_id,onboarding_completed_at,dismissed_tooltips')
    .single();

  if (error) raise(error, 'Unable to save onboarding status');

  return {
    user_id: userId,
    onboarding_completed_at: data.onboarding_completed_at,
    dismissed_tooltips: normalizeDismissedTooltips(data.dismissed_tooltips),
  };
}

export async function saveDismissedTooltips(
  userId: string,
  tooltipIds: string[],
): Promise<OnboardingPreferences> {
  const dismissed = Array.from(new Set(tooltipIds.filter(Boolean)));
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        dismissed_tooltips: dismissed,
      },
      { onConflict: 'user_id' },
    )
    .select('user_id,onboarding_completed_at,dismissed_tooltips')
    .single();

  if (error) raise(error, 'Unable to save tooltip preferences');

  return {
    user_id: userId,
    onboarding_completed_at: data.onboarding_completed_at,
    dismissed_tooltips: normalizeDismissedTooltips(data.dismissed_tooltips),
  };
}

export async function resetOnboardingPreferences(userId: string): Promise<OnboardingPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        onboarding_completed_at: null,
        dismissed_tooltips: [],
      },
      { onConflict: 'user_id' },
    )
    .select('user_id,onboarding_completed_at,dismissed_tooltips')
    .single();

  if (error) raise(error, 'Unable to reset onboarding');

  return {
    user_id: userId,
    onboarding_completed_at: data.onboarding_completed_at,
    dismissed_tooltips: normalizeDismissedTooltips(data.dismissed_tooltips),
  };
}

export async function resetOnboardingWithCleanSlate(
  userId: string,
): Promise<OnboardingPreferences> {
  const unconfirmedMessage = 'The reset could not be confirmed. Refresh your workspace before trying again.';
  // The server derives the owner from auth.uid(); the UI identity is checked
  // against the response, never supplied as authority to the reset function.
  const { data, error } = await supabase
    .rpc('reset_onboarding_with_clean_slate')
    .single();

  if (error) {
    const normalized = normalizeError(error);
    if (!/^(?:[A-Z0-9]{5}|PGRST\d+)$/.test(normalized.code)) {
      throw new AppError(unconfirmedMessage, 'RESET_NOT_CONFIRMED');
    }
    raise(normalized, 'Unable to reset onboarding with a clean slate');
  }
  if (!data || data.user_id !== userId || data.onboarding_completed_at !== null) {
    throw new AppError(unconfirmedMessage, 'RESET_NOT_CONFIRMED');
  }

  return {
    user_id: data.user_id,
    onboarding_completed_at: data.onboarding_completed_at,
    dismissed_tooltips: normalizeDismissedTooltips(data.dismissed_tooltips),
  };
}
