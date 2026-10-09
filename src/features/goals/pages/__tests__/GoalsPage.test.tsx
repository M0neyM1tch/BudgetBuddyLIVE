import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../../shared/api/errors';
import { GoalsPage } from '../GoalsPage';

const mocks = vi.hoisted(() => ({ useGoals: vi.fn(), useTransactions: vi.fn(), refetch: vi.fn() }));

vi.mock('../../hooks/useGoals', () => {
  const mutation = { error: null, isPending: false, mutate: vi.fn(), mutateAsync: vi.fn(), reset: vi.fn() };
  return {
    useGoals: mocks.useGoals,
    useCreateGoal: () => mutation,
    useUpdateGoal: () => mutation,
    useArchiveGoal: () => mutation,
    useDeleteGoalPermanently: () => mutation,
    useRestoreGoal: () => mutation,
    useAllocateToGoal: () => mutation,
  };
});
vi.mock('../../../transactions', () => ({ useTransactions: mocks.useTransactions }));
vi.mock('../../../onboarding', () => ({ OnboardingTooltip: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('../../components/GoalModal', () => ({ GoalModal: () => null }));
vi.mock('../../components/AllocateModal', () => ({ AllocateModal: () => null }));
vi.mock('../../components/ArchiveGoalModal', () => ({ ArchiveGoalModal: () => null }));
vi.mock('../../components/DeleteGoalModal', () => ({ DeleteGoalModal: () => null }));

const cachedTransactions = [{
  id: 'contribution-1', goal_id: 'goal-1', kind: 'expense',
  amount_cents: 25_000, transaction_date: '2026-09-01',
}];
const historyError = new AppError('Your transaction history could not be loaded completely. Please try again.', 'INCOMPLETE_DATA');

function setHistory(data: typeof cachedTransactions | undefined, error: Error | null = null, isLoading = false) {
  mocks.useTransactions.mockReturnValue({ data, error, isError: Boolean(error), isLoading, refetch: mocks.refetch });
}

function page() {
  return <MemoryRouter><GoalsPage /></MemoryRouter>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  mocks.useGoals.mockReturnValue({
    data: [{
      id: 'goal-1', name: 'Emergency fund', icon: 'piggy-bank', color: null,
      is_archived: false, current_amount_cents: 25_000, target_amount_cents: 100_000,
      target_date: null, progress_pct: 25, days_remaining: null,
      amount_remaining_cents: 75_000, status: 'on_track',
    }],
    error: null, isLoading: false,
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('GoalsPage transaction history failures', () => {
  it('waits for initial contribution history before showing projections while retaining goal cards', () => {
    setHistory(undefined, null, true);
    render(page());
    expect(screen.getByText('Loading goal contribution history')).toBeInTheDocument();
    expect(screen.queryByLabelText('Monthly contribution')).not.toBeInTheDocument();
    expect(screen.queryByText('Estimated finish')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Emergency fund' })).toBeInTheDocument();
  });

  it('replaces a cached projection with a retryable error while retaining goal balances', async () => {
    const user = userEvent.setup();
    setHistory(cachedTransactions);
    const view = render(page());
    expect(screen.getByLabelText('Monthly contribution')).toHaveValue(250);
    expect(screen.getByText('Estimated finish')).toBeInTheDocument();

    setHistory(cachedTransactions, historyError);
    view.rerender(page());
    expect(screen.getByRole('alert')).toHaveTextContent(historyError.message);
    expect(screen.queryByLabelText('Monthly contribution')).not.toBeInTheDocument();
    expect(screen.queryByText('Estimated finish')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Emergency fund' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
    setHistory(cachedTransactions);
    view.rerender(page());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Monthly contribution')).toHaveValue(250);
  });

  it('does not present an initial history failure as an empty contribution history', () => {
    setHistory(undefined, historyError);
    render(page());
    expect(screen.getByRole('alert')).toHaveTextContent(historyError.message);
    expect(screen.queryByText(/No contribution history found/)).not.toBeInTheDocument();
    expect(screen.queryByText('Estimated finish')).not.toBeInTheDocument();
  });
});
