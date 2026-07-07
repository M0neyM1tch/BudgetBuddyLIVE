import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { centsToDisplay } from '../../../shared/utils/currency';
import { getGoalIconOption } from '../../goals/constants/goalIcons';
import type { DashboardGoalSnapshot } from '../types/dashboard.types';

type GoalsSnapshotProps = {
  goals?: DashboardGoalSnapshot[];
  isLoading: boolean;
};

export function GoalsSnapshot({ goals = [], isLoading }: GoalsSnapshotProps) {
  return (
    <section className="dashboard-panel" aria-labelledby="dashboard-goals-title">
      <div className="dashboard-panel-header">
        <div>
          <p className="section-kicker">Goals</p>
          <h3 id="dashboard-goals-title">Goals snapshot</h3>
        </div>
        <Link className="dashboard-panel-link" to="/dashboard/goals">
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
      ) : goals.length === 0 ? (
        <div className="dashboard-empty-copy">
          <p>No active goals yet. Create one to track progress here.</p>
          <Link className="btn btn--primary btn--sm" to="/dashboard/goals">
            New Goal
          </Link>
        </div>
      ) : (
        <div className="dashboard-snapshot-list">
          {goals.map((goal) => {
            const { Icon } = getGoalIconOption(goal.icon);
            const progress = Math.round(goal.progressPct);
            const style = {
              '--snapshot-color': goal.color ?? 'var(--color-primary)',
              '--snapshot-progress': `${progress}%`,
            } as CSSProperties;

            return (
              <article className="dashboard-snapshot-row" key={goal.id} style={style}>
                <div className="dashboard-snapshot-icon" aria-hidden="true">
                  <Icon size={18} />
                </div>
                <div className="dashboard-snapshot-main">
                  <div className="dashboard-snapshot-title-row">
                    <h4>{goal.name}</h4>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="dashboard-progress" aria-hidden="true">
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
