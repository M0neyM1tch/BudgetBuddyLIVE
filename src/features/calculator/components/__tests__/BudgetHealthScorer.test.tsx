import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CalculatorTransaction } from '../../types/calculator.types';
import { BudgetHealthScorer } from '../BudgetHealthScorer';

const mocks = vi.hoisted(() => ({ fetchTransactions: vi.fn() }));
vi.mock('../../../auth/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'owner' } }) }));
vi.mock('../../api/calculator.api', () => ({ fetchCalculatorTransactions: mocks.fetchTransactions }));

const income: CalculatorTransaction = {
  id: 'income', amountCents: 500_000, category: 'pay', date: '2026-10-08',
  description: 'Synthetic income', goalId: null, kind: 'income',
};

function renderScorer() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(<QueryClientProvider client={client}><BudgetHealthScorer /></QueryClientProvider>);
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-08T12:00:00'));
  mocks.fetchTransactions.mockReset();
});
afterEach(() => vi.useRealTimers());

describe('Budget Health month selection', () => {
  it('requests and calculates the current month even when the initial completed month is empty', async () => {
    mocks.fetchTransactions.mockImplementation((_owner: string, from: string) =>
      Promise.resolve(from === '2026-10-01' ? [income] : []));
    renderScorer();

    expect(await screen.findByText('Budget Health needs income for the selected month')).toBeInTheDocument();
    expect(mocks.fetchTransactions).toHaveBeenCalledWith('owner', '2026-09-01', '2026-09-30');
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-10' } });

    expect(await screen.findByText('$5,000.00')).toBeInTheDocument();
    expect(mocks.fetchTransactions).toHaveBeenLastCalledWith('owner', '2026-10-01', '2026-10-31');
    expect(screen.queryByText('Budget Health needs income for the selected month')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2025-12' } });
    expect(await screen.findByText('Budget Health needs income for the selected month')).toBeInTheDocument();
    expect(mocks.fetchTransactions).toHaveBeenLastCalledWith('owner', '2025-12-01', '2025-12-31');
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-10' } });
    expect(await screen.findByText('$5,000.00')).toBeInTheDocument();
  });

  it('hides old totals while the selected month loads and surfaces failed completeness instead of empty results', async () => {
    mocks.fetchTransactions.mockResolvedValueOnce([{ ...income, date: '2026-09-15' }]);
    renderScorer();
    expect(await screen.findByText('$5,000.00')).toBeInTheDocument();

    let rejectMonth!: (error: Error) => void;
    mocks.fetchTransactions.mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectMonth = reject; }));
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-10' } });
    expect(screen.getByLabelText('Loading selected month')).toBeInTheDocument();
    expect(screen.queryByText('$5,000.00')).not.toBeInTheDocument();
    expect(screen.queryByText('Budget Health needs income for the selected month')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Month')).toHaveValue('2026-10');

    await act(async () => { rejectMonth(new Error('Complete calculator transaction history is unavailable.')); });
    expect(await screen.findByRole('alert')).toHaveTextContent('Complete calculator transaction history is unavailable.');
    expect(screen.queryByText('$5,000.00')).not.toBeInTheDocument();
    expect(screen.queryByText('Budget Health needs income for the selected month')).not.toBeInTheDocument();

    mocks.fetchTransactions.mockResolvedValueOnce([income]);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('$5,000.00')).toBeInTheDocument();
    expect(mocks.fetchTransactions).toHaveBeenLastCalledWith('owner', '2026-10-01', '2026-10-31');
  });

  it('retains a valid bounded query when the month input is cleared', async () => {
    mocks.fetchTransactions.mockResolvedValue([]);
    renderScorer();
    await screen.findByText('Budget Health needs income for the selected month');
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '' } });

    expect(screen.getByLabelText('Month')).toHaveValue('2026-09');
    expect(mocks.fetchTransactions).toHaveBeenCalledTimes(1);
    expect(mocks.fetchTransactions).toHaveBeenCalledWith('owner', '2026-09-01', '2026-09-30');
  });
});
