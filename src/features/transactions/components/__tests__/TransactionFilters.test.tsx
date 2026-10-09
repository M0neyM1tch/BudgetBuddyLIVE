import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TransactionFilters } from '../TransactionFilters';

describe('TransactionFilters', () => {
  it('keeps committed filters visible while an inverted amount draft is corrected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TransactionFilters
        filters={{ q: 'rent', category: 'food', amountMin: 100 }}
        hasFilters
        activeFilterCount={3}
        onChange={onChange}
        onClear={vi.fn()}
      />,
    );

    const maxAmount = screen.getByRole('spinbutton', { name: 'Max amount' });
    fireEvent.change(maxAmount, { target: { value: '50' } });

    expect(screen.getByRole('alert')).toHaveTextContent(/min amount must be less/i);
    expect(screen.getByRole('searchbox')).toHaveValue('rent');
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('food');
    expect(screen.getByRole('button', { name: /search and filters/i })).toHaveTextContent('3 active');
    expect(onChange).not.toHaveBeenCalled();

    await user.clear(maxAmount);
    await user.type(maxAmount, '150');
    expect(onChange).toHaveBeenLastCalledWith({ amountMin: 100, amountMax: 150 });
  });

  it('starts collapsed when no URL filter is active', () => {
    render(<TransactionFilters filters={{}} hasFilters={false} activeFilterCount={0} onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByRole('button', { name: /search and filters/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('clears raw amount drafts alongside the committed filter reset', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <TransactionFilters
        filters={{ amountMin: 100 }}
        hasFilters
        activeFilterCount={1}
        onChange={vi.fn()}
        onClear={onClear}
      />,
    );

    const maxAmount = screen.getByRole('spinbutton', { name: 'Max amount' });
    await user.type(maxAmount, '50');
    expect(maxAmount).toHaveValue(50);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('spinbutton', { name: 'Min amount' })).toHaveValue(null);
    expect(maxAmount).toHaveValue(null);
    expect(onClear).toHaveBeenCalledOnce();
  });
});
