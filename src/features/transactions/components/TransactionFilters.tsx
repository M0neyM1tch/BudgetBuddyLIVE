import { FilterX, Search } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_KIND_OPTIONS,
} from '../constants/categories';
import type { TransactionFilters as Filters } from '../types/transactions.types';

type TransactionFiltersProps = {
  filters: Filters;
  hasFilters: boolean;
  onChange: (updates: Partial<Filters>) => void;
  onClear: () => void;
};

export function TransactionFilters({
  filters,
  hasFilters,
  onChange,
  onClear,
}: TransactionFiltersProps) {
  const amountMin = filters.amountMin == null ? '' : String(filters.amountMin);
  const amountMax = filters.amountMax == null ? '' : String(filters.amountMax);
  const hasAmountRangeError =
    filters.amountMin != null &&
    filters.amountMax != null &&
    filters.amountMin > filters.amountMax;

  return (
    <section className="transactions-filters" aria-label="Transaction filters">
      <label className="transactions-filter-field transactions-filter-field--search">
        <span>Search</span>
        <div className="transactions-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={filters.q ?? ''}
            placeholder="Description, category, or notes"
            onChange={(event) => onChange({ q: event.target.value || undefined })}
          />
        </div>
      </label>

      <label className="transactions-filter-field">
        <span>From</span>
        <input
          type="date"
          value={filters.from ?? ''}
          onInput={(event) => onChange({ from: event.currentTarget.value || undefined })}
          onChange={(event) => onChange({ from: event.currentTarget.value || undefined })}
        />
      </label>

      <label className="transactions-filter-field">
        <span>To</span>
        <input
          type="date"
          value={filters.to ?? ''}
          onInput={(event) => onChange({ to: event.currentTarget.value || undefined })}
          onChange={(event) => onChange({ to: event.currentTarget.value || undefined })}
        />
      </label>

      <label className="transactions-filter-field">
        <span>Kind</span>
        <select
          value={filters.kind ?? ''}
          onChange={(event) =>
            onChange({ kind: event.target.value ? (event.target.value as Filters['kind']) : undefined })
          }
        >
          <option value="">All kinds</option>
          {TRANSACTION_KIND_OPTIONS.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </select>
      </label>

      <label className="transactions-filter-field">
        <span>Category</span>
        <select
          value={filters.category ?? ''}
          onChange={(event) => onChange({ category: event.target.value || undefined })}
        >
          <option value="">All categories</option>
          {TRANSACTION_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className="transactions-filter-field">
        <span>Min amount</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amountMin}
          aria-invalid={hasAmountRangeError}
          onChange={(event) =>
            onChange({
              amountMin: event.target.value === '' ? undefined : Number(event.target.value),
            })
          }
        />
      </label>

      <label className="transactions-filter-field">
        <span>Max amount</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amountMax}
          aria-invalid={hasAmountRangeError}
          onChange={(event) =>
            onChange({
              amountMax: event.target.value === '' ? undefined : Number(event.target.value),
            })
          }
        />
      </label>

      {hasAmountRangeError ? (
        <p className="transactions-filter-error" role="alert">
          Min amount must be less than max amount.
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        className="transactions-clear-filters"
        disabled={!hasFilters}
        leftIcon={<FilterX size={16} aria-hidden="true" />}
        onClick={onClear}
      >
        Clear
      </Button>
    </section>
  );
}
