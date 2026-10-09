import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useTransactionFilters } from './useTransactionFilters';

function FilterProbe() {
  const { activeFilterCount, clearFilters, filters, setFilters } = useTransactionFilters();
  const location = useLocation();

  return (
    <>
      <output data-testid="filters">{JSON.stringify(filters)}</output>
      <output data-testid="count">{activeFilterCount}</output>
      <output data-testid="search">{location.search}</output>
      <button type="button" onClick={() => setFilters({ amountMax: 50 })}>Set invalid max</button>
      <button type="button" onClick={() => setFilters({ amountMax: 150 })}>Set valid max</button>
      <button type="button" onClick={clearFilters}>Clear filters</button>
    </>
  );
}

describe('useTransactionFilters', () => {
  it('sanitizes only malformed URL fields and preserves the remaining committed filters', () => {
    render(
      <MemoryRouter initialEntries={['/transactions?q=rent&category=food&amountMin=100&kind=transfer&amountMax=50']}>
        <FilterProbe />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('filters')).toHaveTextContent(
      JSON.stringify({ category: 'food', amountMin: 100, q: 'rent' }),
    );
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });

  it('commits only a valid full filter state and keeps unrelated parameters when clearing', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/transactions?new=1&unrelated=keep&q=rent&amountMin=100']}>
        <FilterProbe />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Set invalid max' }));
    expect(screen.getByTestId('search')).toHaveTextContent('amountMin=100');
    expect(screen.getByTestId('search')).not.toHaveTextContent('amountMax=50');

    await user.click(screen.getByRole('button', { name: 'Set valid max' }));
    expect(screen.getByTestId('search')).toHaveTextContent('amountMax=150');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByTestId('search')).toHaveTextContent('?new=1&unrelated=keep');
  });
});
