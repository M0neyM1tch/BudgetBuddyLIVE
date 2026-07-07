import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { centsToDisplay } from '../../../shared/utils/currency';
import { formatDisplay } from '../../../shared/utils/dates';
import { getDebtIconOption } from '../../debts/constants/debtIcons';
import type { DashboardDebtSnapshot } from '../types/dashboard.types';

type DebtsSnapshotProps = {
  debts?: DashboardDebtSnapshot[];
  isLoading: boolean;
};

function interestRateLabel(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2).replace(/\.00$/, '')}% APR`;
}

export function DebtsSnapshot({ debts = [], isLoading }: DebtsSnapshotProps) {
  return (
    <section className="dashboard-panel" aria-labelledby="dashboard-debts-title">
      <div className="dashboard-panel-header">
        <div>
          <p className="section-kicker">Debts</p>
          <h3 id="dashboard-debts-title">Priority debts</h3>
        </div>
        <Link className="dashboard-panel-link" to="/dashboard/debts">
          View all <ArrowRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="dashboard-snapshot-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="dashboard-snapshot-row dashboard-snapshot-row--skeleton" key={index}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : debts.length === 0 ? (
        <div className="dashboard-empty-copy">
          <p>No active debts. New debt payoff plans will appear here.</p>
          <Link className="btn btn--primary btn--sm" to="/dashboard/debts">
            Add Debt
          </Link>
        </div>
      ) : (
        <div className="dashboard-snapshot-list">
          {debts.map((debt) => {
            const { Icon } = getDebtIconOption(debt.icon);
            const style = {
              '--snapshot-color': debt.color ?? 'var(--color-expense)',
            } as CSSProperties;

            return (
              <article className="dashboard-snapshot-row" key={debt.id} style={style}>
                <div className="dashboard-snapshot-icon" aria-hidden="true">
                  <Icon size={18} />
                </div>
                <div className="dashboard-snapshot-main">
                  <div className="dashboard-snapshot-title-row">
                    <h4>{debt.name}</h4>
                    <strong>{centsToDisplay(debt.currentBalanceCents)}</strong>
                  </div>
                  <dl className="dashboard-mini-metrics">
                    <div>
                      <dt>Rate</dt>
                      <dd>{interestRateLabel(debt.interestRateBasisPoints)}</dd>
                    </div>
                    <div>
                      <dt>Min payment</dt>
                      <dd>{centsToDisplay(debt.minimumPaymentCents)}</dd>
                    </div>
                    <div>
                      <dt>Next due</dt>
                      <dd>{debt.nextPaymentDate ? formatDisplay(debt.nextPaymentDate) : '-'}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
