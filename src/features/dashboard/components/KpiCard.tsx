import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { centsToDisplay } from '../../../shared/utils/currency';

type DeltaPreference = 'increase-good' | 'decrease-good';

type KpiCardProps = {
  label: string;
  valueCents: number;
  icon: ReactNode;
  previousValueCents?: number;
  deltaPreference?: DeltaPreference;
  isLoading?: boolean;
};

function deltaTone(delta: number, preference: DeltaPreference): 'positive' | 'negative' | 'neutral' {
  if (delta === 0) return 'neutral';

  const isGood = preference === 'increase-good' ? delta > 0 : delta < 0;
  return isGood ? 'positive' : 'negative';
}

export function KpiCard({
  label,
  valueCents,
  icon,
  previousValueCents,
  deltaPreference = 'increase-good',
  isLoading = false,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <article className="dashboard-kpi dashboard-kpi--skeleton" aria-label={`${label} loading`}>
        <span />
        <span />
        <span />
      </article>
    );
  }

  const hasDelta = typeof previousValueCents === 'number';
  const delta = hasDelta ? valueCents - previousValueCents : 0;
  const tone = hasDelta ? deltaTone(delta, deltaPreference) : 'neutral';
  const deltaLabel = hasDelta
    ? `${delta > 0 ? '+' : delta < 0 ? '-' : ''}${centsToDisplay(Math.abs(delta))} vs last month`
    : 'No prior month baseline';

  return (
    <article className="dashboard-kpi">
      <div className="dashboard-kpi-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="dashboard-kpi-copy">
        <p>{label}</p>
        <strong>{centsToDisplay(valueCents)}</strong>
      </div>
      <span className={clsx('dashboard-kpi-delta', `dashboard-kpi-delta--${tone}`)}>
        {deltaLabel}
      </span>
    </article>
  );
}
