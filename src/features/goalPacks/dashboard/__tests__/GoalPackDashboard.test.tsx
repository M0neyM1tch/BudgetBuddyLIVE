import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { GoalPackDashboard } from '../GoalPackDashboard';

const hookMocks = vi.hoisted(() => ({
  useGoalPackDashboard: vi.fn(),
  useRecalculateActiveGoalPlan: vi.fn(),
}));

vi.mock('../../hooks/useGoalPacks', () => hookMocks);

describe('GoalPackDashboard', () => {
  it('hides confidence and provides a meaningful next-move route without action status controls', () => {
    hookMocks.useGoalPackDashboard.mockReturnValue({
      data: {
        actions: [
          {
            action_type: 'review_spending_leak',
            description: 'Find the monthly gap or move the target date.',
            id: 'action-1',
            impact_label: null,
            title: 'Close the monthly gap',
          },
        ],
        goal: {
          confidence_score: 68,
          current_amount_cents: 250_000,
          goal_type: 'major_purchase',
          id: 'goal-1',
          last_plan_calculated_at: '2026-06-30T00:00:00.000Z',
          monthly_commitment_cents: 50_000,
          name: 'First home fund',
          target_amount_cents: 1_000_000,
          target_date: '2027-02-28',
        },
        priority: {
          active_goal_id: 'goal-1',
          currency_code: 'CAD',
          monthly_expenses_cents: 300_000,
          monthly_income_cents: 550_000,
          top_priority_type: 'major_purchase',
        },
        snapshot: null,
      },
      isError: false,
      isLoading: false,
    });
    hookMocks.useRecalculateActiveGoalPlan.mockReturnValue({ isError: false, isPending: false, mutateAsync: vi.fn() });

    render(
      <MemoryRouter>
        <GoalPackDashboard />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument();
    expect(screen.getByText('Recommended next move')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Refine goal plan' })).toHaveAttribute(
      'href',
      '/dashboard/goals',
    );
    expect(screen.queryByRole('button', { name: 'Complete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    expect(screen.getByText('What shapes your target date').closest('details')).toHaveAttribute('open');
  });
});
