import { useState } from 'react';
import { normalizeError } from '../../../shared/api/errors';
import { ErrorState } from '../../../shared/components/feedback/ErrorState';
import { LoadingState } from '../../../shared/components/feedback/LoadingState';
import { env } from '../../../shared/lib/env';
import { OnboardingTooltip } from '../../onboarding';
import { BudgetHealthScorer } from '../components/BudgetHealthScorer';
import { CalculatorTabs } from '../components/CalculatorTabs';
import { CompoundGrowthCalculator } from '../components/CompoundGrowthCalculator';
import { FreedomNumberCalculator } from '../components/FreedomNumberCalculator';
import { GoalPlanSimulator } from '../components/GoalPlanSimulator';
import { RecurringCostAnalyzer } from '../components/RecurringCostAnalyzer';
import { useCalculatorPrefillData } from '../hooks/useCalculator';
import type { CalculatorTabKey } from '../types/calculator.types';
import './CalculatorPage.css';

export function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<CalculatorTabKey>(
    env.features.goalPacksEnabled ? 'goal-plan' : 'compound-growth',
  );
  const prefill = useCalculatorPrefillData();

  if (prefill.isLoading) {
    return <LoadingState label="Loading calculators" />;
  }

  if (prefill.isError) {
    return (
      <ErrorState
        title="Calculators could not load"
        message={normalizeError(prefill.error).message}
        onRetry={prefill.refetch}
      />
    );
  }

  return (
    <section className="page page--wide calculator-page" aria-labelledby="calculator-title">
      <div className="page-header calculator-page-header">
        <div>
          <p className="page-kicker">Planning tools</p>
          <h2 id="calculator-title" className="page-title">
            Calculator
          </h2>
          <p className="page-description">
            Plan with your real BudgetBuddy data, model scenarios locally, and
            keep every assumption visible before making decisions.
          </p>
        </div>
      </div>

      <OnboardingTooltip
        id="calculator-planner-hint"
        content={
          env.features.goalPacksEnabled
            ? 'Switch planners here to model your active goal, freedom, budget health, growth, and recurring costs.'
            : 'Switch planners here to model freedom, budget health, growth, and recurring costs.'
        }
      >
        <CalculatorTabs
          activeTab={activeTab}
          includeGoalPlan={env.features.goalPacksEnabled}
          onChange={setActiveTab}
        />
      </OnboardingTooltip>

      <section className="calculator-panel" aria-live="polite">
        {activeTab === 'goal-plan' && env.features.goalPacksEnabled ? (
          <GoalPlanSimulator data={prefill.data} />
        ) : null}
        {activeTab === 'freedom-number' ? <FreedomNumberCalculator data={prefill.data} /> : null}
        {activeTab === 'budget-health' ? <BudgetHealthScorer data={prefill.data} /> : null}
        {activeTab === 'compound-growth' ? <CompoundGrowthCalculator data={prefill.data} /> : null}
        {activeTab === 'recurring-costs' ? <RecurringCostAnalyzer data={prefill.data} /> : null}
      </section>
    </section>
  );
}
