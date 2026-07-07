import { Archive, Calendar, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { centsToDisplay } from '../../../shared/utils/currency';
import { formatDisplay } from '../../../shared/utils/dates';
import { getDebtIconOption } from '../constants/debtIcons';
import { getDebtTypeLabel, getPaymentFrequencyLabel } from '../constants/debtOptions';
import type { DebtStatus, DebtWithProgress } from '../types/debts.types';
import type { Transaction } from '../../transactions';
import { DebtProgressBar } from './DebtProgressBar';

type DebtCardProps = {
  debt: DebtWithProgress;
  isMutating: boolean;
  payments: Transaction[];
  onArchive: (debt: DebtWithProgress) => void;
  onDelete: (debt: DebtWithProgress) => void;
  onEdit: (debt: DebtWithProgress) => void;
  onEditPayment: (transaction: Transaction) => void;
  onDeletePayment: (transaction: Transaction) => void;
  onRestore: (debt: DebtWithProgress) => void;
};

const DEBT_STATUS_LABELS: Record<DebtStatus, string> = {
  paid_off: 'Paid off',
  on_track: 'Active',
  high_interest: 'High interest',
  no_payment: 'No payment set',
};

export function DebtCard({
  debt,
  isMutating,
  payments,
  onArchive,
  onDelete,
  onEdit,
  onEditPayment,
  onDeletePayment,
  onRestore,
}: DebtCardProps) {
  const color = debt.color ?? 'var(--color-primary)';
  const { Icon } = getDebtIconOption(debt.icon);

  return (
    <article
      className={`debt-card ${debt.is_archived ? 'is-archived' : ''}`}
      style={{ '--debt-color': color } as CSSProperties}
    >
      <div className="debt-card-header">
        <div className="debt-title-row">
          <span className="debt-icon-swatch" aria-hidden="true">
            <Icon size={18} aria-hidden="true" />
          </span>
          <div>
            <h3>{debt.name}</h3>
            <p className={`debt-status debt-status--${debt.status}`}>
              {DEBT_STATUS_LABELS[debt.status]}
            </p>
          </div>
        </div>
        <strong>{Math.round(debt.payoff_progress_pct)}%</strong>
      </div>

      <DebtProgressBar value={debt.payoff_progress_pct} color={color} />

      <dl className="debt-metrics">
        <div>
          <dt>Balance</dt>
          <dd>{centsToDisplay(debt.current_balance_cents)}</dd>
        </div>
        <div>
          <dt>Original</dt>
          <dd>{centsToDisplay(debt.principal_cents)}</dd>
        </div>
        <div>
          <dt>Minimum</dt>
          <dd>
            {centsToDisplay(debt.minimum_payment_cents)}
            <span>/{getPaymentFrequencyLabel(debt.payment_frequency)}</span>
          </dd>
        </div>
        <div>
          <dt>Interest</dt>
          <dd>{(debt.interest_rate_basis_points / 100).toFixed(2)}%</dd>
        </div>
      </dl>

      <div className="debt-meta-row">
        <span>{getDebtTypeLabel(debt.debt_type)}</span>
        {debt.start_date ? (
          <span>
            <Calendar size={14} aria-hidden="true" />
            {formatDisplay(debt.start_date)}
          </span>
        ) : null}
      </div>

      <div className="debt-payments">
        <div className="debt-payments-header">
          <h4>Recent payments</h4>
          <span>{payments.length}</span>
        </div>
        {payments.length > 0 ? (
          <div className="debt-payment-list">
            {payments.slice(0, 3).map((payment) => (
              <div className="debt-payment-row" key={payment.id}>
                <div>
                  <strong>{centsToDisplay(payment.amount_cents)}</strong>
                  <span>{formatDisplay(payment.transaction_date)}</span>
                </div>
                <div className="debt-payment-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditPayment(payment)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="debt-archive-button"
                    onClick={() => onDeletePayment(payment)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="debt-payments-empty">No payments recorded yet.</p>
        )}
      </div>

      <div className="debt-card-actions">
        {debt.is_archived ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isMutating}
            leftIcon={<RotateCcw size={15} aria-hidden="true" />}
            onClick={() => onRestore(debt)}
          >
            Restore
          </Button>
        ) : null}
        <Button
          type="button"
          variant={debt.is_archived ? 'ghost' : 'secondary'}
          size="sm"
          leftIcon={<Pencil size={15} aria-hidden="true" />}
          onClick={() => onEdit(debt)}
        >
          Edit
        </Button>
        {!debt.is_archived ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="debt-archive-button"
            leftIcon={<Archive size={15} aria-hidden="true" />}
            onClick={() => onArchive(debt)}
          >
            Archive
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="debt-delete-button"
          leftIcon={<Trash2 size={15} aria-hidden="true" />}
          onClick={() => onDelete(debt)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
