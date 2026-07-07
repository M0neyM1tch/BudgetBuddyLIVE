import { Plus } from 'lucide-react';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { ErrorState } from '../../../shared/components/feedback/ErrorState';
import { Button } from '../../../shared/components/ui/Button';
import type { AppError } from '../../../shared/api/errors';
import { OnboardingTooltip } from '../../onboarding';
import type { Transaction } from '../types/transactions.types';
import { TransactionRow } from './TransactionRow';

type TransactionListProps = {
  debtLabels: Record<string, string>;
  goalLabels: Record<string, string>;
  transactions: Transaction[];
  isLoading: boolean;
  error: AppError | null;
  onRetry: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onAdd: () => void;
};

export function TransactionList({
  debtLabels,
  goalLabels,
  transactions,
  isLoading,
  error,
  onRetry,
  onEdit,
  onDelete,
  onAdd,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="transactions-list" aria-label="Loading transactions">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="transaction-row transaction-row--skeleton" key={index}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Transactions could not load"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  if (transactions.length === 0) {
    return (
      <OnboardingTooltip
        id="transactions-add-hint"
        content="Add your first transaction to start tracking your cash flow."
      >
        <EmptyState
          title="No transactions found"
          description="Add a transaction or adjust your filters to see more activity."
          action={
            <Button
              type="button"
              leftIcon={<Plus size={16} aria-hidden="true" />}
              onClick={onAdd}
            >
              Add Transaction
            </Button>
          }
        />
      </OnboardingTooltip>
    );
  }

  return (
    <div className="transactions-list" aria-label="Transactions list">
      {transactions.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          debtName={transaction.debt_id ? debtLabels[transaction.debt_id] : undefined}
          goalName={transaction.goal_id ? goalLabels[transaction.goal_id] : undefined}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
