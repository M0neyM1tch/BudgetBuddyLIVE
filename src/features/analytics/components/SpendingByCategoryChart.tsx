import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { FEATURE_COLORS } from '../../../shared/constants/featurePalette';
import { centsToDisplay } from '../../../shared/utils/currency';
import {
  buildCategoryBuckets,
  topCategoryBuckets,
} from '../utils/analytics.utils';
import type { AnalyticsTransaction } from '../types/analytics.types';

type SpendingByCategoryChartProps = {
  transactions: AnalyticsTransaction[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  isLoading: boolean;
};

function categoryFromPiePayload(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const category = (payload as { category?: unknown }).category;
  return typeof category === 'string' ? category : null;
}

export function SpendingByCategoryChart({
  transactions,
  selectedCategory,
  onCategorySelect,
  isLoading,
}: SpendingByCategoryChartProps) {
  const data = useMemo(
    () => topCategoryBuckets(buildCategoryBuckets(transactions, 'expense'), 8),
    [transactions],
  );

  return (
    <section className="analytics-panel" aria-labelledby="spending-category-title">
      <div className="analytics-panel-header">
        <div>
          <p className="section-kicker">Categories</p>
          <h3 id="spending-category-title">Spending by category</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="analytics-chart-placeholder analytics-skeleton" />
      ) : data.length === 0 ? (
        <p className="analytics-empty-copy">No expenses in this period.</p>
      ) : (
        <div className="analytics-donut-layout">
          <div className="analytics-chart analytics-chart--donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="totalCents"
                  nameKey="label"
                  innerRadius="58%"
                  outerRadius="86%"
                  paddingAngle={2}
                  onClick={(payload) => {
                    const category = categoryFromPiePayload(payload);
                    if (category) onCategorySelect(category);
                  }}
                >
                  {data.map((bucket, index) => (
                    <Cell
                      key={bucket.category}
                      fill={FEATURE_COLORS[index % FEATURE_COLORS.length]}
                      opacity={selectedCategory && selectedCategory !== bucket.category ? 0.38 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => centsToDisplay(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="analytics-category-legend">
            {data.map((bucket, index) => (
              <button
                className={selectedCategory === bucket.category ? 'is-active' : ''}
                key={bucket.category}
                type="button"
                onClick={() => onCategorySelect(bucket.category)}
              >
                <span style={{ background: FEATURE_COLORS[index % FEATURE_COLORS.length] }} />
                {bucket.label}
                <strong>{bucket.percentage.toFixed(0)}%</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
