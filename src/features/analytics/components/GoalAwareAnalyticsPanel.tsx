import { AlertCircle, ArrowRight, ChartNoAxesColumnIncreasing, Target } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { useGoalPackDashboard, useGoalPlanSnapshots, type GoalType } from '../../goalPacks';
import {
  buildGoalAwareAnalyticsModel,
  type GoalAwareAnalyticsPlanInput,
} from '../utils/goal-aware-analytics.utils';
import type { AnalyticsTransaction, DateRange } from '../types/analytics.types';

type GoalAwareAnalyticsPanelProps = {
  isLoading: boolean;
  onCategorySelect: (category: string) => void;
  priorTransactions: AnalyticsTransaction[];
  range: DateRange;
  transactions: AnalyticsTransaction[];
};

function fallbackMonthlyCommitment(
  goalMonthlyCommitmentCents: number | null,
  priorityIncomeCents: number | null,
  priorityExpensesCents: number | null,
) {
  if (goalMonthlyCommitmentCents && goalMonthlyCommitmentCents > 0) {
    return goalMonthlyCommitmentCents;
  }

  return Math.max(0, (priorityIncomeCents ?? 0) - (priorityExpensesCents ?? 0));
}

export function GoalAwareAnalyticsPanel({
  isLoading,
  onCategorySelect,
  priorTransactions,
  range,
  transactions,
}: GoalAwareAnalyticsPanelProps) {
  const dashboardQuery = useGoalPackDashboard();
  const goalId = dashboardQuery.data?.goal?.id ?? null;
  const snapshotsQuery = useGoalPlanSnapshots(goalId, 2);
  const dashboardData = dashboardQuery.data;
  const latestSnapshot = snapshotsQuery.data?.[0] ?? dashboardData?.snapshot ?? null;
  const previousSnapshot = snapshotsQuery.data?.[1] ?? null;
  const activeGoal = dashboardData?.goal ?? null;
  const activePriority = dashboardData?.priority ?? null;
  const panelLoading = isLoading || dashboardQuery.isLoading || snapshotsQuery.isLoading;
  const panelError = dashboardQuery.isError || snapshotsQuery.isError;
  const model = useMemo(() => {
    if (!activeGoal || !activePriority) return null;

    const plan: GoalAwareAnalyticsPlanInput = {
      amountRemainingCents: Math.max(
        0,
        activeGoal.target_amount_cents - activeGoal.current_amount_cents,
      ),
      confidenceScore: activeGoal.confidence_score ?? latestSnapshot?.confidence_score ?? null,
      currencyCode: activePriority.currency_code,
      currentAmountCents: activeGoal.current_amount_cents,
      goalName: activeGoal.name,
      goalType: (activeGoal.goal_type ?? activePriority.top_priority_type ?? 'custom') as GoalType,
      monthlyCommitmentCents: fallbackMonthlyCommitment(
        activeGoal.monthly_commitment_cents,
        activePriority.monthly_income_cents,
        activePriority.monthly_expenses_cents,
      ),
      projectedCompletionDate: latestSnapshot?.projected_completion_date ?? null,
      requiredMonthlyCents: latestSnapshot?.required_monthly_cents ?? null,
      targetAmountCents: activeGoal.target_amount_cents,
    };

    return buildGoalAwareAnalyticsModel({
      latestSnapshot,
      plan,
      priorTransactions,
      previousSnapshot,
      range,
      transactions,
    });
  }, [
    activeGoal,
    activePriority,
    latestSnapshot,
    previousSnapshot,
    priorTransactions,
    range,
    transactions,
  ]);

  function retryGoalAnalytics() {
    void dashboardQuery.refetch();
    if (goalId) void snapshotsQuery.refetch();
  }

  return (
    <section
      className="analytics-panel analytics-panel--wide goal-aware-analytics"
      aria-labelledby="goal-aware-analytics-title"
    >
      <div className="analytics-panel-header">
        <div>
          <p className="section-kicker">Active priority</p>
          <h3 id="goal-aware-analytics-title">Goal impact</h3>
        </div>
        <span className="goal-aware-analytics-status" data-tone={model?.planStatus.tone ?? 'neutral'}>
          {model?.planStatus.label ?? 'Goal-aware'}
        </span>
      </div>

      {panelLoading ? (
        <div className="goal-aware-analytics-loading">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="analytics-ranked-row analytics-skeleton" key={index}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : panelError ? (
        <div className="goal-aware-analytics-empty">
          <Target size={22} />
          <div>
            <strong>Goal impact could not be loaded</strong>
            <p>Refresh this panel before using goal-aware analytics.</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={retryGoalAnalytics}>
            Retry
          </Button>
        </div>
      ) : !model ? (
        <div className="goal-aware-analytics-empty">
          <Target size={22} />
          <div>
            <strong>No active priority yet</strong>
            <p>Choose a top priority to connect analytics to a goal plan.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="goal-aware-analytics-hero">
            <div className="goal-aware-analytics-title-block">
              <div className="analytics-summary-icon" aria-hidden="true">
                <ChartNoAxesColumnIncreasing size={18} />
              </div>
              <div>
                <h4>{model.goalName}</h4>
                <p>{model.planStatus.body}</p>
              </div>
            </div>

            <div className="goal-aware-analytics-metrics" aria-label="Goal-aware analytics metrics">
              {model.metrics.map((metric) => (
                <div className="goal-aware-analytics-metric" data-tone={metric.tone} key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className="goal-aware-analytics-disclosure" aria-label="Goal impact assumptions">
            <AlertCircle size={17} aria-hidden="true" />
            <p>
              <strong>Scenario note:</strong> Goal impact uses user-entered transactions,
              active-goal data, and the selected date range. Spending levers are comparison
              scenarios only, not recommendations to change spending or move money.
            </p>
          </aside>

          <div className="goal-aware-analytics-grid">
            <div>
              <div className="goal-aware-analytics-section-heading">
                <p className="section-kicker">What changed</p>
                <h4>Plan movement</h4>
              </div>
              <div className="goal-aware-analytics-list">
                {model.changeInsights.map((insight) => (
                  <article className="goal-aware-analytics-row" data-tone={insight.tone} key={insight.label}>
                    <strong>{insight.label}</strong>
                    <p>{insight.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="goal-aware-analytics-section-heading">
                <p className="section-kicker">Scenarios</p>
                <h4>Spending levers</h4>
              </div>
              {model.spendingLevers.length === 0 ? (
                <p className="analytics-empty-copy">Add expenses to see category-based scenarios.</p>
              ) : (
                <div className="goal-aware-analytics-list">
                  {model.spendingLevers.map((lever) => (
                    <article className="goal-aware-analytics-row" data-tone={lever.tone} key={lever.category}>
                      <div className="goal-aware-analytics-lever-title">
                        <div>
                          <strong>{lever.label}</strong>
                          <p>
                            {lever.monthlyEstimateLabel}/mo estimate. {lever.impactLabel}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          rightIcon={<ArrowRight size={14} />}
                          onClick={() => onCategorySelect(lever.category)}
                        >
                          Focus
                        </Button>
                      </div>
                      <span>{lever.scenarioAmountLabel} shift</span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
