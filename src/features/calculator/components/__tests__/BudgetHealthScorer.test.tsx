import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CalculatorPrefillData } from '../../types/calculator.types';
import { BudgetHealthScorer } from '../BudgetHealthScorer';

const data: CalculatorPrefillData = {
  historyRange: { from: '2026-03-01', to: '2026-08-31' },
  goals: [],
  recurringRules: [],
  transactions: [{
    id: 'income',
    amountCents: 500_000,
    category: 'pay',
    date: '2026-07-15',
    description: 'Synthetic income',
    goalId: null,
    kind: 'income',
  }],
};

afterEach(() => vi.useRealTimers());

describe('Budget Health month selection', () => {
  it('keeps month selection available when moving between empty and populated months', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-15T12:00:00'));
    render(<BudgetHealthScorer data={data} />);

    expect(screen.getByText('Budget Health needs income for the selected month')).toBeInTheDocument();
    expect(screen.getByLabelText('Month')).toHaveValue('2026-08');

    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-07' } });
    expect(screen.queryByText('Budget Health needs income for the selected month')).not.toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-06' } });
    expect(screen.getByText('Budget Health needs income for the selected month')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2026-07' } });
    expect(screen.queryByText('Budget Health needs income for the selected month')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Month')).toHaveValue('2026-07');
  });
});
