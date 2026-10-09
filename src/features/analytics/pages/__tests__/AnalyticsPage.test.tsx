import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../../shared/api/errors';
import { AnalyticsPage } from '../AnalyticsPage';

const mocks = vi.hoisted(() => ({ useAnalytics: vi.fn() }));
vi.mock('../../hooks/useAnalytics', () => ({ useAnalytics: mocks.useAnalytics }));
vi.mock('../../../../shared/lib/env', () => ({ env: { features: { goalPacksEnabled: false } } }));
vi.mock('../../../onboarding', () => ({ OnboardingTooltip: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('../../components/GoalAwareAnalyticsPanel', () => ({ GoalAwareAnalyticsPanel: () => null }));
vi.mock('../../components/IncomeExpenseChart', () => ({ IncomeExpenseChart: () => <div>Cash flow chart</div> }));
vi.mock('../../components/SpendingByCategoryChart', () => ({ SpendingByCategoryChart: () => null }));
vi.mock('../../components/DailySpendingChart', () => ({ DailySpendingChart: () => null }));
vi.mock('../../components/TopCategoriesList', () => ({ TopCategoriesList: () => null }));
vi.mock('../../components/IncomeSources', () => ({ IncomeSources: () => null }));
vi.mock('../../components/GoalsProgressSummary', () => ({ GoalsProgressSummary: () => null }));
vi.mock('../../components/DebtProgressSummary', () => ({ DebtProgressSummary: () => null }));

function query<T>(data: T) {
  return { data, isLoading: false, isError: false, error: null as Error | null, refetch: vi.fn() };
}

function page() {
  return <MemoryRouter><AnalyticsPage /></MemoryRouter>;
}

describe('AnalyticsPage query failures', () => {
  it.each(['transactionsQuery', 'priorTransactionsQuery', 'goalsQuery', 'debtsQuery'] as const)(
    'hides cached totals and exposes the %s failure with a working retry',
    async (failedQuery) => {
      const user = userEvent.setup();
      const result = {
        transactionsQuery: query([{ id: 'income-1', date: '2026-10-01', amountCents: 250_000, kind: 'income', category: 'salary' }]),
        priorTransactionsQuery: query([{ id: 'income-2', date: '2026-09-01', amountCents: 200_000, kind: 'income', category: 'salary' }]),
        goalsQuery: query([]),
        debtsQuery: query([]),
      };
      mocks.useAnalytics.mockReturnValue(result);
      const view = render(page());
      expect(screen.getByRole('region', { name: 'Analytics summary' })).toHaveTextContent('$2,500.00');
      expect(screen.getByText('Cash flow chart')).toBeInTheDocument();

      const error = new AppError('The complete history is unavailable. Please try again.', 'INCOMPLETE_DATA');
      result[failedQuery].isError = true;
      result[failedQuery].error = error;
      view.rerender(page());
      expect(screen.getByRole('alert')).toHaveTextContent(error.message);
      expect(screen.queryByRole('region', { name: 'Analytics summary' })).not.toBeInTheDocument();
      expect(screen.queryByText('Cash flow chart')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Try again' }));
      Object.values(result).forEach((dataQuery) => expect(dataQuery.refetch).toHaveBeenCalledOnce());
    },
  );
});
