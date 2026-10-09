import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TransactionSummaryBar } from '../TransactionSummaryBar';

describe('TransactionSummaryBar', () => {
  it('does not render stale totals while loading and explains empty and error states', () => {
    const { rerender } = render(
      <TransactionSummaryBar
        summary={{ income_cents: 100, expense_cents: 20, net_cents: 80, transaction_count: 1 }}
        isLoading
      />,
    );
    expect(screen.queryByText('$1.00')).not.toBeInTheDocument();

    rerender(<TransactionSummaryBar isLoading={false} summary={undefined} />);
    expect(screen.getByText('No matching transactions to summarize.')).toBeInTheDocument();

    rerender(<TransactionSummaryBar isLoading={false} error="Unavailable" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load totals');
  });
});
