import { AlertCircle, CalendarCheck, FastForward, PiggyBank, Target } from 'lucide-react';
import { useState } from 'react';
import { centsToDisplay } from '../../../shared/utils/currency';
import { formatDisplay } from '../../../shared/utils/dates';
import type { Transaction } from '../../transactions';
import {
  projectGoalTimeline,
  trailingMonthlyGoalContribution,
} from '../utils/goal-projection.utils';
import type { GoalWithProgress } from '../types/goals.types';

type GoalTimelineProjectorProps = {
  goals: GoalWithProgress[];
  transactions: Transaction[];
  isLoadingTransactions: boolean;
};

function monthsLabel(months: number | null): string {
  if (months === null) return 'Add contribution';
  if (months === 0) return 'Complete';
  return `${months} months`;
}

export function GoalTimelineProjector({
  goals,
  transactions,
  isLoadingTransactions,
}: GoalTimelineProjectorProps) {
  const activeGoals = goals.filter((goal) => !goal.is_archived);
  const [selectedGoalId, setSelectedGoalId] = useState(activeGoals[0]?.id ?? '');
  const [monthlyOverrideCents, setMonthlyOverrideCents] = useState<number | null>(null);
  const [rawContrib, setRawContrib] = useState('');
  const selectedGoal = activeGoals.find((goal) => goal.id === selectedGoalId) ?? activeGoals[0];
  const inferredMonthlyCents = selectedGoal
    ? trailingMonthlyGoalContribution(selectedGoal.id, transactions)
    : 0;
  const monthlyContributionCents = monthlyOverrideCents ?? inferredMonthlyCents;
  const projection = selectedGoal
    ? projectGoalTimeline(selectedGoal, monthlyContributionCents)
    : null;

  if (activeGoals.length === 0) {
    return (
      <section className="goal-planner-panel">
        <h3>Goal Timeline Projector</h3>
        <p className="goal-planner-empty">
          Create a goal first, then this planner can estimate finish dates and
          required monthly contributions.
        </p>
      </section>
    );
  }

  if (!selectedGoal || !projection) return null;

  return (
    <section className="goal-planner-panel" aria-labelledby="goal-planner-title">
      <div className="goal-planner-copy">
        <p className="page-kicker">Planning</p>
        <h3 id="goal-planner-title">Goal Timeline Projector</h3>
        <p>
          Estimate finish dates from current balances and goal-linked contribution
          history. Adjust the monthly contribution to model a new pace.
        </p>
        <p className="goal-planner-disclosure">
          <AlertCircle size={15} aria-hidden="true" />
          Timeline outputs are estimates based on user-entered goals and transaction history.
          They are planning aids, not financial, tax, mortgage, legal, or investment advice.
        </p>
      </div>

      <div className="goal-planner-grid">
        <div className="goal-planner-controls">
          <label className="goal-form-field">
            <span>Goal</span>
            <select
              value={selectedGoal.id}
              onChange={(event) => {
                setSelectedGoalId(event.target.value);
                setMonthlyOverrideCents(null);
                setRawContrib('');
              }}
            >
              {activeGoals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
          </label>
          <label className="goal-form-field">
            <span>Monthly contribution</span>
            <input
              min={0}
              step={25}
              type="number"
              value={
                rawContrib === ''
                  ? String(Math.round(monthlyContributionCents / 100))
                  : rawContrib
              }
              onChange={(event) => {
                const text = event.target.value;
                setRawContrib(text);

                const next = parseFloat(text);
                if (text !== '' && Number.isFinite(next) && next >= 0) {
                  setMonthlyOverrideCents(Math.round(next * 100));
                }
              }}
              onBlur={() => {
                const parsed = parseFloat(rawContrib);

                if (rawContrib === '' || !Number.isFinite(parsed)) {
                  setRawContrib('');
                  return;
                }

                const normalized = Math.max(0, parsed);
                setRawContrib(String(normalized));
                setMonthlyOverrideCents(Math.round(normalized * 100));
              }}
            />
          </label>
          {inferredMonthlyCents === 0 && !isLoadingTransactions ? (
            <p className="goal-planner-note">
              No contribution history found yet. Enter a monthly amount to model this goal.
            </p>
          ) : null}
        </div>

        <div className="goal-planner-results">
          <article>
            <CalendarCheck size={19} aria-hidden="true" />
            <p>Estimated finish</p>
            <strong>
              {projection.estimatedFinishDate
                ? formatDisplay(projection.estimatedFinishDate)
                : 'Contribution needed'}
            </strong>
          </article>
          <article>
            <Target size={19} aria-hidden="true" />
            <p>Months remaining</p>
            <strong>{monthsLabel(projection.monthsRemaining)}</strong>
          </article>
          <article>
            <PiggyBank size={19} aria-hidden="true" />
            <p>Remaining</p>
            <strong>{centsToDisplay(projection.remainingCents)}</strong>
          </article>
          <article>
            <FastForward size={19} aria-hidden="true" />
            <p>If +$100/month</p>
            <strong>
              {projection.timeSavedMonths === null
                ? 'Add contribution'
                : `${projection.timeSavedMonths} months saved`}
            </strong>
          </article>
          {projection.requiredMonthlyCents !== null ? (
            <article>
              <p>Required for target date</p>
              <strong>{centsToDisplay(projection.requiredMonthlyCents)}</strong>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
