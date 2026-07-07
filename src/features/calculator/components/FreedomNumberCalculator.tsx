import { AlertCircle, PiggyBank, Target, TrendingUp, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { centsToDisplay } from '../../../shared/utils/currency';
import {
  averageMonthlyExpenses,
  calculateFreedomNumberScenario,
  inferCurrentInvestedFromGoals,
} from '../utils/freedom-number.utils';
import type { CalculatorPrefillData } from '../types/calculator.types';
import { CalculatorEmptyState } from './CalculatorEmptyState';
import { CalculatorField } from './CalculatorField';
import { CalculatorStatCard } from './CalculatorStatCard';
import { FieldTooltip } from './FieldTooltip';
import { ScenarioSlider } from './ScenarioSlider';

type FreedomNumberCalculatorProps = {
  data: CalculatorPrefillData;
};

function yearsLabel(years: number | null): string {
  if (years === null) return 'Not reachable';
  if (years === 0) return 'Already there';
  return `${years} years`;
}

export function FreedomNumberCalculator({ data }: FreedomNumberCalculatorProps) {
  const monthlyExpensePrefill = useMemo(
    () => averageMonthlyExpenses(data.transactions),
    [data.transactions],
  );
  const currentInvestedPrefill = useMemo(
    () => inferCurrentInvestedFromGoals(data.goals),
    [data.goals],
  );
  const [monthlyExpenses, setMonthlyExpenses] = useState(monthlyExpensePrefill);
  const [currentInvested, setCurrentInvested] = useState(currentInvestedPrefill);
  const [monthlyContribution, setMonthlyContribution] = useState(50_000);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [annualReturnRate, setAnnualReturnRate] = useState(7);
  const result = calculateFreedomNumberScenario({
    monthlyExpensesCents: monthlyExpenses,
    currentInvestedCents: currentInvested,
    monthlyInvestContributionCents: monthlyContribution,
    withdrawalRate: withdrawalRate / 100,
    annualReturnRate: annualReturnRate / 100,
  });

  if (monthlyExpensePrefill === 0 && data.transactions.length === 0) {
    return (
      <CalculatorEmptyState
        title="Freedom Number needs spending history"
        description="Add income and expenses in Transactions first. This calculator becomes more useful when it can start with your real monthly spending."
      />
    );
  }

  return (
    <div className="calculator-tool">
      <div className="calculator-tool-copy">
        <h3>Freedom Number</h3>
        <p>
          Estimate the invested balance needed to fund your annual spending from a
          withdrawal-rate assumption. This is a planning estimate, not financial advice.
        </p>
        <p className="calculator-disclosure-note">
          <AlertCircle size={15} aria-hidden="true" />
          Inputs are hypothetical scenarios and do not recommend securities, accounts,
          withdrawal rates, tax strategies, or investment contributions.
        </p>
      </div>

      <div className="calculator-tool-grid">
        <div className="calculator-controls-panel">
          <CalculatorField
            label="Monthly expenses"
            prefix="$"
            step={50}
            value={Math.round(monthlyExpenses / 100)}
            onChange={(value) => setMonthlyExpenses(Math.max(0, Math.round(value * 100)))}
          />
          <CalculatorField
            label="Current invested or saved"
            prefix="$"
            step={100}
            value={Math.round(currentInvested / 100)}
            onChange={(value) => setCurrentInvested(Math.max(0, Math.round(value * 100)))}
          />
          <CalculatorField
            label="Monthly contribution amount"
            prefix="$"
            step={25}
            value={Math.round(monthlyContribution / 100)}
            onChange={(value) => setMonthlyContribution(Math.max(0, Math.round(value * 100)))}
          />
          <ScenarioSlider
            label="Withdrawal-rate assumption"
            hint={
              <FieldTooltip content="A hypothetical annual withdrawal percentage for scenario math. Common planning examples often use 4%, but your situation may require a different assumption." />
            }
            min={2.5}
            max={6}
            step={0.25}
            value={withdrawalRate}
            displayValue={`${withdrawalRate.toFixed(2)}%`}
            onChange={setWithdrawalRate}
          />
          <ScenarioSlider
            label="Growth assumption"
            hint={
              <FieldTooltip content="A hypothetical annual growth assumption for scenario math. This is not an expected return, guarantee, or investment recommendation." />
            }
            min={0}
            max={12}
            step={0.25}
            value={annualReturnRate}
            displayValue={`${annualReturnRate.toFixed(2)}%`}
            onChange={setAnnualReturnRate}
          />
          <button
            className="calculator-inline-action"
            type="button"
            onClick={() => setMonthlyExpenses(Math.max(0, monthlyExpenses - 25_000))}
          >
            What if I cut monthly expenses by $250?
          </button>
        </div>

        <div className="calculator-results-grid">
          <CalculatorStatCard
            label="Freedom target"
            value={centsToDisplay(result.freedomNumberCents)}
            icon={<Target size={19} />}
          />
          <CalculatorStatCard
            label="Annual spending"
            value={centsToDisplay(result.annualExpensesCents)}
            icon={<WalletCards size={19} />}
          />
          <CalculatorStatCard
            label="Annual withdrawal estimate"
            value={centsToDisplay(result.safeAnnualWithdrawalCents)}
            icon={<PiggyBank size={19} />}
          />
          <CalculatorStatCard
            label="Estimated time"
            value={yearsLabel(result.yearsToFreedom)}
            tone={result.yearsToFreedom === null ? 'warn' : 'good'}
            icon={<TrendingUp size={19} />}
            detail={`Reduced-spend scenario: ${yearsLabel(result.reducedSpendYearsToFreedom)}`}
          />
        </div>
      </div>
    </div>
  );
}
