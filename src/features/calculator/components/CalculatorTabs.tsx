import { clsx } from 'clsx';
import type { CalculatorTabKey } from '../types/calculator.types';

const TABS = [
  { key: 'goal-plan', label: 'Goal Plan' },
  { key: 'freedom-number', label: 'Freedom Number' },
  { key: 'budget-health', label: 'Budget Health' },
  { key: 'compound-growth', label: 'Compound Growth' },
  { key: 'recurring-costs', label: 'Recurring Costs' },
] as const satisfies readonly { key: CalculatorTabKey; label: string }[];

type CalculatorTabsProps = {
  activeTab: CalculatorTabKey;
  includeGoalPlan?: boolean;
  onChange: (tab: CalculatorTabKey) => void;
};

export function CalculatorTabs({
  activeTab,
  includeGoalPlan = false,
  onChange,
}: CalculatorTabsProps) {
  const visibleTabs = includeGoalPlan
    ? TABS
    : TABS.filter((tab) => tab.key !== 'goal-plan');

  return (
    <div className="calculator-tabs" role="tablist" aria-label="Calculator tools">
      {visibleTabs.map((tab) => (
        <button
          aria-selected={activeTab === tab.key}
          className={clsx(activeTab === tab.key && 'is-active')}
          key={tab.key}
          role="tab"
          type="button"
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
