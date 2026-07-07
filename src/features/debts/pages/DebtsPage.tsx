import { Banknote, CreditCard, Plus, TrendingDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { normalizeError } from '../../../shared/api/errors';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { ErrorState } from '../../../shared/components/feedback/ErrorState';
import { LoadingState } from '../../../shared/components/feedback/LoadingState';
import { Button } from '../../../shared/components/ui/Button';
import { centsToDisplay } from '../../../shared/utils/currency';
import { useGoals } from '../../goals/hooks/useGoals';
import { OnboardingTooltip } from '../../onboarding';
import { DeleteTransactionModal } from '../../transactions/components/DeleteTransactionModal';
import { TransactionModal } from '../../transactions/components/TransactionModal';
import {
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from '../../transactions';
import type {
  Transaction,
  TransactionDraft,
} from '../../transactions';
import { ArchiveDebtModal } from '../components/ArchiveDebtModal';
import { DebtCard } from '../components/DebtCard';
import { DebtModal } from '../components/DebtModal';
import { DebtPayoffPlanner } from '../components/DebtPayoffPlanner';
import { DeleteDebtModal } from '../components/DeleteDebtModal';
import {
  useArchiveDebt,
  useCreateDebt,
  useDeleteDebtPermanently,
  useDebts,
  useRestoreDebt,
  useUpdateDebt,
} from '../hooks/useDebts';
import type { DebtDraft, DebtSummary, DebtWithProgress } from '../types/debts.types';
import './DebtsPage.css';

function summarizeDebts(debts: DebtWithProgress[]): DebtSummary {
  return debts.reduce<DebtSummary>(
    (summary, debt) => {
      if (debt.is_archived) return summary;

      summary.activeCount += 1;
      summary.totalBalanceCents += debt.current_balance_cents;
      summary.totalMinimumPaymentCents += debt.minimum_payment_cents;
      summary.totalPrincipalCents += debt.principal_cents;

      if (debt.status === 'paid_off') summary.paidOffCount += 1;
      if (debt.status === 'high_interest') summary.highInterestCount += 1;

      return summary;
    },
    {
      activeCount: 0,
      highInterestCount: 0,
      paidOffCount: 0,
      totalBalanceCents: 0,
      totalMinimumPaymentCents: 0,
      totalPrincipalCents: 0,
    },
  );
}

export function DebtsPage() {
  const debtsQuery = useDebts();
  const createDebtMutation = useCreateDebt();
  const updateDebtMutation = useUpdateDebt();
  const archiveDebtMutation = useArchiveDebt();
  const deleteDebtMutation = useDeleteDebtPermanently();
  const restoreDebtMutation = useRestoreDebt();
  const debtPaymentsQuery = useTransactions({ category: 'debt_payment' });
  const goalsQuery = useGoals();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtWithProgress | null>(null);
  const [archivingDebt, setArchivingDebt] = useState<DebtWithProgress | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<DebtWithProgress | null>(null);
  const [editingPayment, setEditingPayment] = useState<Transaction | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Transaction | null>(null);

  const debts = useMemo(() => debtsQuery.data ?? [], [debtsQuery.data]);
  const activeDebts = useMemo(() => debts.filter((debt) => !debt.is_archived), [debts]);
  const archivedDebts = useMemo(() => debts.filter((debt) => debt.is_archived), [debts]);
  const activeGoals = useMemo(
    () => (goalsQuery.data ?? []).filter((goal) => !goal.is_archived),
    [goalsQuery.data],
  );
  const paymentsByDebtId = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};

    (debtPaymentsQuery.data ?? []).forEach((payment) => {
      if (!payment.debt_id) return;
      grouped[payment.debt_id] = [...(grouped[payment.debt_id] ?? []), payment];
    });

    return grouped;
  }, [debtPaymentsQuery.data]);
  const summary = useMemo(() => summarizeDebts(debts), [debts]);

  function openCreateDebt() {
    createDebtMutation.reset();
    updateDebtMutation.reset();
    setEditingDebt(null);
    setIsDebtModalOpen(true);
  }

  function openEditDebt(debt: DebtWithProgress) {
    createDebtMutation.reset();
    updateDebtMutation.reset();
    setEditingDebt(debt);
    setIsDebtModalOpen(true);
  }

  function closeDebtModal() {
    setEditingDebt(null);
    setIsDebtModalOpen(false);
  }

  async function handleDebtSubmit(draft: DebtDraft) {
    if (editingDebt) {
      await updateDebtMutation.mutateAsync({
        id: editingDebt.id,
        updates: draft,
      });
    } else {
      await createDebtMutation.mutateAsync(draft);
    }

    closeDebtModal();
  }

  async function handleConfirmArchiveDebt() {
    if (!archivingDebt) return;

    try {
      await archiveDebtMutation.mutateAsync(archivingDebt.id);
      setArchivingDebt(null);
    } catch {
      // React Query exposes the error in the confirmation modal.
    }
  }

  async function handleConfirmDeleteDebt() {
    if (!deletingDebt) return;

    try {
      await deleteDebtMutation.mutateAsync(deletingDebt.id);
      setDeletingDebt(null);
    } catch {
      // React Query exposes the error in the confirmation modal.
    }
  }

  async function handlePaymentSubmit(draft: TransactionDraft) {
    if (!editingPayment) return;

    await updateTransactionMutation.mutateAsync({
      id: editingPayment.id,
      updates: draft,
    });

    setEditingPayment(null);
  }

  async function handleConfirmDeletePayment() {
    if (!deletingPayment) return;

    try {
      await deleteTransactionMutation.mutateAsync(deletingPayment.id);
      setDeletingPayment(null);
    } catch {
      // React Query exposes the error in the confirmation modal.
    }
  }

  if (debtsQuery.isLoading) {
    return <LoadingState label="Loading debts" />;
  }

  if (debtsQuery.error) {
    return (
      <ErrorState
        title="Debts could not load"
        message={normalizeError(debtsQuery.error).message}
        onRetry={() => {
          void debtsQuery.refetch();
        }}
      />
    );
  }

  return (
    <section className="page page--wide debts-page" aria-labelledby="debts-title">
      <div className="page-header debts-page-header">
        <div>
          <p className="page-kicker">Payoff planning</p>
          <h2 id="debts-title" className="page-title">
            Debts
          </h2>
          <p className="page-description">
            Track balances, minimum payments, interest rates, and payoff progress with the same
            clean card controls used for goals.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          leftIcon={<Plus size={18} aria-hidden="true" />}
          onClick={openCreateDebt}
        >
          New debt
        </Button>
      </div>

      <div className="debts-summary" aria-label="Debts summary">
        <article className="debts-summary-card">
          <span className="debts-summary-icon">
            <CreditCard size={20} aria-hidden="true" />
          </span>
          <div>
            <p>Total balance</p>
            <strong>{centsToDisplay(summary.totalBalanceCents)}</strong>
          </div>
        </article>
        <article className="debts-summary-card">
          <span className="debts-summary-icon">
            <Banknote size={20} aria-hidden="true" />
          </span>
          <div>
            <p>Minimum due</p>
            <strong>{centsToDisplay(summary.totalMinimumPaymentCents)}</strong>
          </div>
        </article>
        <article className="debts-summary-card">
          <span className="debts-summary-icon">
            <TrendingDown size={20} aria-hidden="true" />
          </span>
          <div>
            <p>High interest</p>
            <strong>
              {summary.highInterestCount}/{summary.activeCount}
            </strong>
          </div>
        </article>
      </div>

      <details className="planner-collapsible" open>
        <summary className="planner-collapsible-toggle">
          <span>Debt Payoff Planner</span>
        </summary>
        <DebtPayoffPlanner debts={activeDebts} />
      </details>

      {activeDebts.length === 0 ? (
        <EmptyState
          title="No active debts yet"
          description="Add your first balance and start tracking payoff progress with a dedicated plan."
          action={
            <Button
              type="button"
              leftIcon={<Plus size={16} aria-hidden="true" />}
              onClick={openCreateDebt}
            >
              Add Debt
            </Button>
          }
        />
      ) : (
        <div className="debts-grid" aria-label="Active debts">
          {activeDebts.map((debt, index) => {
            const card = (
              <DebtCard
                key={debt.id}
                debt={debt}
                isMutating={archiveDebtMutation.isPending || restoreDebtMutation.isPending}
                payments={paymentsByDebtId[debt.id] ?? []}
                onArchive={setArchivingDebt}
                onDelete={setDeletingDebt}
                onEdit={openEditDebt}
                onEditPayment={setEditingPayment}
                onDeletePayment={setDeletingPayment}
                onRestore={(restoringDebt) => {
                  restoreDebtMutation.mutate(restoringDebt.id);
                }}
              />
            );

            return index === 0 ? (
              <OnboardingTooltip
                id="debts-payment-hint"
                content="Record debt payments here to keep balances and payoff progress current."
                key={debt.id}
              >
                {card}
              </OnboardingTooltip>
            ) : (
              card
            );
          })}
        </div>
      )}

      {archivedDebts.length > 0 ? (
        <details className="archived-debts">
          <summary>Archived debts ({archivedDebts.length})</summary>
          <div className="debts-grid" aria-label="Archived debts">
            {archivedDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                isMutating={archiveDebtMutation.isPending || restoreDebtMutation.isPending}
                payments={paymentsByDebtId[debt.id] ?? []}
                onArchive={setArchivingDebt}
                onDelete={setDeletingDebt}
                onEdit={openEditDebt}
                onEditPayment={setEditingPayment}
                onDeletePayment={setDeletingPayment}
                onRestore={(restoringDebt) => {
                  restoreDebtMutation.mutate(restoringDebt.id);
                }}
              />
            ))}
          </div>
        </details>
      ) : null}

      <DebtModal
        isOpen={isDebtModalOpen}
        debt={editingDebt}
        isSubmitting={createDebtMutation.isPending || updateDebtMutation.isPending}
        serverError={
          createDebtMutation.error || updateDebtMutation.error
            ? normalizeError(createDebtMutation.error ?? updateDebtMutation.error).message
            : undefined
        }
        onClose={closeDebtModal}
        onSubmit={handleDebtSubmit}
      />

      <ArchiveDebtModal
        debt={archivingDebt}
        isArchiving={archiveDebtMutation.isPending}
        error={
          archiveDebtMutation.error
            ? normalizeError(archiveDebtMutation.error).message
            : undefined
        }
        onCancel={() => setArchivingDebt(null)}
        onConfirm={() => {
          void handleConfirmArchiveDebt();
        }}
      />

      <DeleteDebtModal
        debt={deletingDebt}
        isDeleting={deleteDebtMutation.isPending}
        error={
          deleteDebtMutation.error
            ? normalizeError(deleteDebtMutation.error).message
            : undefined
        }
        onCancel={() => setDeletingDebt(null)}
        onConfirm={() => {
          void handleConfirmDeleteDebt();
        }}
      />

      <TransactionModal
        activeDebts={activeDebts}
        activeGoals={activeGoals}
        isOpen={Boolean(editingPayment)}
        transaction={editingPayment}
        initialDraft={null}
        isSubmitting={updateTransactionMutation.isPending}
        serverError={
          updateTransactionMutation.error
            ? normalizeError(updateTransactionMutation.error).message
            : undefined
        }
        onClose={() => setEditingPayment(null)}
        onSubmit={handlePaymentSubmit}
      />

      <DeleteTransactionModal
        transaction={deletingPayment}
        isDeleting={deleteTransactionMutation.isPending}
        error={
          deleteTransactionMutation.error
            ? normalizeError(deleteTransactionMutation.error).message
            : undefined
        }
        onCancel={() => setDeletingPayment(null)}
        onConfirm={() => {
          void handleConfirmDeletePayment();
        }}
      />
    </section>
  );
}
