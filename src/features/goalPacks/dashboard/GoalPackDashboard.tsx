import { AlertCircle, ArrowRight, CheckCircle2, RefreshCw, Target } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button';
import { ProjectedResultDisclosure } from '../../../shared/components/ui/ProjectedResultDisclosure';
import { centsToDisplay } from '../../../shared/utils/currency';
import {
  useGoalPackDashboard,
  useRecalculateActiveGoalPlan,
} from '../hooks/useGoalPacks';
import { buildGoalPackDashboardModel } from './goalPackDashboardModel';
import './GoalPackDashboard.css';

function toneIcon(tone: 'good' | 'watch' | 'risk' | 'neutral') {
  if (tone === 'good') return <CheckCircle2 size={16} />;
  if (tone === 'risk') return <AlertCircle size={16} />;
  if (tone === 'watch') return <RefreshCw size={16} />;
  return <Target size={16} />;
}

function LoadingGoalPackDashboard() {
  return (
    <section className="goal-pack-dashboard goal-pack-dashboard--loading" aria-label="Goal Pack dashboard loading">
      <div className="goal-pack-dashboard-hero">
        <span />
        <span />
        <span />
      </div>
      <div className="goal-pack-dashboard-metrics">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    </section>
  );
}

function EmptyGoalPackDashboard() {
  return (
    <section className="goal-pack-dashboard" aria-labelledby="goal-pack-dashboard-title">
      <div className="goal-pack-dashboard-empty">
        <p className="section-kicker">Active priority</p>
        <h3 id="goal-pack-dashboard-title">Choose the first plan to focus on</h3>
        <p>
          Pick a top priority in onboarding so BudgBeacon can turn goals, cash flow, and next
          actions into one dashboard.
        </p>
        <Link className="btn btn--secondary btn--md" to="/dashboard/preferences">
          <span>Open preferences</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

type ErrorGoalPackDashboardProps = {
  isRetrying: boolean;
  onRetry: () => void;
};

function ErrorGoalPackDashboard({ isRetrying, onRetry }: ErrorGoalPackDashboardProps) {
  return (
    <section className="goal-pack-dashboard" aria-labelledby="goal-pack-dashboard-error-title">
      <div className="goal-pack-dashboard-error" role="alert">
        <AlertCircle size={20} aria-hidden="true" />
        <div>
          <p className="section-kicker">Active priority</p>
          <h3 id="goal-pack-dashboard-error-title">Goal Pack data could not load</h3>
          <p>
            BudgBeacon could not reach the plan data for this dashboard. Retry the request before
            testing the active priority flow.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            isLoading={isRetrying}
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      </div>
    </section>
  );
}

export function GoalPackDashboard() {
  const dashboardQuery = useGoalPackDashboard();
  const recalculateMutation = useRecalculateActiveGoalPlan();

  if (dashboardQuery.isLoading) return <LoadingGoalPackDashboard />;
  if (dashboardQuery.isError) {
    return (
      <ErrorGoalPackDashboard
        isRetrying={dashboardQuery.isFetching}
        onRetry={() => {
          void dashboardQuery.refetch();
        }}
      />
    );
  }

  const model = buildGoalPackDashboardModel(
    dashboardQuery.data ?? {
      actions: [],
      goal: null,
      priority: null,
      snapshot: null,
    },
  );

  if (!model) return <EmptyGoalPackDashboard />;

  return (
    <section className="goal-pack-dashboard" aria-labelledby="goal-pack-dashboard-title">
      <div className="goal-pack-dashboard-hero">
        <div className="goal-pack-dashboard-copy">
          <p className="section-kicker">Active priority</p>
          <h3 id="goal-pack-dashboard-title">{model.goalName}</h3>
          <p>{model.packDescription}</p>
          <div className="goal-pack-dashboard-meta" aria-label="Goal Pack status">
            <span>{model.packLabel}</span>
            <span>{model.lastCalculatedLabel}</span>
          </div>
        </div>
      </div>

      <div className="goal-pack-dashboard-progress">
        <div>
          <span>{centsToDisplay(model.currentAmountCents)}</span>
          <span>{centsToDisplay(model.targetAmountCents)}</span>
        </div>
        <div
          className="goal-pack-dashboard-progress-bar"
          style={{ '--goal-pack-progress': `${model.progressPercent}%` } as CSSProperties}
          aria-label={`${Math.round(model.progressPercent)} percent complete`}
        >
          <span />
        </div>
      </div>

      <div className="goal-pack-dashboard-metrics">
        {model.metrics.map((metric) => (
          <article key={metric.label} className={`goal-pack-dashboard-metric is-${metric.tone}`}>
            <span className="goal-pack-dashboard-metric-label">
              {metric.label}
              {metric.isProjected ? <ProjectedResultDisclosure /> : null}
            </span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="goal-pack-dashboard-grid">
        <article className="goal-pack-dashboard-panel">
          <div className="goal-pack-dashboard-panel-heading">
            <Target size={18} aria-hidden="true" />
            <div>
              <p className="section-kicker">Recommended next move</p>
              <h4>{model.actionTitle}</h4>
            </div>
          </div>
          <p>{model.actionDescription}</p>
          {model.actionHref && model.actionLabel ? (
            <Link className="btn btn--primary btn--sm" to={model.actionHref}>
              <span>{model.actionLabel}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ) : (
            <small>Use this guidance when you are ready to update the plan.</small>
          )}
        </article>

        <details className="goal-pack-dashboard-panel goal-pack-dashboard-panel--details" open>
          <summary className="goal-pack-dashboard-panel-heading">
            <RefreshCw size={18} aria-hidden="true" />
            <div>
              <p className="section-kicker">Plan drivers</p>
              <h4>What shapes your target date</h4>
            </div>
          </summary>
          <div className="goal-pack-dashboard-driver-list">
            {model.drivers.map((driver) => (
              <div key={driver.key} className={`goal-pack-dashboard-driver is-${driver.tone}`}>
                {toneIcon(driver.tone)}
                <span>{driver.label}</span>
                <strong>{driver.value}</strong>
              </div>
            ))}
          </div>
        </details>
      </div>

      <div className="goal-pack-dashboard-footer">
        <div>
          <p className="section-kicker">Plan prompts</p>
          <p>
            {model.recommendations.join(' / ') ||
              'Keep your next action current; these prompts are planning aids, not recommendations.'}
          </p>
          <small>
            Recalculate after changing transactions, debts, goals, or cash-flow assumptions.
          </small>
        </div>
        <Button
          type="button"
          variant="secondary"
          leftIcon={<RefreshCw size={16} />}
          isLoading={recalculateMutation.isPending}
          onClick={() => {
            void recalculateMutation.mutateAsync(undefined).catch(() => undefined);
          }}
        >
          Recalculate estimates
        </Button>
      </div>
      {recalculateMutation.isError ? (
        <p className="goal-pack-dashboard-action-error" role="alert">
          Plan refresh failed. Your current dashboard data is still shown; try again before relying
          on the updated estimate.
        </p>
      ) : null}
    </section>
  );
}
