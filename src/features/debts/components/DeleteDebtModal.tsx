import { useState } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import type { DebtWithProgress } from '../types/debts.types';

type DeleteDebtModalProps = {
  debt: DebtWithProgress | null;
  isDeleting: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

type DeleteDebtModalContentProps = Omit<DeleteDebtModalProps, 'debt'> & {
  debt: DebtWithProgress;
};

export function DeleteDebtModal({
  debt,
  ...props
}: DeleteDebtModalProps) {
  if (!debt) return null;

  return <DeleteDebtModalContent key={debt.id} debt={debt} {...props} />;
}

function DeleteDebtModalContent({
  debt,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeleteDebtModalContentProps) {
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
      isOpen={Boolean(debt)}
      title={`Permanently delete "${debt.name}"?`}
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
      <div className="debt-delete-copy">
        <p>
          This will permanently remove <strong>{debt.name}</strong> from your account. This action
          cannot be undone.
        </p>
        <p>
          Any transactions linked to this debt will stay in your transaction history, but they
          will no longer be associated with a debt. Any recurring rules linked to this debt will
          be paused. If you only want to hide this debt, use Archive instead.
        </p>
        <label className="debt-confirm-field">
          <span>Type delete to confirm</span>
          <input
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        {error ? (
          <p className="debt-form-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
