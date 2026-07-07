import { centsToDisplay } from '../../../shared/utils/currency';
import { getCategoryIcon } from '../../transactions';
import { buildCategoryBuckets } from '../utils/analytics.utils';
import type { AnalyticsTransaction } from '../types/analytics.types';

type IncomeSourcesProps = {
  transactions: AnalyticsTransaction[];
  isLoading: boolean;
};

export function IncomeSources({ transactions, isLoading }: IncomeSourcesProps) {
  const buckets = buildCategoryBuckets(transactions, 'income').slice(0, 8);

  return (
    <section className="analytics-panel" aria-labelledby="income-sources-title">
      <div className="analytics-panel-header">
        <div>
          <p className="section-kicker">Income</p>
          <h3 id="income-sources-title">Income sources</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="analytics-ranked-list">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="analytics-ranked-row analytics-skeleton" key={index}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : buckets.length === 0 ? (
        <p className="analytics-empty-copy">No income sources in this period.</p>
      ) : (
        <div className="analytics-ranked-list">
          {buckets.map((bucket, index) => {
            const Icon = getCategoryIcon(bucket.category);

            return (
              <article className="analytics-ranked-row" key={bucket.category}>
                <span className="analytics-rank">{index + 1}</span>
                <div className="analytics-ranked-icon analytics-ranked-icon--income" aria-hidden="true">
                  <Icon size={17} />
                </div>
                <div className="analytics-ranked-main">
                  <h4>{bucket.label}</h4>
                  <p>{bucket.percentage.toFixed(1)}% of income</p>
                </div>
                <div className="analytics-ranked-side">
                  <strong>{centsToDisplay(bucket.totalCents)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
