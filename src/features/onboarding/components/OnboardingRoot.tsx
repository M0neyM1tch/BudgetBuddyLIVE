import { lazy, Suspense } from 'react';
import { env } from '../../../shared/lib/env';
import { OnboardingWizard } from './OnboardingWizard';
import { useOnboardingPreferences } from '../hooks/useOnboarding';
import './Onboarding.css';

const GoalPackOnboardingWizard = lazy(() =>
  import('./GoalPackOnboardingWizard').then((module) => ({
    default: module.GoalPackOnboardingWizard,
  })),
);

export function OnboardingRoot() {
  const preferencesQuery = useOnboardingPreferences();
  const shouldShowWizard =
    Boolean(preferencesQuery.data) &&
    preferencesQuery.data?.onboarding_completed_at === null;

  if (env.features.goalPacksEnabled) {
    return (
      <Suspense fallback={null}>
        <GoalPackOnboardingWizard isOpen={shouldShowWizard} />
      </Suspense>
    );
  }

  return <OnboardingWizard isOpen={shouldShowWizard} />;
}
