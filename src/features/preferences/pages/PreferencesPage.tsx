import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { normalizeError } from '../../../shared/api/errors';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import {
  useResetOnboarding,
  useResetOnboardingWithCleanSlate,
} from '../../onboarding';
import './PreferencesPage.css';

type CleanSlateResetModalProps = {
  error?: string;
  isOpen: boolean;
  isResetting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function CleanSlateResetModal({
  error,
  isOpen,
  isResetting,
  onCancel,
  onConfirm,
}: CleanSlateResetModalProps) {
  const [confirmation, setConfirmation] = useState('');
  const isConfirmed = confirmation.trim().toLowerCase() === 'delete';

  function handleCancel() {
    setConfirmation('');
    onCancel();
  }

  function handleConfirm() {
    if (!isConfirmed) return;
    onConfirm();
  }

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title="Restart onboarding with a clean slate?"
      onClose={handleCancel}
      footer={
        <>
          <Button type="button" variant="ghost" disabled={isResetting} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!isConfirmed}
            isLoading={isResetting}
            onClick={handleConfirm}
          >
            Wipe data and restart
          </Button>
        </>
      }
    >
      <div className="preferences-reset-copy">
        <p>
          This clears the financial inputs in this workspace and restarts priority setup.
          This action cannot be undone.
        </p>
        <p>
          BudgBeacon will remove goals, debts, transactions, recurring rules, Goal Pack
          priorities, plan snapshots, next actions, quick-add cards, and dismissed setup tips.
          Your account, sign-in, legal acceptance, and profile stay in place.
        </p>
        <label className="preferences-confirm-field">
          <span>Type delete to confirm</span>
          <input
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        {error ? (
          <p className="preferences-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

export function PreferencesPage() {
  const resetOnboardingMutation = useResetOnboarding();
  const resetCleanSlateMutation = useResetOnboardingWithCleanSlate();
  const [isCleanSlateModalOpen, setIsCleanSlateModalOpen] = useState(false);
  const restartErrorMessage = resetOnboardingMutation.error
    ? normalizeError(resetOnboardingMutation.error).message
    : null;
  const cleanSlateErrorMessage = resetCleanSlateMutation.error
    ? normalizeError(resetCleanSlateMutation.error).message
    : undefined;

  function openCleanSlateModal() {
    resetCleanSlateMutation.reset();
    setIsCleanSlateModalOpen(true);
  }

  async function handleCleanSlateConfirm() {
    try {
      await resetCleanSlateMutation.mutateAsync();
      setIsCleanSlateModalOpen(false);
    } catch {
      // React Query exposes the error in the confirmation modal.
    }
  }

  return (
    <section className="page preferences-page" aria-labelledby="preferences-title">
      <div className="page-header">
        <div>
          <p className="page-kicker">Account</p>
          <h2 id="preferences-title" className="page-title">
            Preferences
          </h2>
          <p className="page-description">
            Manage lightweight guidance controls for this BudgBeacon workspace.
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
          {restartErrorMessage ? (
            <p className="preferences-error" role="alert">
              {restartErrorMessage}
            </p>
          ) : null}
        </div>
        <div className="preferences-panel-actions">
          <Button
            type="button"
            variant="secondary"
            leftIcon={<RotateCcw size={16} aria-hidden="true" />}
            isLoading={resetOnboardingMutation.isPending}
            disabled={resetCleanSlateMutation.isPending}
            onClick={() => {
              resetOnboardingMutation.mutate();
            }}
          >
            Restart onboarding
          </Button>
          <Button
            type="button"
            variant="danger"
            leftIcon={<Trash2 size={16} aria-hidden="true" />}
            disabled={resetOnboardingMutation.isPending || resetCleanSlateMutation.isPending}
            onClick={openCleanSlateModal}
          >
            Restart with clean slate
          </Button>
        </div>
      </section>

      <CleanSlateResetModal
        error={cleanSlateErrorMessage}
        isOpen={isCleanSlateModalOpen}
        isResetting={resetCleanSlateMutation.isPending}
        onCancel={() => setIsCleanSlateModalOpen(false)}
        onConfirm={() => {
          void handleCleanSlateConfirm();
        }}
      />
    </section>
  );
}
