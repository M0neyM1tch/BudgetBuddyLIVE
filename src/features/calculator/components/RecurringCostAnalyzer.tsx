import { AlertCircle, CalendarClock, Scissors, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { centsToDisplay } from '../../../shared/utils/currency';
import {
  buildRecurringCostRows,
  buildRecurringCostSummary,
} from '../utils/recurring-cost.utils';
import type { CalculatorPrefillData } from '../types/calculator.types';
import { CalculatorEmptyState } from './CalculatorEmptyState';
import { CalculatorStatCard } from './CalculatorStatCard';
import { RecurringCostTable } from './RecurringCostTable';

type RecurringCostAnalyzerProps = {
  data: CalculatorPrefillData;
};

export function RecurringCostAnalyzer({ data }: RecurringCostAnalyzerProps) {
  const rows = useMemo(() => buildRecurringCostRows(data.recurringRules), [data.recurringRules]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const summary = buildRecurringCostSummary(rows, selectedIds);

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (rows.length === 0) {
    return (
      <CalculatorEmptyState
        title="Recurring Cost Analyzer needs active recurring rules"
        description="Recurring Costs is the calculator module that reads active recurring rules directly."
        requirements={[
          'Create at least one active recurring income or expense rule in Transactions.',
          'Paused recurring rules and one-time transactions do not appear in this module.',
          'Use Budget Health or Freedom Number when you want calculations from completed transactions instead.',
        ]}
      />
    );
  }

  return (
    <div className="calculator-tool">
      <div className="calculator-tool-copy">
        <h3>Recurring Costs</h3>
        <p>
          Annualize recurring bills and subscriptions so hidden monthly drag is
          easier to spot. Select rows to model cancellation or reduction.
        </p>
        <p className="calculator-disclosure-note">
          <AlertCircle size={15} aria-hidden="true" />
          Selected rows model possible savings only. BudgBeacon does not cancel services,
          move money, or recommend changing a specific bill or subscription.
        </p>
      </div>

      <div className="calculator-results-grid calculator-results-grid--four">
        <CalculatorStatCard
          label="Monthly recurring"
          value={centsToDisplay(summary.monthlyCents)}
          icon={<WalletCards size={19} />}
        />
        <CalculatorStatCard
          label="Annual recurring"
          value={centsToDisplay(summary.annualCents)}
          icon={<CalendarClock size={19} />}
        />
        <CalculatorStatCard
          label="Selected annual estimate"
          value={centsToDisplay(summary.selectedAnnualCents)}
          icon={<Scissors size={19} />}
          tone={summary.selectedAnnualCents > 0 ? 'good' : 'default'}
        />
        <CalculatorStatCard
          label="Five-year selected estimate"
          value={centsToDisplay(summary.fiveYearSelectedSavingsCents)}
          icon={<Scissors size={19} />}
          tone={summary.fiveYearSelectedSavingsCents > 0 ? 'good' : 'default'}
        />
      </div>

      <RecurringCostTable rows={rows} selectedIds={selectedIds} onToggle={toggleSelected} />
    </div>
  );
}
