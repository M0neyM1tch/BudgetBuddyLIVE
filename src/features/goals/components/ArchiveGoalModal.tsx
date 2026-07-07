import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import type { GoalWithProgress } from '../types/goals.types';

type ArchiveGoalModalProps = {
  goal: GoalWithProgress | null;
  isArchiving: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ArchiveGoalModal({
  goal,
  isArchiving,
  error,
  onCancel,
  onConfirm,
}: ArchiveGoalModalProps) {
  if (!goal) return null;

  return (
    <Modal
      isOpen={Boolean(goal)}
      title={`Archive "${goal.name}"?`}
      onClose={onCancel}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" isLoading={isArchiving} onClick={onConfirm}>
            Archive
          </Button>
        </>
      }
    >
      <div className="goal-delete-copy">
        <p>
          This goal will be hidden from your active view. You can restore it at any time from the
          archived section.
        </p>
        {error ? (
          <p className="goal-form-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
