import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { centsToDisplay } from '../../../shared/utils/currency';
import { getCategoryLabel } from '../constants/categories';
import type { RecurringRule } from '../types/transactions.types';

type DeleteRecurringRuleModalProps = {
  rule: RecurringRule | null;
  isDeleting: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteRecurringRuleModal({
  rule,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeleteRecurringRuleModalProps) {
  return (
    <Modal
      isOpen={Boolean(rule)}
      title="Delete recurring rule"
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
          <strong>{rule?.description || getCategoryLabel(rule?.category ?? '')}</strong>.
        </p>
        {rule ? (
          <p>
            {rule.kind === 'expense' ? '-' : '+'}
            {centsToDisplay(rule.amount_cents)}
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
