import { ChevronDown, FilterX, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_KIND_OPTIONS,
} from '../constants/categories';
import type { TransactionFilters as Filters } from '../types/transactions.types';
import { transactionFiltersSchema } from '../schemas/transactions.schema';

type TransactionFiltersProps = {
  filters: Filters;
  hasFilters: boolean;
  activeFilterCount: number;
  onChange: (updates: Partial<Filters>) => void;
  onClear: () => void;
};

export function TransactionFilters({
  filters,
  hasFilters,
  activeFilterCount,
  onChange,
  onClear,
}: TransactionFiltersProps) {
  const panelId = useId();
  const amountErrorId = useId();
  const [isOpen, setIsOpen] = useState(hasFilters);
  const committedMin = filters.amountMin == null ? '' : String(filters.amountMin);
  const committedMax = filters.amountMax == null ? '' : String(filters.amountMax);
  const [amountDrafts, setAmountDrafts] = useState({ min: committedMin, max: committedMax });
  const previousCommittedAmounts = useRef({ min: committedMin, max: committedMax });

  useEffect(() => {
    const previous = previousCommittedAmounts.current;
    setAmountDrafts((current) => ({
      min: current.min === previous.min || current.min === committedMin
        ? committedMin
        : current.min,
      max: current.max === previous.max || current.max === committedMax
        ? committedMax
        : current.max,
    }));
    previousCommittedAmounts.current = { min: committedMin, max: committedMax };
  }, [committedMax, committedMin]);

  const parseAmountDraft = (value: string, key: 'amountMin' | 'amountMax') => {
    if (value === '') return { value: undefined, isValid: true } as const;

    const parsed = Number(value);
    const validation = transactionFiltersSchema.safeParse({ [key]: parsed });
    return {
      value: validation.success ? validation.data[key] : undefined,
      isValid: validation.success,
    } as const;
  };
  const parsedMin = parseAmountDraft(amountDrafts.min, 'amountMin');
  const parsedMax = parseAmountDraft(amountDrafts.max, 'amountMax');
  const hasAmountRangeError =
    parsedMin.isValid &&
    parsedMax.isValid &&
    parsedMin.value !== undefined &&
    parsedMax.value !== undefined &&
    parsedMin.value > parsedMax.value;
  const hasAmountFormatError = !parsedMin.isValid || !parsedMax.isValid;
  const amountError = hasAmountRangeError
    ? 'Min amount must be less than or equal to max amount.'
    : hasAmountFormatError
      ? 'Enter an amount from 0 to 1,000,000.'
      : null;

  function handleAmountChange(key: 'amountMin' | 'amountMax', value: string) {
    const draftKey = key === 'amountMin' ? 'min' : 'max';
    const nextDrafts = { ...amountDrafts, [draftKey]: value };
    setAmountDrafts(nextDrafts);

    const nextMin = parseAmountDraft(nextDrafts.min, 'amountMin');
    const nextMax = parseAmountDraft(nextDrafts.max, 'amountMax');
    const isRangeValid =
      nextMin.value === undefined ||
      nextMax.value === undefined ||
      nextMin.value <= nextMax.value;

    if (!nextMin.isValid || !nextMax.isValid || !isRangeValid) return;

    // Commit the complete valid pair. One side may have remained only as a
    // local draft while the range was invalid, so committing just the field
    // changed last would leave the URL/query out of sync with the visible UI.
    onChange({ amountMin: nextMin.value, amountMax: nextMax.value });
  }

  function handleClear() {
    setAmountDrafts({ min: '', max: '' });
    previousCommittedAmounts.current = { min: '', max: '' };
    onClear();
  }

  return (
    <section className="transactions-filter-disclosure" aria-label="Transaction filters">
      <button
        type="button"
        className="transactions-filter-trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>Search and filters</span>
        {activeFilterCount > 0 ? <small>{activeFilterCount} active</small> : null}
        <ChevronDown className={isOpen ? 'is-open' : ''} size={18} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div id={panelId} className="transactions-filters">
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
          value={amountDrafts.min}
          aria-invalid={Boolean(amountError)}
          aria-describedby={amountError ? amountErrorId : undefined}
          onChange={(event) => handleAmountChange('amountMin', event.target.value)}
        />
      </label>

      <label className="transactions-filter-field">
        <span>Max amount</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amountDrafts.max}
          aria-invalid={Boolean(amountError)}
          aria-describedby={amountError ? amountErrorId : undefined}
          onChange={(event) => handleAmountChange('amountMax', event.target.value)}
        />
      </label>

      {amountError ? (
        <p id={amountErrorId} className="transactions-filter-error" role="alert">
          {amountError}
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        className="transactions-clear-filters"
        disabled={!hasFilters}
        leftIcon={<FilterX size={16} aria-hidden="true" />}
        onClick={handleClear}
      >
        Clear
      </Button>
        </div>
      ) : null}
    </section>
  );
}
