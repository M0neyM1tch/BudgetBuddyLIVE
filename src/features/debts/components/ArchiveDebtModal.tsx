import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import type { DebtWithProgress } from '../types/debts.types';

type ArchiveDebtModalProps = {
  debt: DebtWithProgress | null;
  error?: string;
  isArchiving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ArchiveDebtModal({
  debt,
  error,
  isArchiving,
  onCancel,
  onConfirm,
}: ArchiveDebtModalProps) {
  if (!debt) return null;

  return (
    <Modal
      isOpen={Boolean(debt)}
      title={`Archive "${debt.name}"?`}
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
      <div className="debt-delete-copy">
        <p>
          This debt will be hidden from your active view. You can restore it at any time from the
          archived section.
        </p>
        {error ? (
          <p className="debt-form-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
