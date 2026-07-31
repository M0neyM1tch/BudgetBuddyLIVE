import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { normalizeError } from '../../../shared/api/errors';
import { Button } from '../../../shared/components/ui/Button';
import { today } from '../../../shared/utils/dates';
import { useDebts } from '../../debts/hooks/useDebts';
import { useGoals } from '../../goals/hooks/useGoals';
import { useActiveFinancialPriority } from '../../goalPacks';
import { OnboardingTooltip } from '../../onboarding';
import {
  DEFAULT_QUICK_ADD_CHIPS,
} from '../constants/categories';
import { DeleteRecurringRuleModal } from '../components/DeleteRecurringRuleModal';
import { DeleteTransactionModal } from '../components/DeleteTransactionModal';
import { QuickAddCards } from '../components/QuickAddCards';
import { QuickAddChipModal } from '../components/QuickAddChipModal';
import { ActivePriorityContext } from '../components/ActivePriorityContext';
import { RecurringRuleModal } from '../components/RecurringRuleModal';
import { RecurringRulesPanel } from '../components/RecurringRulesPanel';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionList } from '../components/TransactionList';
import { TransactionModal } from '../components/TransactionModal';
import { TransactionSummaryBar } from '../components/TransactionSummaryBar';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import {
  useCreateRecurringRule,
  useCreateQuickAddTransaction,
  useCreateTransaction,
  useDeleteRecurringRule,
  useDeleteTransaction,
  useProcessRecurringRules,
  useQuickAddChips,
  useRecurringRules,
  useSaveQuickAddChips,
  useTransactionsPage,
  useTransactionSummary,
  useUpdateRecurringRule,
  useUpdateTransaction,
} from '../hooks/useTransactions';
import type {
  QuickAddChip,
  RecurringProcessResult,
  RecurringRule,
  RecurringRuleDraft,
  Transaction,
  TransactionDraft,
} from '../types/transactions.types';
import { resolveQuickAddTarget } from '../utils/quickAddTarget';
import { clampTransactionPage, totalTransactionPages, TRANSACTION_PAGE_SIZES } from '../utils/pagination';
import './TransactionsPage.css';

function dayOfMonth(isoDate: string): number | null {
  const day = Number(isoDate.split('-')[2]);
  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : null;
}

function buildProcessMessage(result: RecurringProcessResult): string {
  const parts: string[] = [];

  if (result.created > 0) {
    parts.push(`${result.created} transaction${result.created === 1 ? '' : 's'} generated`);
  }

  if (result.processedRules > 0) {
    parts.push(`${result.processedRules} rule${result.processedRules === 1 ? '' : 's'} advanced`);
  }

  if (result.limited) {
    parts.push('limit reached; run again to catch up');
  }

  if (result.skippedPaused > 0) {
    const pausedNames = result.pausedRuleNames.length
      ? `: ${result.pausedRuleNames.join(', ')}`
      : '';
    parts.push(`${result.skippedPaused} paused${pausedNames}`);
  }

  return parts.length ? parts.join(' - ') : 'Nothing due today.';
}

