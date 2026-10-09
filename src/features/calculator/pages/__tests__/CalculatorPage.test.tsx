import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CalculatorPage } from '../CalculatorPage';

const mocks = vi.hoisted(() => ({ fetchTransactions: vi.fn() }));
vi.mock('../../../auth/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'owner' } }) }));
vi.mock('../../../../shared/lib/env', () => ({ env: { features: { goalPacksEnabled: false } } }));
vi.mock('../../../../shared/lib/supabase', () => ({ supabase: { rpc: vi.fn() } }));
vi.mock('../../../onboarding', () => ({ OnboardingTooltip: ({ children }: { children: ReactNode }) => children }));
vi.mock('../../api/calculator.api', () => ({
  fetchCalculatorTransactions: mocks.fetchTransactions,
  fetchCalculatorRecurringRules: () => Promise.resolve([]),
  fetchCalculatorGoals: () => Promise.resolve([]),
}));

afterEach(() => vi.useRealTimers());

describe('CalculatorPage independent Budget Health history', () => {
  it('allows a complete selected month after the historical planner query fails', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-08T12:00:00'));
    mocks.fetchTransactions.mockImplementation((_owner: string, from: string) => {
      if (from === '2026-04-01') return Promise.reject(new Error('Six-month history is incomplete.'));
      return Promise.resolve(from === '2026-10-01' ? [{
        id: 'income', kind: 'income', category: 'pay', amountCents: 250_000,
        date: '2026-10-08', description: '', goalId: null,
      }] : []);
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    render(<QueryClientProvider client={client}><CalculatorPage /></QueryClientProvider>);

    expect(await screen.findByRole('alert')).toHaveTextContent('Six-month history is incomplete.');
    expect(mocks.fetchTransactions).toHaveBeenCalledWith('owner', '2026-04-01', '2026-09-30');
    fireEvent.click(screen.getByRole('tab', { name: 'Budget Health' }));
    await screen.findByText('Budget Health needs income for the selected month');
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-10' } });

    expect(await screen.findByText('$2,500.00')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mocks.fetchTransactions).toHaveBeenLastCalledWith('owner', '2026-10-01', '2026-10-31');
    fireEvent.click(screen.getByRole('tab', { name: 'Freedom Number' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Six-month history is incomplete.');
    expect(mocks.fetchTransactions).toHaveBeenLastCalledWith('owner', '2026-04-01', '2026-09-30');
  });
});
