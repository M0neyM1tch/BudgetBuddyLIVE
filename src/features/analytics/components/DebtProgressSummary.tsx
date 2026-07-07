import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { centsToDisplay } from '../../../shared/utils/currency';
import { getDebtIconOption } from '../../debts';
import type { AnalyticsDebtSnapshot } from '../types/analytics.types';

type DebtProgressSummaryProps = {
  debts?: AnalyticsDebtSnapshot[];
  isLoading: boolean;
};

export function DebtProgressSummary({ debts = [], isLoading }: DebtProgressSummaryProps) {
  return (
    <section className="analytics-panel" aria-labelledby="analytics-debts-title">
      <div className="analytics-panel-header">
        <div>
          <p className="section-kicker">Debts</p>
          <h3 id="analytics-debts-title">Debt payoff progress</h3>
        </div>
        <Link className="analytics-panel-link" to="/dashboard/debts">
          View Debts <ArrowRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="analytics-progress-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="analytics-progress-row analytics-skeleton" key={index}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : debts.length === 0 ? (
        <p className="analytics-empty-copy">No active debts.</p>
      ) : (
        <div className="analytics-progress-list">
          {debts.map((debt) => {
            const { Icon } = getDebtIconOption(debt.icon);
            const style = {
              '--progress-color': debt.color ?? 'var(--color-expense)',
              '--progress-value': `${Math.round(debt.progressPct)}%`,
            } as CSSProperties;

            return (
              <article className="analytics-progress-row" key={debt.id} style={style}>
                <div className="analytics-ranked-icon analytics-ranked-icon--debt" aria-hidden="true">
                  <Icon size={17} />
                </div>
                <div className="analytics-progress-main">
                  <div className="analytics-progress-title-row">
                    <h4>{debt.name}</h4>
                    <strong>{Math.round(debt.progressPct)}%</strong>
                  </div>
                  <div className="analytics-progress-track" aria-hidden="true">
                    <span />
                  </div>
                  <p>
                    {centsToDisplay(debt.paidCents)} paid /{' '}
                    {centsToDisplay(debt.currentBalanceCents)} remaining
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
