import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { centsToDisplay } from '../../../shared/utils/currency';
import { formatDisplay } from '../../../shared/utils/dates';
import { getCategoryLabel, getKindLabel } from '../constants/categories';
import type { Transaction } from '../types/transactions.types';

type TransactionRowProps = {
  debtName?: string;
  goalName?: string;
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export function TransactionRow({
  debtName,
  goalName,
  transaction,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const signedAmount =
    transaction.kind === 'expense' || transaction.kind === 'transfer'
      ? -Math.abs(transaction.amount_cents)
      : transaction.amount_cents;
  const title = transaction.description || getCategoryLabel(transaction.category);
  const categoryLabel = goalName ?? debtName ?? getCategoryLabel(transaction.category);

  return (
    <article className="transaction-row">
      <div className="transaction-row-main">
        <time dateTime={transaction.transaction_date}>
          {formatDisplay(transaction.transaction_date)}
        </time>
        <div>
          <h3>{title}</h3>
          <div className="transaction-row-meta">
            <span className={`transaction-kind transaction-kind--${transaction.kind}`}>
              {getKindLabel(transaction.kind === 'transfer' ? 'expense' : transaction.kind)}
            </span>
            <span className="transaction-category">{categoryLabel}</span>
            {debtName ? <span className="transaction-source">Debt sync</span> : null}
            {transaction.source !== 'manual' ? (
              <span className="transaction-source">{transaction.source.replace('_', ' ')}</span>
            ) : null}
          </div>
          {transaction.notes ? <p className="transaction-notes">{transaction.notes}</p> : null}
        </div>
      </div>

      <div className="transaction-row-side">
        <strong className={`transaction-amount transaction-amount--${transaction.kind}`}>
          {centsToDisplay(signedAmount)}
        </strong>
        <div className="transaction-row-actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Pencil size={15} aria-hidden="true" />}
            onClick={() => onEdit(transaction)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="transaction-delete-button"
            leftIcon={<Trash2 size={15} aria-hidden="true" />}
            onClick={() => onDelete(transaction)}
          >
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
