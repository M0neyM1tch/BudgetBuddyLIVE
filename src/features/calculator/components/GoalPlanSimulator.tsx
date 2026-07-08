import {
  AlertCircle,
  Banknote,
  CalendarClock,
  Gauge,
  Scissors,
  Target,
  WalletCards,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { centsToDisplay } from '../../../shared/utils/currency';
import { useActiveDebts } from '../../debts/hooks/useDebts';
import { normalizeDebtsForPayoff } from '../../debts/utils/debt-payoff.utils';
import { useGoalPackDashboard } from '../../goalPacks/hooks/useGoalPacks';
import {
  getGoalPackDefinition,
  isGoalType,
} from '../../goalPacks/registry/goalPackRegistry';
import type { GoalCalculatorKey } from '../../goalPacks/types/goalPacks.types';
import {
  buildGoalPlanSimulatorCategories,
  buildGoalPlanSimulatorMetrics,
  buildGoalPlanSimulatorResult,
  categoryCutImpactLabel,
  defaultGoalPlanSimulatorScenario,
  scenarioSummary,
  type GoalPlanSimulatorMetric,
  type GoalPlanSimulatorScenario,
} from '../utils/goal-plan-simulator.utils';
import type { CalculatorPrefillData } from '../types/calculator.types';
import { CalculatorEmptyState } from './CalculatorEmptyState';
import { CalculatorField } from './CalculatorField';
import { CalculatorStatCard } from './CalculatorStatCard';
import { FieldTooltip } from './FieldTooltip';
import { ScenarioSlider } from './ScenarioSlider';

type GoalPlanSimulatorProps = {
  data: CalculatorPrefillData;
};

type ScenarioState = {
  goalId: string;
  scenario: GoalPlanSimulatorScenario;
};

const CALCULATOR_LABELS: Record<GoalCalculatorKey, string> = {
  categoryCutImpact: 'Category cut impact',
  contributionChange: 'Contribution change',
  dateChange: 'Date change',
  debtPayoffComparison: 'Debt payoff comparison',
  surplusAllocation: 'Surplus allocation',
  targetChange: 'Target change',
};

function metricIcon(metric: GoalPlanSimulatorMetric) {
  if (metric.label === 'Scenario date') return <CalendarClock size={19} />;
  if (metric.label === 'Monthly funding') return <Banknote size={19} />;
  if (metric.label === 'Required monthly') return <Gauge size={19} />;
  return <Target size={19} />;
}

function dollars(cents: number) {
  return Math.round(cents / 100);
}

function fromDollars(value: number) {
  return Math.max(0, Math.round(value * 100));
}

function dateLabel(value: string | null) {
  if (!value) return 'Not reachable';

  return new Intl.DateTimeFormat('en-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function monthsLabel(months: number | null) {
  if (months === null) return 'Not reachable';
  if (months === 0) return 'Already there';
  if (months === 1) return '1 month';
  return `${months} months`;
}

function patchScenario(
  scenario: GoalPlanSimulatorScenario,
  updates: Partial<GoalPlanSimulatorScenario>,
) {
  return {
    ...scenario,
    ...updates,
  };
}

export function GoalPlanSimulator({ data }: GoalPlanSimulatorProps) {
  const dashboardQuery = useGoalPackDashboard();
  const goal = dashboardQuery.data?.goal ?? null;
  const priority = dashboardQuery.data?.priority ?? null;
  const goalTypeCandidate = goal?.goal_type ?? priority?.top_priority_type ?? 'custom';
  const goalType = isGoalType(goalTypeCandidate) ? goalTypeCandidate : 'custom';
  const pack = getGoalPackDefinition(goalType);
  const canChangeContribution = pack.calculators.includes('contributionChange');
  const canChangeDate = pack.calculators.includes('dateChange');
  const canChangeTarget = pack.calculators.includes('targetChange');
  const canCutCategory = pack.calculators.includes('categoryCutImpact');
  const canAllocateSurplus = pack.calculators.includes('surplusAllocation');
  const canCompareDebts = pack.calculators.includes('debtPayoffComparison');
  const activeDebtsQuery = useActiveDebts(canCompareDebts);
  const categories = useMemo(
    () => buildGoalPlanSimulatorCategories(data),
    [data],
  );
  const [scenarioState, setScenarioState] = useState<ScenarioState | null>(null);
  const defaultScenario = useMemo(() => {
    if (!goal || !priority) return null;

    return {
      ...defaultGoalPlanSimulatorScenario(goal, priority),
      selectedCategory: categories[0]?.category ?? null,
    };
  }, [categories, goal, priority]);
  const scenario =
    goal && scenarioState?.goalId === goal.id
      ? scenarioState.scenario
      : defaultScenario;

  const activeDebts = useMemo(
    () => normalizeDebtsForPayoff(activeDebtsQuery.data ?? []),
    [activeDebtsQuery.data],
  );
  const result = useMemo(() => {
    if (!goal || !priority || !scenario) return null;

    return buildGoalPlanSimulatorResult({
      activeDebts,
      data,
      goal,
      pack,
      priority,
      scenario,
    });
  }, [activeDebts, data, goal, pack, priority, scenario]);
  const metrics = result ? buildGoalPlanSimulatorMetrics(result, priority?.currency_code ?? 'CAD') : [];
  const selectedCategory = categories.find((category) => category.category === scenario?.selectedCategory);

  function updateScenario(updates: Partial<GoalPlanSimulatorScenario>) {
    if (!goal || !scenario) return;

    setScenarioState({
      goalId: goal.id,
      scenario: patchScenario(scenario, updates),
    });
  }

  if (dashboardQuery.isLoading) {
    return (
      <CalculatorEmptyState
        title="Loading active goal plan"
        description="BudgetBuddy is checking the active Goal Pack before opening scenario tools."
      />
    );
  }

  if (dashboardQuery.isError) {
    return (
      <CalculatorEmptyState
        title="Goal Plan simulator could not load"
        description="Refresh the active Goal Pack data before using scenario tools."
        action={
          <button className="calculator-inline-action" type="button" onClick={() => void dashboardQuery.refetch()}>
            Retry
          </button>
        }
      />
    );
  }

  if (!goal || !priority || !scenario || !result) {
    return (
      <CalculatorEmptyState
        title="Choose an active priority first"
        description="The Goal Plan simulator adapts to your active Goal Pack once onboarding creates a plan."
        requirements={[
          'Complete onboarding or choose an active priority from the dashboard.',
          'Create a goal with a target amount so BudgetBuddy has something to simulate.',
          'Recent expense transactions are only required for category-shift scenarios.',
        ]}
        action={
          <Link className="calculator-inline-action" to="/dashboard">
            Go to Dashboard
          </Link>
        }
      />
    );
  }

  return (
    <div className="calculator-tool goal-plan-simulator">
      <div className="calculator-tool-copy goal-plan-simulator-copy">
        <div>
          <p className="section-kicker">{pack.label}</p>
          <h3>Goal Plan Simulator</h3>
          <p>
            Model local scenarios for {goal.name}. These estimates do not change
            the saved goal, transactions, debts, or next actions.
          </p>
          <p className="calculator-disclosure-note">
            <AlertCircle size={15} aria-hidden="true" />
            These scenarios use user-entered balances, transaction history, and active-plan
            assumptions. They are not financial, tax, mortgage, legal, debt-relief, or
            investment recommendations.
          </p>
        </div>
        <div className="goal-plan-simulator-pack">
          {pack.calculators.map((calculator) => (
            <span key={calculator}>{CALCULATOR_LABELS[calculator]}</span>
          ))}
        </div>
      </div>

      <div className="calculator-tool-grid">
        <div className="calculator-controls-panel">
          {canChangeContribution ? (
            <CalculatorField
              label="Monthly contribution"
              hint={
                <FieldTooltip content="Change the monthly amount to estimate how the projected date moves. This scenario does not update your saved goal." />
              }
              prefix="$"
              step={25}
              value={dollars(scenario.monthlyContributionCents)}
              onChange={(value) => updateScenario({ monthlyContributionCents: fromDollars(value) })}
            />
          ) : null}

          <CalculatorField
            label="One-time boost"
            hint={
              <FieldTooltip content="Model applying a bonus, refund, transfer, or other one-time cash amount to this goal." />
            }
            prefix="$"
            step={50}
            value={dollars(scenario.oneTimeBoostCents)}
            onChange={(value) => updateScenario({ oneTimeBoostCents: fromDollars(value) })}
          />

          {canChangeTarget ? (
            <CalculatorField
              label="Target amount"
              prefix="$"
              step={100}
              value={dollars(scenario.targetAmountCents)}
              onChange={(value) => updateScenario({ targetAmountCents: fromDollars(value) })}
            />
          ) : null}

          {canChangeDate ? (
            <label className="calculator-field">
              <span className="calculator-field-label">
                Target date
                <span className="calculator-field-hint">
                  <FieldTooltip content="Change the target date to compare the monthly amount needed for this scenario." />
                </span>
              </span>
              <div className="calculator-number-input">
                <input
                  type="date"
                  value={scenario.targetDate ?? ''}
                  onInput={(event) =>
                    updateScenario({ targetDate: event.currentTarget.value || null })
                  }
                  onChange={(event) =>
                    updateScenario({ targetDate: event.currentTarget.value || null })
                  }
                />
              </div>
            </label>
          ) : null}

          {canCutCategory ? (
            <>
              <label className="calculator-field">
                <span className="calculator-field-label">
                  Spending category
                  <span className="calculator-field-hint">
                    <FieldTooltip content="Use recent transaction history to estimate how a category shift could change the goal timeline." />
                  </span>
                </span>
                <div className="calculator-number-input">
                  <select
                    value={scenario.selectedCategory ?? ''}
                    onChange={(event) =>
                      updateScenario({ selectedCategory: event.target.value || null })
                    }
                  >
                    {categories.length === 0 ? <option value="">No expense categories</option> : null}
                    {categories.map((category) => (
                      <option key={category.category} value={category.category}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <ScenarioSlider
                label="Category shift"
                min={0}
                max={30}
                step={1}
                value={scenario.categoryCutPct}
                displayValue={`${scenario.categoryCutPct.toFixed(0)}%`}
                onChange={(value) => updateScenario({ categoryCutPct: value })}
              />
              <p className="calculator-scenario-note">
                {categoryCutImpactLabel(
                  selectedCategory,
                  scenario.categoryCutPct,
                  priority.currency_code,
                )}
              </p>
              {categories.length === 0 ? (
                <p className="calculator-scenario-note">
                  Category-shift scenarios need actual expense transactions in the last
                  six full months. Recurring rules will appear here after they generate
                  dated transactions.
                </p>
              ) : null}
            </>
          ) : null}

          {canAllocateSurplus ? (
            <ScenarioSlider
              label="Unallocated surplus"
              hint={
                <FieldTooltip content="Estimate directing part of monthly cash-flow capacity not already used by the goal contribution." />
              }
              min={0}
              max={100}
              step={5}
              value={scenario.surplusAllocationPct}
              displayValue={`${scenario.surplusAllocationPct.toFixed(0)}%`}
              onChange={(value) => updateScenario({ surplusAllocationPct: value })}
            />
          ) : null}
        </div>

        <div className="calculator-results-stack">
          <div className="goal-plan-simulator-summary">
            <span data-status={result.status}>{result.dateMovementLabel}</span>
            <strong>{scenarioSummary(result, priority.currency_code)}</strong>
          </div>

          <div className="calculator-results-grid">
            {metrics.map((metric) => (
              <CalculatorStatCard
                detail={metric.detail}
                icon={metricIcon(metric)}
                key={metric.label}
                label={metric.label}
                tone={metric.tone === 'warn' ? 'warn' : metric.tone === 'good' ? 'good' : 'default'}
                value={metric.value}
              />
            ))}
          </div>

          <div className="goal-plan-simulator-breakdown">
            <article>
              <Scissors size={17} />
              <div>
                <strong>Category scenario</strong>
                <p>{centsToDisplay(result.categoryCutMonthlyCents, priority.currency_code)}/mo added from category shift.</p>
              </div>
            </article>
            <article>
              <WalletCards size={17} />
              <div>
                <strong>Surplus scenario</strong>
                <p>{centsToDisplay(result.surplusAllocatedCents, priority.currency_code)}/mo added from unallocated capacity.</p>
              </div>
            </article>
          </div>

          {canCompareDebts ? (
            <div className="goal-plan-simulator-debts">
              <div className="goal-plan-simulator-section-heading">
                <p className="section-kicker">Debt method scenario</p>
                <h4>Avalanche vs snowball</h4>
              </div>
              {activeDebtsQuery.isLoading ? (
                <p className="calculator-scenario-note">Loading active debts.</p>
              ) : activeDebts.length === 0 ? (
                <p className="calculator-scenario-note">Add active debts to compare payoff methods.</p>
              ) : result.debtComparison ? (
                <>
                  <p className="calculator-scenario-note">
                    Avalanche and snowball are common payoff approaches shown for comparison only,
                    not recommendations to choose a specific method.
                  </p>
                  <div className="calculator-results-grid">
                    <CalculatorStatCard
                      label="Avalanche"
                      value={dateLabel(result.debtComparison.avalanche.debtFreeDate)}
                      detail={`${monthsLabel(result.debtComparison.avalanche.monthsToDebtFree)}, ${centsToDisplay(
                        result.debtComparison.avalanche.totalInterestCents,
                        priority.currency_code,
                      )} estimated interest`}
                      icon={<Gauge size={19} />}
                      tone={
                        result.debtComparison.fasterStrategy === 'avalanche' ||
                        result.debtComparison.avalanche.totalInterestCents <= result.debtComparison.snowball.totalInterestCents
                          ? 'good'
                          : 'default'
                      }
                    />
                    <CalculatorStatCard
                      label="Snowball"
                      value={dateLabel(result.debtComparison.snowball.debtFreeDate)}
                      detail={`${monthsLabel(result.debtComparison.snowball.monthsToDebtFree)}, ${centsToDisplay(
                        result.debtComparison.snowball.totalInterestCents,
                        priority.currency_code,
                      )} estimated interest`}
                      icon={<Target size={19} />}
                      tone={result.debtComparison.fasterStrategy === 'snowball' ? 'good' : 'default'}
                    />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
