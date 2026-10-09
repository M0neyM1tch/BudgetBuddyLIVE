import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../../shared/api/errors';
import { DebtsPage } from '../DebtsPage';

const mocks = vi.hoisted(() => ({ useDebts: vi.fn(), useTransactions: vi.fn(), refetch: vi.fn() }));

vi.mock('../../hooks/useDebts', () => {
  const mutation = { error: null, isPending: false, mutate: vi.fn(), mutateAsync: vi.fn(), reset: vi.fn() };
  return {
    useDebts: mocks.useDebts,
    useCreateDebt: () => mutation,
    useUpdateDebt: () => mutation,
    useArchiveDebt: () => mutation,
    useDeleteDebtPermanently: () => mutation,
    useRestoreDebt: () => mutation,
  };
});
vi.mock('../../../transactions', () => {
  const mutation = { error: null, isPending: false, mutate: vi.fn(), mutateAsync: vi.fn(), reset: vi.fn() };
  return {
    useTransactions: mocks.useTransactions,
    useUpdateTransaction: () => mutation,
    useDeleteTransaction: () => mutation,
  };
});
vi.mock('../../../goals/hooks/useGoals', () => ({ useGoals: () => ({ data: [] }) }));
vi.mock('../../../onboarding', () => ({ OnboardingTooltip: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('../../components/DebtModal', () => ({ DebtModal: () => null }));
vi.mock('../../components/ArchiveDebtModal', () => ({ ArchiveDebtModal: () => null }));
vi.mock('../../components/DeleteDebtModal', () => ({ DeleteDebtModal: () => null }));
vi.mock('../../../transactions/components/TransactionModal', () => ({ TransactionModal: () => null }));
vi.mock('../../../transactions/components/DeleteTransactionModal', () => ({ DeleteTransactionModal: () => null }));

const cachedPayments = [{
  id: 'payment-1', debt_id: 'debt-1', amount_cents: 12_345, transaction_date: '2026-09-01',
}];
const historyError = new AppError('Your debt payment history could not be loaded completely. Please try again.', 'INCOMPLETE_DATA');

function setHistory(data: typeof cachedPayments | undefined, error: Error | null = null, isLoading = false) {
  mocks.useTransactions.mockReturnValue({ data, error, isError: Boolean(error), isLoading, refetch: mocks.refetch });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  mocks.useDebts.mockReturnValue({
    data: [{
      id: 'debt-1', name: 'Credit card', icon: 'credit-card', color: null,
      is_archived: false, current_balance_cents: 90_000, principal_cents: 100_000,
      minimum_payment_cents: 10_000, interest_rate_basis_points: 1200,
      payment_frequency: 'monthly', debt_type: 'credit_card', start_date: null,
      payoff_progress_pct: 10, status: 'on_track',
    }],
    error: null, isLoading: false,
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('DebtsPage payment history failures', () => {
  it('hides cached payment history and payoff projections after a refetch fails', async () => {
    const user = userEvent.setup();
    setHistory(cachedPayments);
    const view = render(<DebtsPage />);
    expect(screen.getByText('Recent payments')).toBeInTheDocument();
    expect(screen.getByText('$123.45')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Debt Payoff Planner' })).toBeInTheDocument();

    setHistory(cachedPayments, historyError);
    view.rerender(<DebtsPage />);
    expect(screen.getByRole('alert')).toHaveTextContent(historyError.message);
    expect(screen.queryByText('Recent payments')).not.toBeInTheDocument();
    expect(screen.queryByText('$123.45')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Debt Payoff Planner' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Debts summary')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
    setHistory(cachedPayments);
    view.rerender(<DebtsPage />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('$123.45')).toBeInTheDocument();
  });

  it('does not present an initial history failure as no recorded payments', () => {
    setHistory(undefined, historyError);
    render(<DebtsPage />);
    expect(screen.getByRole('alert')).toHaveTextContent(historyError.message);
    expect(screen.queryByText('No payments recorded yet.')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Debt Payoff Planner' })).not.toBeInTheDocument();
  });

  it('waits for payment history before showing debt cards', () => {
    setHistory(undefined, null, true);
    render(<DebtsPage />);
    expect(screen.getByText('Loading debt payment history')).toBeInTheDocument();
    expect(screen.queryByText('No payments recorded yet.')).not.toBeInTheDocument();
  });
});
