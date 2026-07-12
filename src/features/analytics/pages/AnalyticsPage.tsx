import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './AnalyticsPage.css';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { ErrorState } from '../../../shared/components/feedback/ErrorState';
import { env } from '../../../shared/lib/env';
import { OnboardingTooltip } from '../../onboarding';
import { DailySpendingChart } from '../components/DailySpendingChart';
import { DebtProgressSummary } from '../components/DebtProgressSummary';
import { GoalAwareAnalyticsPanel } from '../components/GoalAwareAnalyticsPanel';
import { GoalsProgressSummary } from '../components/GoalsProgressSummary';
import { IncomeExpenseChart } from '../components/IncomeExpenseChart';
import { IncomeSources } from '../components/IncomeSources';
import { NetSummaryStrip } from '../components/NetSummaryStrip';
import { PeriodSelector } from '../components/PeriodSelector';
import { SpendingByCategoryChart } from '../components/SpendingByCategoryChart';
import { TopCategoriesList } from '../components/TopCategoriesList';
import { useAnalytics } from '../hooks/useAnalytics';
import {
  buildPresetRange,
  calculateNetSummary,
} from '../utils/analytics.utils';
import type { AnalyticsTransaction } from '../types/analytics.types';

const EMPTY_TRANSACTIONS: AnalyticsTransaction[] = [];

export function AnalyticsPage() {
  const [range, setRange] = useState(() => buildPresetRange('this_month'));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const {
    transactionsQuery,
    priorTransactionsQuery,
    goalsQuery,
    debtsQuery,
  } = useAnalytics(range);
  const transactions = transactionsQuery.data ?? EMPTY_TRANSACTIONS;
  const priorTransactions = priorTransactionsQuery.data ?? EMPTY_TRANSACTIONS;
  const summary = useMemo(
    () => calculateNetSummary(transactions, priorTransactions),
    [transactions, priorTransactions],
  );
  const hasBlockingError =
    transactionsQuery.isError ||
    priorTransactionsQuery.isError ||
    goalsQuery.isError ||
    debtsQuery.isError;
  const hasNoTransactions = !transactionsQuery.isLoading && transactions.length === 0;

  function retryAll() {
    void transactionsQuery.refetch();
    void priorTransactionsQuery.refetch();
    void goalsQuery.refetch();
    void debtsQuery.refetch();
  }

  return (
    <section className="page page--wide analytics-page" aria-labelledby="analytics-title">
      <div className="analytics-header">
        <div>
          <p className="page-kicker">Insights</p>
          <h2 id="analytics-title" className="page-title">
            Analytics
          </h2>
          <p className="page-description">
            See where your money is going, how your cash flow is trending, and
            whether goals and debts are moving in the right direction.
          </p>
        </div>
        <OnboardingTooltip
          id="analytics-range-hint"
          content="Review Analytics after setup to see how cash flow and spending patterns affect your active goal. Change the date range to compare periods."
        >
          <PeriodSelector value={range} onChange={setRange} />
        </OnboardingTooltip>
      </div>

      {hasBlockingError ? (
        <ErrorState
          title="Analytics could not be loaded"
          message="Refresh the analytics data before making decisions from this view."
          onRetry={retryAll}
        />
      ) : (
        <>
          <NetSummaryStrip
            summary={summary}
            isLoading={transactionsQuery.isLoading || priorTransactionsQuery.isLoading}
          />

          {env.features.goalPacksEnabled ? (
            <GoalAwareAnalyticsPanel
              range={range}
              transactions={transactions}
              priorTransactions={priorTransactions}
              isLoading={transactionsQuery.isLoading || priorTransactionsQuery.isLoading}
              onCategorySelect={setSelectedCategory}
            />
          ) : null}

          {hasNoTransactions ? (
            <EmptyState
              title="Analytics need transactions first"
              description="Add income and expenses to unlock spending patterns, cash-flow trends, and goal progress."
              action={
                <Link className="btn btn--primary" to="/dashboard/transactions?new=1">
                  Add Transaction
                </Link>
              }
            />
          ) : (
            <>
              <div className="analytics-charts-row">
                <IncomeExpenseChart
                  range={range}
                  transactions={transactions}
                  isLoading={transactionsQuery.isLoading}
                />
                <SpendingByCategoryChart
                  transactions={transactions}
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  isLoading={transactionsQuery.isLoading}
                />
              </div>

              <div className="analytics-lists-row">
                <TopCategoriesList
                  transactions={transactions}
                  priorTransactions={priorTransactions}
                  selectedCategory={selectedCategory}
                  onClearCategory={() => setSelectedCategory(null)}
                  isLoading={transactionsQuery.isLoading || priorTransactionsQuery.isLoading}
                />
                <IncomeSources
                  transactions={transactions}
                  isLoading={transactionsQuery.isLoading}
                />
              </div>

              <DailySpendingChart
                range={range}
                transactions={transactions}
                isLoading={transactionsQuery.isLoading}
              />

              <div className="analytics-snapshots-row">
                <GoalsProgressSummary goals={goalsQuery.data} isLoading={goalsQuery.isLoading} />
                <DebtProgressSummary debts={debtsQuery.data} isLoading={debtsQuery.isLoading} />
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
