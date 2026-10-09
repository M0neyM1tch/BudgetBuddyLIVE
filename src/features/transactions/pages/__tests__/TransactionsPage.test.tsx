import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { TransactionsPage } from '../TransactionsPage';
import type { RecurringRuleDraft } from '../../types/transactions.types';

const mocks = vi.hoisted(() => ({
  useGoals: vi.fn(),
  useDebts: vi.fn(),
  useActiveFinancialPriority: vi.fn(),
  createRecurringRule: vi.fn(),
  recurringDraft: undefined as RecurringRuleDraft | undefined,
}));

vi.mock('../../../goals/hooks/useGoals', () => ({ useGoals: mocks.useGoals }));
vi.mock('../../../debts/hooks/useDebts', () => ({ useDebts: mocks.useDebts }));
vi.mock('../../../goalPacks', () => ({ useActiveFinancialPriority: mocks.useActiveFinancialPriority }));

vi.mock('../../hooks/useTransactions', () => {
  const query = { data: undefined, error: null, isLoading: false, isFetching: false, refetch: vi.fn() };
  const mutation = { error: null, isPending: false, mutate: vi.fn(), mutateAsync: vi.fn(), reset: vi.fn() };
  return {
    useTransactionsPage: () => ({ ...query, data: { rows: [], count: 0 } }),
    useTransactionSummary: () => query,
    useRecurringRules: () => ({ ...query, data: [] }),
    useQuickAddChips: () => ({ ...query, data: [] }),
    useCreateTransaction: () => mutation,
    useCreateQuickAddTransaction: () => mutation,
    useUpdateTransaction: () => mutation,
    useDeleteTransaction: () => mutation,
    useCreateRecurringRule: () => ({ ...mutation, mutateAsync: mocks.createRecurringRule }),
    useUpdateRecurringRule: () => mutation,
    useDeleteRecurringRule: () => mutation,
    useProcessRecurringRules: () => mutation,
    useSaveQuickAddChips: () => mutation,
  };
});

vi.mock('../../components/TransactionModal', () => ({
  TransactionModal: ({ isOpen, initialDraft, onClose }: { isOpen: boolean; initialDraft: { goal_id?: string; debt_id?: string } | null; onClose: () => void }) => (
    isOpen ? <div role="dialog" aria-label="Add transaction"><output>{initialDraft?.goal_id ?? initialDraft?.debt_id ?? 'none'}</output><button type="button" onClick={onClose}>Close modal</button></div> : null
  ),
}));

vi.mock('../../components/TransactionFilters', () => ({ TransactionFilters: () => null }));
vi.mock('../../components/TransactionList', () => ({ TransactionList: () => null }));
vi.mock('../../components/TransactionSummaryBar', () => ({ TransactionSummaryBar: () => null }));
vi.mock('../../components/QuickAddCards', () => ({ QuickAddCards: () => null }));
vi.mock('../../components/ActivePriorityContext', () => ({ ActivePriorityContext: () => null }));
vi.mock('../../components/RecurringRulesPanel', () => ({
  RecurringRulesPanel: ({ onAdd }: { onAdd: () => void }) => <button onClick={onAdd}>Add recurring rule</button>,
}));
vi.mock('../../components/RecurringRuleModal', () => ({
  RecurringRuleModal: ({ isOpen, onSubmit }: { isOpen: boolean; onSubmit: (draft: RecurringRuleDraft) => Promise<void> }) => (
    isOpen && mocks.recurringDraft ? <button onClick={() => { void onSubmit(mocks.recurringDraft!); }}>Save recurring rule</button> : null
  ),
}));
vi.mock('../../components/DeleteRecurringRuleModal', () => ({ DeleteRecurringRuleModal: () => null }));
vi.mock('../../components/DeleteTransactionModal', () => ({ DeleteTransactionModal: () => null }));
vi.mock('../../components/QuickAddChipModal', () => ({ QuickAddChipModal: () => null }));
vi.mock('../../../onboarding', () => ({ OnboardingTooltip: ({ children }: { children: React.ReactNode }) => children }));

function LocationSearch() {
  return <output data-testid="location-search">{useLocation().search}</output>;
}

function pageTree(entry: string) {
  return (
    <MemoryRouter initialEntries={[entry]}>
      <TransactionsPage />
      <LocationSearch />
    </MemoryRouter>
  );
}

