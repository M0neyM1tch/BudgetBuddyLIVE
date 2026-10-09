import { Activity, Banknote, Gauge, Scale } from 'lucide-react';
import { useMemo, useState } from 'react';
import { normalizeError } from '../../../shared/api/errors';
import { ErrorState } from '../../../shared/components/feedback/ErrorState';
import { LoadingState } from '../../../shared/components/feedback/LoadingState';
import { centsToDisplay } from '../../../shared/utils/currency';
import { useCalculatorTransactions } from '../hooks/useCalculator';
import { lastFullMonthRange, monthRange } from '../utils/calculator.utils';
import {
  budgetHealthGrade,
  budgetRecommendation,
  buildBudgetHealthBreakdown,
  DEFAULT_BUDGET_TARGETS,
} from '../utils/budget-health.utils';
import { CalculatorEmptyState } from './CalculatorEmptyState';
import { CalculatorField } from './CalculatorField';
import { CalculatorStatCard } from './CalculatorStatCard';
import { FieldTooltip } from './FieldTooltip';

export function BudgetHealthScorer() {
  const defaultRange = useMemo(() => lastFullMonthRange(), []);
  const [month, setMonth] = useState(defaultRange.from.slice(0, 7));
  const [needsTarget, setNeedsTarget] = useState(DEFAULT_BUDGET_TARGETS.needsPct);
  const [wantsTarget, setWantsTarget] = useState(DEFAULT_BUDGET_TARGETS.wantsPct);
  const [savingsTarget, setSavingsTarget] = useState(DEFAULT_BUDGET_TARGETS.savingsPct);
  const transactionsQuery = useCalculatorTransactions(monthRange(month) ?? defaultRange);
  const targets = {
    needsPct: needsTarget,
    wantsPct: wantsTarget,
    savingsPct: savingsTarget,
  };
  const breakdown = buildBudgetHealthBreakdown(transactionsQuery.data ?? [], targets);
  const grade = budgetHealthGrade(breakdown.score);
  const totalTarget = needsTarget + wantsTarget + savingsTarget;

  return (
    <div className="calculator-tool">
      <div className="calculator-tool-copy">
        <h3>Budget Health</h3>
        <p>
          Compare recent spending against a target budget split. Savings includes
          explicit savings, investments, and debt payments.
        </p>
      </div>

      <div className="calculator-tool-grid">
        <div className="calculator-controls-panel">
          <label className="calculator-field">
            <span>Month</span>
            <div className="calculator-number-input">
              <input
                type="month"
                value={month}
                onChange={(event) => {
                  if (monthRange(event.target.value)) setMonth(event.target.value);
                }}
              />
            </div>
          </label>
          <CalculatorField
            label="Needs target"
            hint={
              <FieldTooltip content="Essential spending: rent/mortgage, utilities, groceries, insurance, transport. The 50/30/20 rule suggests keeping this at or below 50% of take-home income." />
            }
            suffix="%"
            value={needsTarget}
            onChange={setNeedsTarget}
          />
          <CalculatorField
            label="Wants target"
            hint={
              <FieldTooltip content="Discretionary spending: dining out, subscriptions, hobbies, entertainment. The 50/30/20 rule suggests keeping this at or below 30% of take-home income." />
            }
            suffix="%"
            value={wantsTarget}
            onChange={setWantsTarget}
          />
          <CalculatorField
            label="Savings target"
            hint={
              <FieldTooltip content="Recorded savings, investments, and debt payments count here. BudgBeacon does not separate minimum from extra debt payments in this split. The 50/30/20 rule targets at least 20%." />
            }
            suffix="%"
            value={savingsTarget}
            onChange={setSavingsTarget}
          />
          {totalTarget !== 100 ? (
            <p className="calculator-warning">Targets currently total {totalTarget}%.</p>
          ) : null}
        </div>

        {transactionsQuery.isLoading ? (
          <LoadingState label="Loading selected month" />
        ) : transactionsQuery.isError ? (
          <ErrorState
            title="Budget Health could not load this month"
            message={normalizeError(transactionsQuery.error).message}
            onRetry={() => { void transactionsQuery.refetch(); }}
          />
        ) : breakdown.incomeCents <= 0 ? (
          <CalculatorEmptyState
            title="Budget Health needs income for the selected month"
            description="Budget Health calculates from dated transaction history for the month you select."
            requirements={[
              'Choose another month or add at least one income transaction dated in the selected month.',
              'Add expense transactions in that same month so BudgBeacon can split needs, wants, and savings.',
              'Recurring rules only count here after they create dated transactions.',
            ]}
          />
        ) : (
          <div className="calculator-results-stack">
            <div className="budget-meter" aria-label="Budget health allocation">
              <span style={{ width: `${Math.min(100, breakdown.needsPct)}%` }} />
              <span style={{ width: `${Math.min(100, breakdown.wantsPct)}%` }} />
              <span style={{ width: `${Math.min(100, breakdown.savingsPct)}%` }} />
            </div>
            <div className="calculator-results-grid">
              <CalculatorStatCard
                label="Score"
                value={`${breakdown.score}/100`}
                detail={`Grade ${grade}`}
                icon={<Gauge size={19} />}
                tone={breakdown.score >= 75 ? 'good' : 'warn'}
              />
              <CalculatorStatCard
                label="Income"
                value={centsToDisplay(breakdown.incomeCents)}
                icon={<Banknote size={19} />}
              />
              <CalculatorStatCard
                label="Needs / Wants / Savings"
                value={`${breakdown.needsPct.toFixed(0)} / ${breakdown.wantsPct.toFixed(0)} / ${breakdown.savingsPct.toFixed(0)}%`}
                icon={<Scale size={19} />}
              />
              <CalculatorStatCard
                label="Planning note"
                value={budgetRecommendation(breakdown, targets)}
                icon={<Activity size={19} />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
