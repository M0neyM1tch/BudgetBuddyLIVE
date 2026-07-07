import { RotateCcw } from 'lucide-react';
import { normalizeError } from '../../../shared/api/errors';
import { Button } from '../../../shared/components/ui/Button';
import { useResetOnboarding } from '../../onboarding';
import './PreferencesPage.css';

export function PreferencesPage() {
  const resetOnboardingMutation = useResetOnboarding();
  const errorMessage = resetOnboardingMutation.error
    ? normalizeError(resetOnboardingMutation.error).message
    : null;

  return (
    <section className="page preferences-page" aria-labelledby="preferences-title">
      <div className="page-header">
        <div>
          <p className="page-kicker">Account</p>
          <h2 id="preferences-title" className="page-title">
            Preferences
          </h2>
          <p className="page-description">
            Manage lightweight guidance controls for this BudgetBuddy workspace.
          </p>
        </div>
      </div>

      <section className="preferences-panel" aria-labelledby="onboarding-settings-title">
        <div>
          <h3 id="onboarding-settings-title">Guided setup</h3>
          <p>
            Restart the welcome wizard and show first-use tooltips again. This is useful
            for testing or revisiting the core workflow.
          </p>
          {errorMessage ? <p className="preferences-error" role="alert">{errorMessage}</p> : null}
        </div>
        <Button
          type="button"
          variant="secondary"
          leftIcon={<RotateCcw size={16} aria-hidden="true" />}
          isLoading={resetOnboardingMutation.isPending}
          onClick={() => {
            resetOnboardingMutation.mutate();
          }}
        >
          Restart onboarding
        </Button>
      </section>
    </section>
  );
}

