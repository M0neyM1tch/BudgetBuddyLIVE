import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { centsToDisplay } from '../../../shared/utils/currency';
import { getCategoryIcon } from '../../transactions';
import {
  buildCategoryBuckets,
  periodDelta,
} from '../utils/analytics.utils';
import type { AnalyticsTransaction, CategoryBucket } from '../types/analytics.types';

type TopCategoriesListProps = {
  transactions: AnalyticsTransaction[];
  priorTransactions: AnalyticsTransaction[];
  selectedCategory: string | null;
  onClearCategory: () => void;
  isLoading: boolean;
};

function deltaLabel(bucket: CategoryBucket): string {
  const delta = periodDelta(bucket.totalCents, bucket.priorCents ?? 0);
  if (delta === null) return 'New';
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

function deltaTone(bucket: CategoryBucket): 'positive' | 'negative' | 'neutral' {
  const prior = bucket.priorCents ?? 0;
  const delta = bucket.totalCents - prior;
  if (delta === 0) return 'neutral';
  return delta < 0 ? 'positive' : 'negative';
}

export function TopCategoriesList({
  transactions,
  priorTransactions,
  selectedCategory,
  onClearCategory,
  isLoading,
}: TopCategoriesListProps) {
  const buckets = buildCategoryBuckets(transactions, 'expense', priorTransactions);
  const visibleBuckets = selectedCategory
    ? buckets.filter((bucket) => bucket.category === selectedCategory)
    : buckets.slice(0, 8);

  return (
    <section className="analytics-panel" aria-labelledby="top-categories-title">
      <div className="analytics-panel-header">
        <div>
          <p className="section-kicker">Ranked spending</p>
          <h3 id="top-categories-title">Top categories</h3>
        </div>
        {selectedCategory ? (
          <Button type="button" variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={onClearCategory}>
            Clear
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="analytics-ranked-list">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="analytics-ranked-row analytics-skeleton" key={index}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : visibleBuckets.length === 0 ? (
        <p className="analytics-empty-copy">No spending categories in this period.</p>
      ) : (
        <div className="analytics-ranked-list">
          {visibleBuckets.map((bucket, index) => {
            const Icon = getCategoryIcon(bucket.category);
            const tone = deltaTone(bucket);

            return (
              <article className="analytics-ranked-row" key={bucket.category}>
                <span className="analytics-rank">{index + 1}</span>
                <div className="analytics-ranked-icon" aria-hidden="true">
                  <Icon size={17} />
                </div>
                <div className="analytics-ranked-main">
                  <h4>{bucket.label}</h4>
                  <p>{bucket.percentage.toFixed(1)}% of expenses</p>
                </div>
                <div className="analytics-ranked-side">
                  <strong>{centsToDisplay(bucket.totalCents)}</strong>
                  <span className={clsx('analytics-delta', `analytics-delta--${tone}`)}>
                    {deltaLabel(bucket)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
