import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { centsToDisplay } from '../../../shared/utils/currency';
import { getCategoryLabel } from '../constants/categories';
import type { Transaction } from '../types/transactions.types';

type DeleteTransactionModalProps = {
  transaction: Transaction | null;
  isDeleting: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteTransactionModal({
  transaction,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeleteTransactionModalProps) {
  return (
    <Modal
      isOpen={Boolean(transaction)}
      title="Delete transaction"
      onClose={onCancel}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="danger" isLoading={isDeleting} onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <div className="delete-transaction-copy">
        <p>
          This will permanently delete{' '}
          <strong>
            {transaction ? transaction.description || getCategoryLabel(transaction.category) : 'this transaction'}
          </strong>
          .
        </p>
        {transaction ? (
          <p>
            {transaction.kind === 'expense' ? '-' : '+'}
            {centsToDisplay(transaction.amount_cents)}
          </p>
        ) : null}
        {error ? (
          <p className="transaction-form-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
