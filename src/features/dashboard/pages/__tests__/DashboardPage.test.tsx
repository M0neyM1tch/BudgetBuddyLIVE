import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../../shared/api/errors';
import { DashboardPage } from '../DashboardPage';

const mocks = vi.hoisted(() => ({ useDashboard: vi.fn() }));
vi.mock('../../hooks/useDashboard', () => ({ useDashboard: mocks.useDashboard }));
vi.mock('../../../../shared/lib/env', () => ({ env: { features: { goalPacksEnabled: false } } }));
vi.mock('../../components/DashboardGreeting', () => ({ DashboardGreeting: () => <h2 id="dashboard-title">Dashboard</h2> }));
vi.mock('../../../goalPacks/dashboard/GoalPackDashboard', () => ({ GoalPackDashboard: () => null }));
vi.mock('../../../onboarding', () => ({ OnboardingTooltip: ({ children }: { children: React.ReactNode }) => children }));

function page() {
  return <MemoryRouter><DashboardPage /></MemoryRouter>;
}

describe('DashboardPage KPI failures', () => {
  it('replaces cached totals with the normalized error and retries the KPI query', async () => {
    const user = userEvent.setup();
    const kpisQuery = {
      data: {
        currentMonth: { incomeCents: 250_000, expenseCents: 50_000, netCents: 200_000 },
        previousMonth: { incomeCents: 200_000, expenseCents: 50_000, netCents: 150_000 },
        totalSavingsCents: 100_000, totalDebtCents: 75_000,
      },
      error: null as Error | null, isError: false, isLoading: false, refetch: vi.fn(),
    };
    mocks.useDashboard.mockReturnValue({
      kpisQuery,
      goalsQuery: { data: [], isLoading: false },
      debtsQuery: { data: [], isLoading: false },
      recentTransactionsQuery: { data: [], isLoading: false },
    });
    const view = render(page());
    expect(screen.getByRole('region', { name: 'Dashboard totals' })).toHaveTextContent('$2,500.00');

    const error = new AppError('Complete dashboard totals are unavailable. Please try again.', 'INCOMPLETE_DATA');
    kpisQuery.error = error;
    kpisQuery.isError = true;
    view.rerender(page());
    expect(screen.getByRole('region', { name: 'Dashboard totals error' })).toHaveTextContent(error.message);
    expect(screen.queryByRole('region', { name: 'Dashboard totals' })).not.toBeInTheDocument();
    expect(screen.queryByText('$2,500.00')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(kpisQuery.refetch).toHaveBeenCalledOnce();
  });
});
