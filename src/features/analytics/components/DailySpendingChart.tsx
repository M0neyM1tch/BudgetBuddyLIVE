import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { centsToDisplay, formatCompact } from '../../../shared/utils/currency';
import {
  averageDailySpend,
  buildDailySpendingBuckets,
} from '../utils/analytics.utils';
import type { AnalyticsTransaction, DateRange } from '../types/analytics.types';

type DailySpendingChartProps = {
  range: DateRange;
  transactions: AnalyticsTransaction[];
  isLoading: boolean;
};

export function DailySpendingChart({
  range,
  transactions,
  isLoading,
}: DailySpendingChartProps) {
  const data = useMemo(
    () => buildDailySpendingBuckets(transactions, range),
    [range, transactions],
  );
  const average = averageDailySpend(data);
  const hasSpending = data.some((bucket) => bucket.expensesCents > 0);

  return (
    <section className="analytics-panel analytics-panel--wide" aria-labelledby="daily-spending-title">
      <div className="analytics-panel-header">
        <div>
          <p className="section-kicker">Daily trend</p>
          <h3 id="daily-spending-title">Daily spending</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="analytics-chart-placeholder analytics-skeleton" />
      ) : !hasSpending ? (
        <p className="analytics-empty-copy">No spending data for this period.</p>
      ) : (
        <div className="analytics-chart analytics-chart--line">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="var(--color-divider)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis
                tickFormatter={(value: number) => formatCompact(value)}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip formatter={(value) => centsToDisplay(Number(value))} />
              <ReferenceLine
                y={average}
                stroke="var(--color-primary)"
                strokeDasharray="4 4"
                label="Avg"
              />
              <Line
                dataKey="expensesCents"
                name="Expenses"
                type="monotone"
                stroke="var(--color-expense)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