function renderPage(entry: string) {
  return render(pageTree(entry));
}

describe('TransactionsPage URL prefills', () => {
  const activeGoal = { id: '11111111-1111-4111-8111-111111111111', is_archived: false, name: 'Goal' };
  const activeDebt = { id: '22222222-2222-4222-8222-222222222222', is_archived: false, name: 'Debt' };

  function setLoadedTargets(goals = [activeGoal], debts = [activeDebt]) {
    mocks.useGoals.mockReturnValue({ data: goals, isError: false, isLoading: false, isSuccess: true });
    mocks.useDebts.mockReturnValue({ data: debts, isError: false, isLoading: false, isSuccess: true });
    mocks.useActiveFinancialPriority.mockReturnValue({ data: undefined, isLoading: false });
  }

  it('does not move a future first occurrence to today when skip-backdate remains set', async () => {
    const user = userEvent.setup();
    setLoadedTargets();
    mocks.createRecurringRule.mockResolvedValueOnce({ id: 'rule-id' });
    mocks.recurringDraft = {
      amount_cents: 25_000,
      category: 'housing',
      day_of_month: 1,
      description: 'Future bill',
      frequency: 'monthly',
      is_active: true,
      kind: 'expense',
      next_run_date: '2099-08-01',
      notes: null,
      skip_backdate: true,
      start_date: '2099-08-01',
    };
    renderPage('/transactions');

    await user.click(screen.getByRole('button', { name: 'Add recurring rule' }));
    await user.click(screen.getByRole('button', { name: 'Save recurring rule' }));

    expect(mocks.createRecurringRule).toHaveBeenCalledWith(expect.objectContaining({
      next_run_date: '2099-08-01',
      start_date: '2099-08-01',
      skip_backdate: true,
    }));
    mocks.recurringDraft = undefined;
  });

  it('opens a valid active goal once and router-clears only consumed prefill parameters', async () => {
    const user = userEvent.setup();
    setLoadedTargets();
    const view = renderPage(`/transactions?new=1&goal_id=${activeGoal.id}&q=rent&category=food`);

    expect(await screen.findByRole('dialog', { name: 'Add transaction' })).toHaveTextContent(activeGoal.id);
    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent('?q=rent&category=food'));

    await user.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(screen.queryByRole('dialog', { name: 'Add transaction' })).not.toBeInTheDocument();
    view.rerender(pageTree(`/transactions?new=1&goal_id=${activeGoal.id}&q=rent&category=food`));
    expect(screen.queryByRole('dialog', { name: 'Add transaction' })).not.toBeInTheDocument();
  });

  it('opens a valid debt once', async () => {
    setLoadedTargets();
    renderPage(`/transactions?new=1&debt_id=${activeDebt.id}`);

    expect(await screen.findByRole('dialog', { name: 'Add transaction' })).toHaveTextContent(activeDebt.id);
    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent(''));
  });

  it('consumes an unavailable target once without opening the modal', async () => {
    setLoadedTargets([], []);
    renderPage('/transactions?new=1&goal_id=33333333-3333-4333-8333-333333333333&q=rent');

    expect(await screen.findByRole('alert')).toHaveTextContent(/contribution target is unavailable/i);
    expect(screen.queryByRole('dialog', { name: 'Add transaction' })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent('?q=rent'));
  });

  it('waits for a failed target query to refetch successfully before consuming a valid prefill', async () => {
    const entry = `/transactions?new=1&goal_id=${activeGoal.id}&q=rent`;
    mocks.useGoals.mockReturnValue({ data: undefined, isError: true, isLoading: false, isSuccess: false });
    mocks.useDebts.mockReturnValue({ data: undefined, isError: true, isLoading: false, isSuccess: false });
    mocks.useActiveFinancialPriority.mockReturnValue({ data: undefined, isLoading: false });
    const view = renderPage(entry);

    expect(screen.queryByRole('dialog', { name: 'Add transaction' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('location-search')).toHaveTextContent(`?new=1&goal_id=${activeGoal.id}&q=rent`);

    setLoadedTargets([activeGoal], []);
    view.rerender(pageTree(entry));

    expect(await screen.findByRole('dialog', { name: 'Add transaction' })).toHaveTextContent(activeGoal.id);
    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent('?q=rent'));
  });
});
