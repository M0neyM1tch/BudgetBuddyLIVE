import { CreditCard, PiggyBank, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import type { DashboardKpis } from '../types/dashboard.types';
import { KpiCard } from './KpiCard';

type KpiStripProps = {
  data?: DashboardKpis;
  error?: boolean;
  isLoading: boolean;
  onRetry: () => void;
};

export function KpiStrip({ data, error = false, isLoading, onRetry }: KpiStripProps) {
  if (error) {
    return (
      <section className="dashboard-kpi-error" aria-label="Dashboard totals error">
        <div>
          <p className="section-kicker">Dashboard totals</p>
          <h3>Totals could not be loaded</h3>
          <p>Try again before making decisions from this dashboard.</p>
        </div>
        <Button type="button" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </section>
    );
  }

  const kpis = data ?? {
    currentMonth: { incomeCents: 0, expenseCents: 0, netCents: 0 },
    previousMonth: { incomeCents: 0, expenseCents: 0, netCents: 0 },
    totalSavingsCents: 0,
    totalDebtCents: 0,
  };

  return (
    <section className="dashboard-kpi-strip" aria-label="Dashboard totals">
      <KpiCard
        label="Net balance"
        valueCents={kpis.currentMonth.netCents}
        previousValueCents={kpis.previousMonth.netCents}
        icon={<WalletCards size={20} />}
        isLoading={isLoading}
      />
      <KpiCard
        label="Monthly income"
        valueCents={kpis.currentMonth.incomeCents}
        previousValueCents={kpis.previousMonth.incomeCents}
        icon={<TrendingUp size={20} />}
        isLoading={isLoading}
      />
      <KpiCard
        label="Monthly expenses"
        valueCents={kpis.currentMonth.expenseCents}
        previousValueCents={kpis.previousMonth.expenseCents}
        deltaPreference="decrease-good"
        icon={<TrendingDown size={20} />}
        isLoading={isLoading}
      />
      <KpiCard
        label="Total savings"
        valueCents={kpis.totalSavingsCents}
        icon={<PiggyBank size={20} />}
        isLoading={isLoading}
      />
      <KpiCard
        label="Total debt"
        valueCents={kpis.totalDebtCents}
        deltaPreference="decrease-good"
        icon={<CreditCard size={20} />}
        isLoading={isLoading}
      />
    </section>
  );
}
