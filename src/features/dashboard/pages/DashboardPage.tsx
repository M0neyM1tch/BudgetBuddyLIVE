import './DashboardPage.css';
import { env } from '../../../shared/lib/env';
import { DebtsSnapshot } from '../components/DebtsSnapshot';
import { DashboardGreeting } from '../components/DashboardGreeting';
import { GoalsSnapshot } from '../components/GoalsSnapshot';
import { KpiStrip } from '../components/KpiStrip';
import { RecentTransactions } from '../components/RecentTransactions';
import { useDashboard } from '../hooks/useDashboard';
import { GoalPackDashboard } from '../../goalPacks/dashboard/GoalPackDashboard';
import { OnboardingTooltip } from '../../onboarding';

export function DashboardPage() {
  const {
    kpisQuery,
    goalsQuery,
    debtsQuery,
    recentTransactionsQuery,
  } = useDashboard();

  return (
    <section className="page page--wide dashboard-page" aria-labelledby="dashboard-title">
      <DashboardGreeting />

      {env.features.goalPacksEnabled ? (
        <OnboardingTooltip
          id="dashboard-goal-pack-review"
          content="Start here after setup: review your active priority, progress, monthly gap, and next action."
        >
          <GoalPackDashboard />
        </OnboardingTooltip>
      ) : null}

      <KpiStrip
        data={kpisQuery.data}
        error={kpisQuery.isError}
        isLoading={kpisQuery.isLoading}
        onRetry={() => void kpisQuery.refetch()}
      />

      <div className="dashboard-layout">
        <GoalsSnapshot goals={goalsQuery.data} isLoading={goalsQuery.isLoading} />
        <DebtsSnapshot debts={debtsQuery.data} isLoading={debtsQuery.isLoading} />
        <RecentTransactions
          transactions={recentTransactionsQuery.data}
          isLoading={recentTransactionsQuery.isLoading}
        />
      </div>
    </section>
  );
}
