import { clsx } from 'clsx';
import { ArrowDownLeft, ArrowUpRight, WalletCards } from 'lucide-react';
import { centsToDisplay } from '../../../shared/utils/currency';
import { periodDelta } from '../utils/analytics.utils';
import type { NetSummary } from '../types/analytics.types';

type NetSummaryStripProps = {
  summary: NetSummary;
  isLoading: boolean;
};

type SummaryCardProps = {
  label: string;
  valueCents: number;
  priorCents: number;
  positiveIsGood: boolean;
  icon: React.ReactNode;
};

function formatDelta(current: number, prior: number): string {
  const delta = periodDelta(current, prior);
  if (delta === null) return 'New this period';
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}% vs prior`;
}

function deltaTone(current: number, prior: number, positiveIsGood: boolean) {
  const delta = current - prior;
  if (delta === 0) return 'neutral';
  const good = positiveIsGood ? delta > 0 : delta < 0;
  return good ? 'positive' : 'negative';
}

function SummaryCard({
  label,
  valueCents,
  priorCents,
  positiveIsGood,
  icon,
}: SummaryCardProps) {
  const tone = deltaTone(valueCents, priorCents, positiveIsGood);

  return (
    <article className="analytics-summary-card">
      <div className="analytics-summary-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p>{label}</p>
        <strong>{centsToDisplay(valueCents)}</strong>
      </div>
      <span className={clsx('analytics-delta', `analytics-delta--${tone}`)}>
        {formatDelta(valueCents, priorCents)}
      </span>
    </article>
  );
}

export function NetSummaryStrip({ summary, isLoading }: NetSummaryStripProps) {
  if (isLoading) {
    return (
      <section className="analytics-summary-strip" aria-label="Analytics summary loading">
        {Array.from({ length: 3 }).map((_, index) => (
          <article className="analytics-summary-card analytics-skeleton" key={index}>
            <span />
            <span />
            <span />
          </article>
        ))}
      </section>
    );
  }

  return (
    <section className="analytics-summary-strip" aria-label="Analytics summary">
      <SummaryCard
        label="Total income"
        valueCents={summary.incomeCents}
        priorCents={summary.priorIncomeCents}
        positiveIsGood
        icon={<ArrowDownLeft size={20} />}
      />
      <SummaryCard
        label="Total expenses"
        valueCents={summary.expensesCents}
        priorCents={summary.priorExpensesCents}
        positiveIsGood={false}
        icon={<ArrowUpRight size={20} />}
      />
      <SummaryCard
        label="Net balance"
        valueCents={summary.netCents}
        priorCents={summary.priorNetCents}
        positiveIsGood
        icon={<WalletCards size={20} />}
      />
    </section>
  );
}
