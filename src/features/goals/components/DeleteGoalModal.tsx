import { useState } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import type { GoalWithProgress } from '../types/goals.types';

type DeleteGoalModalProps = {
  goal: GoalWithProgress | null;
  isDeleting: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

type DeleteGoalModalContentProps = Omit<DeleteGoalModalProps, 'goal'> & {
  goal: GoalWithProgress;
};

export function DeleteGoalModal({
  goal,
  ...props
}: DeleteGoalModalProps) {
  if (!goal) return null;

  return <DeleteGoalModalContent key={goal.id} goal={goal} {...props} />;
}

function DeleteGoalModalContent({
  goal,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeleteGoalModalContentProps) {
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

  return (
    <Modal
      isOpen={Boolean(goal)}
      title={`Permanently delete "${goal.name}"?`}
      onClose={handleCancel}
      footer={
        <>
          <Button type="button" variant="ghost" disabled={isDeleting} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!isConfirmed}
            isLoading={isDeleting}
            onClick={handleConfirm}
          >
            Permanently delete
          </Button>
        </>
      }
    >
      <div className="goal-delete-copy">
        <p>
          This will permanently remove <strong>{goal.name}</strong> from your account. This
          action cannot be undone.
        </p>
        <p>
          Any transactions linked to this goal will stay in your transaction history, but they
          will no longer be associated with a goal. If you only want to hide this goal, use
          Archive instead.
        </p>
        <label className="goal-confirm-field">
          <span>Type delete to confirm</span>
          <input
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        {error ? (
          <p className="goal-form-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
