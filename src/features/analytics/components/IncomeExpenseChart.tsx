import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { centsToDisplay, formatCompact } from '../../../shared/utils/currency';
import { buildIncomeExpenseBuckets } from '../utils/analytics.utils';
import type { AnalyticsTransaction, DateRange } from '../types/analytics.types';

type IncomeExpenseChartProps = {
  range: DateRange;
  transactions: AnalyticsTransaction[];
  isLoading: boolean;
};

export function IncomeExpenseChart({
  range,
  transactions,
  isLoading,
}: IncomeExpenseChartProps) {
  const data = useMemo(
    () => buildIncomeExpenseBuckets(transactions, range),
    [range, transactions],
  );

  return (
    <section className="analytics-panel analytics-panel--large" aria-labelledby="income-expense-title">
      <div className="analytics-panel-header">
        <div>
          <p className="section-kicker">Cash flow</p>
          <h3 id="income-expense-title">Income vs. expenses</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="analytics-chart-placeholder analytics-skeleton" />
      ) : data.length === 0 ? (
        <p className="analytics-empty-copy">No income or expenses in this period.</p>
      ) : (
        <div className="analytics-chart analytics-chart--bar">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="var(--color-divider)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value: number) => formatCompact(value)}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip formatter={(value) => centsToDisplay(Number(value))} />
              <Legend />
              <Bar dataKey="incomeCents" name="Income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expensesCents" name="Expenses" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
