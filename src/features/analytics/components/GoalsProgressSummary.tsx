import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { centsToDisplay } from '../../../shared/utils/currency';
import { getGoalIconOption } from '../../goals';
import type { AnalyticsGoalSnapshot } from '../types/analytics.types';

type GoalsProgressSummaryProps = {
  goals?: AnalyticsGoalSnapshot[];
  isLoading: boolean;
};

export function GoalsProgressSummary({ goals = [], isLoading }: GoalsProgressSummaryProps) {
  return (
    <section className="analytics-panel" aria-labelledby="analytics-goals-title">
      <div className="analytics-panel-header">
        <div>
          <p className="section-kicker">Goals</p>
          <h3 id="analytics-goals-title">Goals progress</h3>
        </div>
        <Link className="analytics-panel-link" to="/dashboard/goals">
          View Goals <ArrowRight size={16} />
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
      ) : goals.length === 0 ? (
        <p className="analytics-empty-copy">No active goals yet.</p>
      ) : (
        <div className="analytics-progress-list">
          {goals.map((goal) => {
            const { Icon } = getGoalIconOption(goal.icon);
            const style = {
              '--progress-color': goal.color ?? 'var(--color-primary)',
              '--progress-value': `${Math.round(goal.progressPct)}%`,
            } as CSSProperties;

            return (
              <article className="analytics-progress-row" key={goal.id} style={style}>
                <div className="analytics-ranked-icon" aria-hidden="true">
                  <Icon size={17} />
                </div>
                <div className="analytics-progress-main">
                  <div className="analytics-progress-title-row">
                    <h4>{goal.name}</h4>
                    <strong>{Math.round(goal.progressPct)}%</strong>
                  </div>
                  <div className="analytics-progress-track" aria-hidden="true">
                    <span />
                  </div>
                  <p>
                    {centsToDisplay(goal.currentAmountCents)} of{' '}
                    {centsToDisplay(goal.targetAmountCents)}
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