function emptyProcessResult(): RecurringProcessResult {
  return {
    created: 0,
    processedRules: 0,
    limited: false,
    skippedPaused: 0,
    pausedRuleNames: [],
  };
}

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const shouldOpenAddFromUrl = searchParams.get('new') === '1';
  const { filters, hasFilters, activeFilterCount, setFilters, clearFilters } = useTransactionFilters();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<(typeof TRANSACTION_PAGE_SIZES)[number]>(25);
  const transactionsQuery = useTransactionsPage(filters, page, pageSize);
  const summaryQuery = useTransactionSummary(filters);
  const debtsQuery = useDebts();
  const goalsQuery = useGoals();
  const priorityQuery = useActiveFinancialPriority();
  const recurringRulesQuery = useRecurringRules();
  const quickAddQuery = useQuickAddChips();
  const createTransactionMutation = useCreateTransaction();
  const createQuickAddMutation = useCreateQuickAddTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const createRecurringRuleMutation = useCreateRecurringRule();
  const updateRecurringRuleMutation = useUpdateRecurringRule();
  const deleteRecurringRuleMutation = useDeleteRecurringRule();
  const processRecurringRulesMutation = useProcessRecurringRules();
  const saveQuickAddMutation = useSaveQuickAddChips();
  const { reset: resetCreateTransaction } = createTransactionMutation;
  const { reset: resetUpdateTransaction } = updateTransactionMutation;

  const [transactionModalMode, setTransactionModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [prefillDraft, setPrefillDraft] = useState<Partial<TransactionDraft> | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurringRule, setEditingRecurringRule] = useState<RecurringRule | null>(null);
  const [deletingRecurringRule, setDeletingRecurringRule] = useState<RecurringRule | null>(null);
  const [quickAddModalMode, setQuickAddModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingQuickAddChip, setEditingQuickAddChip] = useState<QuickAddChip | null>(null);
  const [recurringProcessMessage, setRecurringProcessMessage] = useState<string | undefined>();
  const [quickAddFeedback, setQuickAddFeedback] = useState<string | undefined>();
  const [urlPrefillError, setUrlPrefillError] = useState<string | undefined>();
  const consumedPrefillRef = useRef<string | null>(null);
  const quickAddSubmissionRef = useRef<{ key: string; operationId: string } | null>(null);
  const isQuickAddSubmittingRef = useRef(false);

  const transactionPage = transactionsQuery.data;
  const transactions = useMemo(() => transactionPage?.rows ?? [], [transactionPage]);
  const totalTransactions = transactionPage?.count ?? 0;
  const totalPages = totalTransactionPages(totalTransactions, pageSize);
  const canGoPrevious = page > 0;
  const canGoNext = page + 1 < totalPages;
  const activeGoals = useMemo(
    () => (goalsQuery.data ?? []).filter((goal) => !goal.is_archived),
    [goalsQuery.data],
  );
  const activeDebts = useMemo(
    () => (debtsQuery.data ?? []).filter((debt) => !debt.is_archived),
    [debtsQuery.data],
  );
  const goalLabels = useMemo(
    () =>
      Object.fromEntries(
        (goalsQuery.data ?? []).map((goal) => [goal.id, goal.name]),
      ) as Record<string, string>,
    [goalsQuery.data],
  );
  const debtLabels = useMemo(
    () =>
      Object.fromEntries(
        (debtsQuery.data ?? []).map((debt) => [debt.id, debt.name]),
      ) as Record<string, string>,
    [debtsQuery.data],
  );
  const recurringMutationError = normalizeError(
    createRecurringRuleMutation.error ?? updateRecurringRuleMutation.error,
  ).message;
  const quickAddMutationError = normalizeError(saveQuickAddMutation.error).message;

  const openAddTransaction = useCallback((initialDraft: Partial<TransactionDraft> | null = null) => {
    resetCreateTransaction();
    resetUpdateTransaction();
    setEditingTransaction(null);
    setPrefillDraft({
      transaction_date: today(),
      source: 'manual',
      ...initialDraft,
    });
    setTransactionModalMode('add');
  }, [resetCreateTransaction, resetUpdateTransaction]);

  useEffect(() => {
    if (page >= totalPages) {
      queueMicrotask(() => setPage(clampTransactionPage(page, totalTransactions, pageSize)));
    }
  }, [page, pageSize, totalPages, totalTransactions]);

  useEffect(() => {
    if (!shouldOpenAddFromUrl) {
      consumedPrefillRef.current = null;
      return;
    }

    // A failed or refetching target query is not proof that a URL target is
    // stale. Wait for both RLS-scoped collections to load successfully.
    if (!goalsQuery.isSuccess || !debtsQuery.isSuccess) {
      return;
    }

    const prefillKey = searchParams.toString();
    if (consumedPrefillRef.current === prefillKey) return;
    consumedPrefillRef.current = prefillKey;

    const requestedGoalId = searchParams.get('goal_id');
    const requestedDebtId = searchParams.get('debt_id');
    const goal = activeGoals.find((candidate) => candidate.id === requestedGoalId);
    const debt = activeDebts.find((candidate) => candidate.id === requestedDebtId);

    if ((requestedGoalId && !goal) || (requestedDebtId && !debt) || (goal && debt)) {
      queueMicrotask(() =>
        setUrlPrefillError('That contribution target is unavailable. Choose an active goal or debt.'),
      );
    } else {
      queueMicrotask(() => setUrlPrefillError(undefined));
      const initialDraft = goal
        ? { goal_id: goal.id, category: 'savings' }
        : debt
          ? { debt_id: debt.id, category: 'debt_payment' }
          : null;
      queueMicrotask(() => openAddTransaction(initialDraft));
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('new');
    nextParams.delete('goal_id');
    nextParams.delete('debt_id');
    setSearchParams(nextParams, { replace: true });
  }, [
    activeDebts,
    activeGoals,
    debtsQuery.isSuccess,
    goalsQuery.isSuccess,
    openAddTransaction,
    searchParams,
    setSearchParams,
    shouldOpenAddFromUrl,
  ]);

  function openEditTransaction(transaction: Transaction) {
    createTransactionMutation.reset();
    updateTransactionMutation.reset();
    setPrefillDraft(null);
    setEditingTransaction(transaction);
    setTransactionModalMode('edit');
  }

  function closeTransactionModal() {
    setTransactionModalMode(null);
    setEditingTransaction(null);
    setPrefillDraft(null);
  }

  async function handleTransactionSubmit(draft: TransactionDraft) {
    setRecurringProcessMessage(undefined);

    if (editingTransaction) {
      await updateTransactionMutation.mutateAsync({
        id: editingTransaction.id,
        updates: draft,
      });
    } else if (draft.source === 'recurring') {
      await createRecurringTransaction(draft);
    } else {
      await createTransactionMutation.mutateAsync(draft);
    }

    closeTransactionModal();
  }

  async function handleDeleteTransaction() {
    if (!deletingTransaction) return;

    try {
      await deleteTransactionMutation.mutateAsync(deletingTransaction.id);
      setDeletingTransaction(null);
    } catch {
      // React Query exposes the error in the confirmation modal.
    }
  }

  function openRecurringRuleModal(rule: RecurringRule | null = null) {
    createRecurringRuleMutation.reset();
    updateRecurringRuleMutation.reset();
    deleteRecurringRuleMutation.reset();
    processRecurringRulesMutation.reset();
    setDeletingRecurringRule(null);
    setEditingRecurringRule(rule);
    setIsRecurringModalOpen(true);
  }

  function closeRecurringRuleModal() {
    setEditingRecurringRule(null);
    setIsRecurringModalOpen(false);
  }

  async function handleRecurringRuleSubmit(draft: RecurringRuleDraft) {
    setRecurringProcessMessage(undefined);

    if (editingRecurringRule) {
      await updateRecurringRuleMutation.mutateAsync({
        id: editingRecurringRule.id,
        updates: draft,
      });
      closeRecurringRuleModal();
      return;
    }

    const effectiveDraft: RecurringRuleDraft = draft.skip_backdate
      ? { ...draft, next_run_date: today() }
      : draft;

    await createRecurringRuleMutation.mutateAsync(effectiveDraft);

    if (!draft.skip_backdate && draft.start_date <= today()) {
      await processRecurringCatchup('Rule added. Due occurrences will sync overnight.');
    }

    closeRecurringRuleModal();
  }

  async function processRecurringCatchup(fallbackMessage: string) {
    let aggregate = emptyProcessResult();
    let runsLeft = 10;

    try {
      while (runsLeft > 0) {
        const result = await processRecurringRulesMutation.mutateAsync({
          throughDate: today(),
        });

        aggregate = {
          created: aggregate.created + result.created,
          processedRules: aggregate.processedRules + result.processedRules,
          limited: result.limited,
          skippedPaused: aggregate.skippedPaused + result.skippedPaused,
          pausedRuleNames: Array.from(
            new Set([...aggregate.pausedRuleNames, ...result.pausedRuleNames]),
          ),
        };

        runsLeft -= 1;
        if (!result.limited) break;
      }

      setRecurringProcessMessage(buildProcessMessage(aggregate));
    } catch {
      processRecurringRulesMutation.reset();
      setRecurringProcessMessage(fallbackMessage);
    }
  }

  async function backfillRecurringTransactionRule(startDate: string) {
    if (startDate >= today()) return;

    await processRecurringCatchup(
      'Recurring rule was created. Past occurrences will sync overnight.',
    );
  }

  async function createRecurringTransaction(draft: TransactionDraft) {
    const frequency = draft.recurring_frequency ?? 'monthly';
    const startDate = draft.recurring_start_date ?? draft.transaction_date;
    const ruleDraft: RecurringRuleDraft = {
      amount_cents: draft.amount_cents,
      kind: draft.debt_id ? 'transfer' : draft.kind === 'income' ? 'income' : 'expense',
      category: draft.debt_id ? 'debt_payment' : draft.category,
      debt_id: draft.debt_id ?? null,
      description: draft.description,
      frequency,
      start_date: startDate,
      next_run_date: startDate,
      day_of_month: frequency === 'monthly' ? dayOfMonth(startDate) : null,
      is_active: true,
      notes: draft.recurring_notes ?? draft.notes,
    };
    const rule = await createRecurringRuleMutation.mutateAsync(ruleDraft);

    try {
      await createTransactionMutation.mutateAsync({
        ...draft,
        transaction_date: startDate,
        recurring_rule_id: rule.id,
      });
    } catch (error) {
      await deleteRecurringRuleMutation.mutateAsync(rule.id).catch(() => undefined);
      throw error;
    }

    await backfillRecurringTransactionRule(startDate);
  }

  function handleDeleteRecurringRule(rule: RecurringRule) {
    setDeletingRecurringRule(rule);
    closeRecurringRuleModal();
  }

  async function handleConfirmDeleteRecurringRule() {
    if (!deletingRecurringRule) return;

    try {
      await deleteRecurringRuleMutation.mutateAsync(deletingRecurringRule.id);
      setDeletingRecurringRule(null);
    } catch {
      // React Query exposes the error in the confirmation modal.
    }
  }

  function handleToggleRecurringRule(rule: RecurringRule) {
    updateRecurringRuleMutation.mutate({
      id: rule.id,
      updates: { is_active: !rule.is_active },
    });
  }

  function handleResetQuickAdd() {
    saveQuickAddMutation.mutate([...DEFAULT_QUICK_ADD_CHIPS]);
  }

  function openQuickAddModal(chip: QuickAddChip | null = null) {
    saveQuickAddMutation.reset();
    setEditingQuickAddChip(chip);
    setQuickAddModalMode(chip ? 'edit' : 'add');
  }

  function closeQuickAddModal() {
    setEditingQuickAddChip(null);
    setQuickAddModalMode(null);
  }

  async function handleQuickAddFire(chip: QuickAddChip) {
    if (isQuickAddSubmittingRef.current || createQuickAddMutation.isPending) return;
    const resolution = resolveQuickAddTarget(
      chip,
      priorityQuery.data?.active_goal_id,
      activeGoals,
      activeDebts,
    );
    if (resolution.status === 'missing_priority') {
      setQuickAddFeedback(resolution.message);
      navigate('/dashboard/goals');
      return;
    }
    if (resolution.status === 'invalid_target') {
      setQuickAddFeedback(resolution.message);
      return;
    }

    const transactionDate = today();
    const operationKey = JSON.stringify({
      amount_cents: chip.amount_cents,
      description: chip.description,
      transactionDate,
      target: chip.target ?? null,
      draft: resolution.draft,
    });
    if (quickAddSubmissionRef.current?.key !== operationKey) {
      quickAddSubmissionRef.current = {
        key: operationKey,
        operationId: crypto.randomUUID(),
      };
    }

    isQuickAddSubmittingRef.current = true;
    setQuickAddFeedback(undefined);
    try {
      await createQuickAddMutation.mutateAsync({
        clientOperationId: quickAddSubmissionRef.current.operationId,
        draft: {
          amount_cents: chip.amount_cents,
          ...resolution.draft,
          transaction_date: transactionDate,
          description: chip.description,
          notes: null,
          source: 'manual',
        },
      });
      quickAddSubmissionRef.current = null;
      setQuickAddFeedback(`Added ${chip.label}.`);
    } catch (error) {
      setQuickAddFeedback(normalizeError(error).message);
    } finally {
      isQuickAddSubmittingRef.current = false;
    }
  }

  async function handleQuickAddSave(chip: QuickAddChip) {
    const currentChips = quickAddQuery.data?.length ? quickAddQuery.data : [...DEFAULT_QUICK_ADD_CHIPS];
    const nextChips = editingQuickAddChip
      ? currentChips.map((current) => (current.id === chip.id ? chip : current))
      : [...currentChips, chip].slice(0, 6);

    await saveQuickAddMutation.mutateAsync(nextChips);
    closeQuickAddModal();
  }

  function handleQuickAddDelete(chip: QuickAddChip) {
    const currentChips = quickAddQuery.data?.length ? quickAddQuery.data : [...DEFAULT_QUICK_ADD_CHIPS];
    saveQuickAddMutation.mutate(currentChips.filter((current) => current.id !== chip.id));
    closeQuickAddModal();
  }

  const recurringRules = recurringRulesQuery.data ?? [];
  const activePriorityGoal = activeGoals.find(
    (goal) => goal.id === priorityQuery.data?.active_goal_id,
  );
  const activePriorityDebtId = (activePriorityGoal as (typeof activeGoals)[number] & {
    linked_debt_id?: string | null;
  } | undefined)?.linked_debt_id;
  const activePriorityDebt = activeDebts.find((debt) => debt.id === activePriorityDebtId);
  const activePriorityName = activePriorityGoal?.name ?? null;
  const isDebtPriority = activePriorityGoal?.goal_type === 'debt_payoff';
  const quickAddIssue = (chip: QuickAddChip) => {
    if (chip.target?.kind === 'active_priority' && priorityQuery.isLoading) {
      return 'Loading active priority…';
    }
    const resolution = resolveQuickAddTarget(
      chip,
      priorityQuery.data?.active_goal_id,
      activeGoals,
      activeDebts,
    );
    return resolution.status === 'resolved' ? null : resolution.message;
  };
  const recurringRulesPanel = (
    <RecurringRulesPanel
      debtLabels={debtLabels}
      rules={recurringRules}
      isLoading={recurringRulesQuery.isLoading}
      isToggling={updateRecurringRuleMutation.isPending}
      isDeleting={deleteRecurringRuleMutation.isPending}
      processMessage={
        processRecurringRulesMutation.error
          ? normalizeError(processRecurringRulesMutation.error).message
          : recurringProcessMessage
      }
      onAdd={() => openRecurringRuleModal()}
      onEdit={openRecurringRuleModal}
      onDelete={handleDeleteRecurringRule}
      onToggle={handleToggleRecurringRule}
    />
  );

  return (
    <section className="page page--wide transactions-page" aria-labelledby="transactions-title">
      <div className="page-header transactions-page-header">
        <div>
          <p className="page-kicker">Income and spending</p>
          <h2 id="transactions-title" className="page-title">
            Transactions
          </h2>
          <p className="page-description">
            Track income, expenses, recurring rules, and quick entries without mixing business
            logic into the UI.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          leftIcon={<Plus size={18} aria-hidden="true" />}
          onClick={() => openAddTransaction()}
        >
          Add transaction
        </Button>
      </div>

      {urlPrefillError ? <p className="transaction-form-error" role="alert">{urlPrefillError}</p> : null}

      <QuickAddCards
        chips={quickAddQuery.data ?? []}
        isLoading={quickAddQuery.isLoading}
        isSaving={saveQuickAddMutation.isPending}
        isCreating={createQuickAddMutation.isPending}
        feedback={quickAddFeedback}
        activePriorityName={activePriorityName}
        getChipIssue={quickAddIssue}
        onFire={(chip) => { void handleQuickAddFire(chip); }}
        onChoosePriority={() => navigate('/dashboard/goals')}
        onEdit={openQuickAddModal}
        onAdd={() => openQuickAddModal()}
        onReset={handleResetQuickAdd}
      />

      <TransactionSummaryBar
        summary={summaryQuery.data}
        isLoading={summaryQuery.isLoading || summaryQuery.isFetching}
        error={summaryQuery.error ? normalizeError(summaryQuery.error).message : undefined}
      />

      <div className="transactions-layout">
        <div className="transactions-main-column">
          <TransactionFilters
            filters={filters}
            hasFilters={hasFilters}
            activeFilterCount={activeFilterCount}
            onChange={(updates) => {
              setPage(0);
              setFilters(updates);
            }}
            onClear={() => {
              setPage(0);
              clearFilters();
            }}
          />

          <TransactionList
            debtLabels={debtLabels}
            goalLabels={goalLabels}
            transactions={transactions}
            isLoading={transactionsQuery.isLoading}
            error={transactionsQuery.error ? normalizeError(transactionsQuery.error) : null}
            onRetry={() => {
              void transactionsQuery.refetch();
            }}
            onEdit={openEditTransaction}
            onDelete={setDeletingTransaction}
            onAdd={() => openAddTransaction()}
          />

          <nav className="transactions-pagination" aria-label="Transaction pages">
            <p>
              Page {page + 1} of {totalPages} ({totalTransactions} transaction
              {totalTransactions === 1 ? '' : 's'})
            </p>
            <div>
              <label className="transactions-page-size">
                <span>Transactions per page</span>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value) as (typeof TRANSACTION_PAGE_SIZES)[number]);
                    setPage(0);
                  }}
                >
                  {TRANSACTION_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
              <Button
                type="button"
                variant="secondary"
                disabled={!canGoPrevious || transactionsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!canGoNext || transactionsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </nav>
        </div>

        <aside className="transactions-side-column">
          <ActivePriorityContext
            name={activePriorityName}
            currentCents={activePriorityGoal?.current_amount_cents ?? null}
            targetCents={activePriorityGoal?.target_amount_cents ?? null}
            remainingCents={isDebtPriority
              ? activePriorityDebt?.current_balance_cents ?? null
              : activePriorityGoal?.amount_remaining_cents ?? null}
            isDebt={isDebtPriority}
            isLoading={priorityQuery.isLoading || goalsQuery.isLoading || debtsQuery.isLoading}
          />

          {recurringRules.length > 0 ? (
            <OnboardingTooltip
              id="transactions-recurring-review"
              content="Review recurring rules created during setup here. They generate real transactions when due or backdated."
            >
              {recurringRulesPanel}
            </OnboardingTooltip>
          ) : (
            recurringRulesPanel
          )}
        </aside>
      </div>

      <TransactionModal
        activeDebts={activeDebts}
        activeGoals={activeGoals}
        isOpen={transactionModalMode !== null}
        transaction={editingTransaction}
        initialDraft={prefillDraft}
        isSubmitting={
          createTransactionMutation.isPending ||
          updateTransactionMutation.isPending ||
          processRecurringRulesMutation.isPending
        }
        serverError={
          createTransactionMutation.error ||
          updateTransactionMutation.error ||
          createRecurringRuleMutation.error
            ? normalizeError(
                createTransactionMutation.error ??
                  updateTransactionMutation.error ??
                  createRecurringRuleMutation.error,
              ).message
            : undefined
        }
        onClose={closeTransactionModal}
        onSubmit={handleTransactionSubmit}
      />

      <DeleteTransactionModal
        transaction={deletingTransaction}
        isDeleting={deleteTransactionMutation.isPending}
        error={
          deleteTransactionMutation.error
            ? normalizeError(deleteTransactionMutation.error).message
            : undefined
        }
        onCancel={() => setDeletingTransaction(null)}
        onConfirm={() => {
          void handleDeleteTransaction();
        }}
      />

      <RecurringRuleModal
        activeDebts={activeDebts}
        isOpen={isRecurringModalOpen}
        rule={editingRecurringRule}
        isSubmitting={
          createRecurringRuleMutation.isPending ||
          updateRecurringRuleMutation.isPending ||
          processRecurringRulesMutation.isPending
        }
        isDeleting={deleteRecurringRuleMutation.isPending}
        serverError={
          createRecurringRuleMutation.error || updateRecurringRuleMutation.error
            ? recurringMutationError
            : undefined
        }
        onClose={closeRecurringRuleModal}
        onSubmit={handleRecurringRuleSubmit}
        onDelete={handleDeleteRecurringRule}
      />

      <DeleteRecurringRuleModal
        rule={deletingRecurringRule}
        isDeleting={deleteRecurringRuleMutation.isPending}
        error={
          deleteRecurringRuleMutation.error
            ? normalizeError(deleteRecurringRuleMutation.error).message
            : undefined
        }
        onCancel={() => setDeletingRecurringRule(null)}
        onConfirm={() => {
          void handleConfirmDeleteRecurringRule();
        }}
      />

      <QuickAddChipModal
        isOpen={quickAddModalMode !== null}
        chip={editingQuickAddChip}
        isSubmitting={saveQuickAddMutation.isPending}
        activeGoals={activeGoals}
        activeDebts={activeDebts}
        activePriorityName={activePriorityName}
        serverError={saveQuickAddMutation.error ? quickAddMutationError : undefined}
        onClose={closeQuickAddModal}
        onDelete={handleQuickAddDelete}
        onSubmit={handleQuickAddSave}
      />
    </section>
  );
}
