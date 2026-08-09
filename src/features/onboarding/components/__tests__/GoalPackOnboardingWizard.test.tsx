import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoalPackOnboardingWizard } from '../GoalPackOnboardingWizard';

const mocks = vi.hoisted(() => ({
  complete: vi.fn(),
  createRecurringRule: vi.fn(),
  processRecurringRules: vi.fn(),
  processReset: vi.fn(),
  recalculate: vi.fn(),
  recurringRefetch: vi.fn(),
  setup: vi.fn(),
}));

vi.mock('../../../goalPacks', () => ({
  useCreateGoalPackOnboardingSetup: () => ({
    isPending: false,
    mutateAsync: mocks.setup,
  }),
  useRecalculateGoalPlan: () => ({
    isPending: false,
    mutateAsync: mocks.recalculate,
  }),
}));

vi.mock('../../../transactions/hooks/useTransactions', () => ({
  useCreateRecurringRule: () => ({
    isPending: false,
    mutateAsync: mocks.createRecurringRule,
  }),
  useProcessRecurringRules: () => ({
    isPending: false,
    mutateAsync: mocks.processRecurringRules,
    reset: mocks.processReset,
  }),
  useRecurringRules: () => ({
    data: [],
    refetch: mocks.recurringRefetch,
  }),
}));

vi.mock('../../hooks/useOnboarding', () => ({
  useCompleteOnboarding: () => ({
    isPending: false,
    mutateAsync: mocks.complete,
  }),
}));

vi.mock('../../utils/goalPackOnboarding', () => ({
  buildGoalPackOnboardingPlan: () => ({
    actionDraft: { action_type: 'contribute', is_completed: false, title: 'Next action' },
    debtDraft: null,
    goalDraft: {
      current_amount_cents: 0,
      name: 'Starter goal',
      target_amount_cents: 100_000,
    },
    goalPlanUpdate: {},
    priorityDraft: { priority_type: 'emergency_fund' },
  }),
}));

function LocationPath() {
  return <output data-testid="location-path">{useLocation().pathname}</output>;
}

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard/preferences']}>
      <GoalPackOnboardingWizard isOpen />
      <LocationPath />
    </MemoryRouter>,
  );
}

async function reachRecurringStep(priority: string) {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('Monthly income'), '1000');
  await user.type(screen.getByLabelText('Monthly expenses'), '500');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: new RegExp(priority, 'i') }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByLabelText(/Track monthly income/i));

  return user;
}

async function submitPlan(priority: string, startDate?: string) {
  const user = await reachRecurringStep(priority);
  if (startDate) {
    fireEvent.change(screen.getByLabelText(/First Occurrence/i), {
      target: { value: startDate },
    });
  }
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Create plan' }));
  return user;
}

beforeEach(() => {
  mocks.complete.mockReset().mockResolvedValue({});
  mocks.createRecurringRule.mockReset().mockImplementation(async (draft) => ({
    ...draft,
    created_at: '2026-08-08T00:00:00.000Z',
    id: '11111111-1111-4111-8111-111111111111',
    updated_at: '2026-08-08T00:00:00.000Z',
    user_id: '22222222-2222-4222-8222-222222222222',
  }));
  mocks.processRecurringRules.mockReset().mockResolvedValue({ limited: false });
  mocks.processReset.mockReset();
  mocks.recalculate.mockReset().mockResolvedValue({});
  mocks.recurringRefetch.mockReset().mockResolvedValue({ data: [] });
  mocks.setup.mockReset().mockResolvedValue({
    goal_id: '33333333-3333-4333-8333-333333333333',
  });

  HTMLDialogElement.prototype.showModal = vi.fn(function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

describe('GoalPackOnboardingWizard recurring catch-up', () => {
  it.each(['Emergency fund', 'Debt payoff', 'Major purchase', 'Custom goal'])(
    'processes rules that start today for %s onboarding',
    async (priority) => {
      renderWizard();
      await submitPlan(priority);

      await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
      expect(mocks.processRecurringRules).toHaveBeenCalledWith(
        expect.objectContaining({ throughDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }),
      );
      expect(mocks.processRecurringRules.mock.calls[0]?.[0]).not.toHaveProperty('userId');
      expect(screen.getByTestId('location-path')).toHaveTextContent('/dashboard');
    },
  );

  it('processes a past start date until the processor is no longer limited', async () => {
    mocks.processRecurringRules
      .mockResolvedValueOnce({ limited: true })
      .mockResolvedValueOnce({ limited: false });
    renderWizard();
    await submitPlan('Emergency fund', '2000-01-01');

    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
    expect(mocks.processRecurringRules).toHaveBeenCalledTimes(2);
  });

  it('does not process a future start date', async () => {
    renderWizard();
    await submitPlan('Emergency fund', '2999-01-01');

    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
    expect(mocks.processRecurringRules).not.toHaveBeenCalled();
  });

  it('preserves the saved setup after a processor failure and retries without recreating it', async () => {
    mocks.processRecurringRules.mockRejectedValueOnce(new Error('Failed to send a request'));
    renderWizard();
    const user = await submitPlan('Emergency fund', '2000-01-01');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /starter plan and recurring rules were saved.*due transactions are still pending/i,
    );
    expect(mocks.setup).toHaveBeenCalledTimes(1);
    expect(mocks.createRecurringRule).toHaveBeenCalledTimes(1);
    expect(mocks.complete).not.toHaveBeenCalled();

    mocks.processRecurringRules.mockResolvedValueOnce({ limited: false });
    await user.click(screen.getByRole('button', { name: 'Retry transaction processing' }));

    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
    expect(mocks.setup).toHaveBeenCalledTimes(1);
    expect(mocks.createRecurringRule).toHaveBeenCalledTimes(1);
    expect(mocks.processRecurringRules).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('location-path')).toHaveTextContent('/dashboard');
  });

  it('lets the user explicitly continue with pending transactions', async () => {
    mocks.processRecurringRules.mockRejectedValueOnce(new Error('Function unavailable'));
    renderWizard();
    const user = await submitPlan('Emergency fund', '2000-01-01');

    await screen.findByRole('button', { name: 'Continue without transactions' });
    await user.click(screen.getByRole('button', { name: 'Continue without transactions' }));

    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('location-path')).toHaveTextContent('/dashboard/transactions');
  });
});

describe('GoalPackOnboardingWizard debt payment fields', () => {
  it('uses compact helper copy and the shared alignment class', async () => {
    renderWizard();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: /Debt payoff/i }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    const plannedInput = screen.getByLabelText(/Planned monthly payment/i);
    const minimumInput = screen.getByLabelText(/Required minimum payment/i);
    expect(screen.getByText('The amount you plan to pay each month.')).toBeInTheDocument();
    expect(plannedInput.closest('label')).toHaveClass('priority-form-field--payment');
    expect(minimumInput.closest('label')).toHaveClass('priority-form-field--payment');
  });
});
