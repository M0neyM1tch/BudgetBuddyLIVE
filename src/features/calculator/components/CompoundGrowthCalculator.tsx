import { AlertCircle, Banknote, LineChart, Plus, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { centsToDisplay } from '../../../shared/utils/currency';
import { calculateCompoundGrowth } from '../utils/compound-growth.utils';
import type { CalculatorPrefillData } from '../types/calculator.types';
import { CalculatorField } from './CalculatorField';
import { CalculatorStatCard } from './CalculatorStatCard';
import { ScenarioSlider } from './ScenarioSlider';
import { WealthProjectionChart } from './WealthProjectionChart';

type CompoundGrowthCalculatorProps = {
  data: CalculatorPrefillData;
};

export function CompoundGrowthCalculator({ data }: CompoundGrowthCalculatorProps) {
  const principalPrefill = useMemo(
    () => data.goals.reduce((sum, goal) => sum + goal.currentAmountCents, 0),
    [data.goals],
  );
  const [principal, setPrincipal] = useState(principalPrefill);
  const [monthlyContribution, setMonthlyContribution] = useState(50_000);
  const [annualRate, setAnnualRate] = useState(7);
  const [years, setYears] = useState(20);
  const result = calculateCompoundGrowth({
    principalCents: principal,
    monthlyContributionCents: monthlyContribution,
    annualRate: annualRate / 100,
    years,
  });

  return (
    <div className="calculator-tool">
      <div className="calculator-tool-copy">
        <h3>Compound Growth</h3>
        <p>
          Model long-term growth from a starting amount, monthly contributions,
          and an editable annual return assumption with annual compounding. This is a
          projection, not a guarantee or investment recommendation.
        </p>
        <p className="calculator-disclosure-note">
          <AlertCircle size={15} aria-hidden="true" />
          Growth assumptions are hypothetical. BudgBeacon does not recommend securities,
          accounts, tax strategies, or contribution amounts.
        </p>
      </div>

      <div className="calculator-tool-grid">
        <div className="calculator-controls-panel">
          <CalculatorField
            label="Starting principal"
            prefix="$"
            step={100}
            value={Math.round(principal / 100)}
            onChange={(value) => setPrincipal(Math.max(0, Math.round(value * 100)))}
          />
          <CalculatorField
            label="Monthly contribution"
            prefix="$"
            step={25}
            value={Math.round(monthlyContribution / 100)}
            onChange={(value) => setMonthlyContribution(Math.max(0, Math.round(value * 100)))}
          />
          <ScenarioSlider
            label="Growth assumption"
            min={0}
            max={12}
            step={0.25}
            value={annualRate}
            displayValue={`${annualRate.toFixed(2)}%`}
            onChange={setAnnualRate}
          />
          <ScenarioSlider
            label="Time horizon"
            min={1}
            max={40}
            step={1}
            value={years}
            displayValue={`${years} years`}
            onChange={setYears}
          />
        </div>

        <div className="calculator-results-stack">
          <div className="calculator-results-grid">
            <CalculatorStatCard
              label="Future value"
              value={centsToDisplay(result.futureValueCents)}
              icon={<TrendingUp size={19} />}
              tone="good"
            />
            <CalculatorStatCard
              label="Total contributions"
              value={centsToDisplay(result.totalContributionsCents)}
              icon={<Banknote size={19} />}
            />
            <CalculatorStatCard
              label="Estimated growth"
              value={centsToDisplay(result.investmentGrowthCents)}
              icon={<LineChart size={19} />}
            />
            <CalculatorStatCard
              label="+$100/month scenario"
              value={centsToDisplay(result.plusHundredFutureValueCents)}
              icon={<Plus size={19} />}
            />
          </div>

          <WealthProjectionChart series={result.series} years={years} />
        </div>
      </div>
    </div>
  );
}
