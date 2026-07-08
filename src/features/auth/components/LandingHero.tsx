import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { formatWholeDollars } from '../../../shared/utils/finance';
import {
  calculateLandingMonthlyNeeded,
  type LandingMonthlyNeededInput,
  type LandingPriorityKind,
} from '../utils/landingMonthlyNeeded';

type CalculatorFieldName = 'currentAmount' | 'plannedMonthly' | 'targetAmount';

type CalculatorField = {
  label: string;
  max: number;
  min: number;
  name: CalculatorFieldName;
  step: number;
};

type PriorityOption = {
  description: string;
  label: string;
  value: LandingPriorityKind;
};

type CalculatorState = Omit<LandingMonthlyNeededInput, 'currentDate'>;

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    description: 'Build a cash buffer with a monthly plan.',
    label: 'Emergency fund',
    value: 'emergency_fund',
  },
  {
    description: 'Turn a balance into a payoff target.',
    label: 'Debt payoff',
    value: 'debt_payoff',
  },
  {
    description: 'Plan a house fund, car, trip, or other target.',
    label: 'Major purchase',
    value: 'major_purchase',
  },
  {
    description: 'Shape a flexible goal around your own priority.',
    label: 'Custom goal',
    value: 'custom',
  },
];

const CALCULATOR_FIELDS: CalculatorField[] = [
  { label: 'Target amount', max: 100_000, min: 500, name: 'targetAmount', step: 500 },
  { label: 'Saved so far', max: 100_000, min: 0, name: 'currentAmount', step: 250 },
  { label: 'Planned monthly', max: 10_000, min: 0, name: 'plannedMonthly', step: 50 },
];

function addMonthsIso(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSliderStyle(value: number, min: number, max: number): CSSProperties {
  const progress = ((value - min) / (max - min)) * 100;

  return { '--slider-progress': `${clampValue(progress, 0, 100)}%` } as CSSProperties;
}

function formatMonths(months: number) {
  if (months === 1) return '1 month';
  return `${months} months`;
}

function gapLabel(
  monthlyGap: number,
  status: ReturnType<typeof calculateLandingMonthlyNeeded>['status'],
) {
  if (status === 'complete') return '$0 needed';
  if (monthlyGap === 0) return 'On target';
  if (monthlyGap > 0) return `${formatWholeDollars(monthlyGap)} gap/mo`;
  return `${formatWholeDollars(Math.abs(monthlyGap))} extra/mo`;
}

function statusLabel(status: ReturnType<typeof calculateLandingMonthlyNeeded>['status']) {
  if (status === 'complete') return 'Priority funded';
  if (status === 'ahead') return 'Ahead of pace';
  if (status === 'on_track') return 'On target';
  return 'Monthly gap';
}

function progressStyle(progressPct: number): CSSProperties {
  return { '--landing-plan-progress': `${progressPct.toFixed(2)}%` } as CSSProperties;
}

export function LandingHero() {
  const [calculator, setCalculator] = useState<CalculatorState>({
    currentAmount: 3_500,
    plannedMonthly: 800,
    priorityKind: 'major_purchase',
    targetAmount: 18_000,
    targetDate: addMonthsIso(18),
  });

  const result = useMemo(
    () => calculateLandingMonthlyNeeded(calculator),
    [calculator],
  );
  const selectedPriority = PRIORITY_OPTIONS.find(
    (option) => option.value === calculator.priorityKind,
  ) ?? PRIORITY_OPTIONS[0];

  const updateAmount = (field: CalculatorField, value: number) => {
    setCalculator((current) => ({
      ...current,
      [field.name]: clampValue(Math.round(value), field.min, field.max),
    }));
  };

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-hero__content">
        <div className="landing-hero__copy-block">
          <p className="landing-eyebrow">Goal Packs planning</p>
          <h1 id="landing-title">
            Turn your top financial priority into a clear plan.
            <span>Know the next move every month.</span>
          </h1>
          <p className="landing-hero__copy">
            BudgetBuddy helps you choose the goal that matters now, estimate the
            monthly amount it needs, and keep progress moving with a dashboard,
            timeline, and next action.
          </p>
          <div className="landing-hero__actions" aria-label="Get started">
            <Link className="landing-button landing-button--primary" to="/signup">
              Start free
            </Link>
            <Link className="landing-button landing-button--secondary" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <aside className="landing-calculator" aria-label="Monthly contribution plan preview">
        <div className="landing-calculator__header">
          <h2>Monthly needed preview</h2>
          <p>
            Pick a priority, target, and date to see the monthly amount needed to
            stay on pace.
          </p>
          <small>
            Educational estimate only. BudgetBuddy provides planning scenarios, not
            financial, investment, tax, mortgage, legal, or debt-relief advice.
          </small>
        </div>

        <div className="landing-priority-picker" aria-label="Priority type">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              aria-pressed={calculator.priorityKind === option.value}
              className={calculator.priorityKind === option.value ? 'is-active' : ''}
              key={option.value}
              onClick={() =>
                setCalculator((current) => ({ ...current, priorityKind: option.value }))
              }
              type="button"
            >
              <span>{option.label}</span>
              <small>{option.description}</small>
            </button>
          ))}
        </div>

        <div className="landing-calculator__inputs">
          {CALCULATOR_FIELDS.map((field) => (
            <label className="landing-slider" key={field.name}>
              <span>
                {field.label}
                <strong>{formatWholeDollars(calculator[field.name])}</strong>
              </span>
              <input
                aria-label={field.label}
                max={field.max}
                min={field.min}
                onChange={(event) => updateAmount(field, Number(event.target.value))}
                step={field.step}
                style={getSliderStyle(calculator[field.name], field.min, field.max)}
                type="range"
                value={calculator[field.name]}
              />
              <input
                aria-label={`${field.label} exact amount`}
                className="landing-slider__number"
                inputMode="numeric"
                min={field.min}
                onChange={(event) => updateAmount(field, Number(event.target.value))}
                step={field.step}
                type="number"
                value={calculator[field.name]}
              />
            </label>
          ))}
          <label className="landing-slider landing-slider--date">
            <span>
              Target date
              <strong>{formatMonths(result.monthsUntilTarget)}</strong>
            </span>
            <input
              aria-label="Target date"
              className="landing-slider__number"
              onChange={(event) =>
                setCalculator((current) => ({ ...current, targetDate: event.target.value }))
              }
              type="date"
              value={calculator.targetDate}
            />
          </label>
        </div>

        <div className="landing-plan-summary" data-status={result.status}>
          <span>{selectedPriority.label}</span>
          <strong>{result.nextAction}</strong>
          <div
            className="landing-plan-progress"
            aria-label={`Progress ${result.progressPct.toFixed(0)} percent`}
            style={progressStyle(result.progressPct)}
          >
            <span />
          </div>
        </div>

        <div className="landing-calculator__results">
          <div className="landing-result landing-result--primary">
            <span>Monthly needed</span>
            <strong>{formatWholeDollars(result.monthlyNeeded)}</strong>
          </div>
          <div className="landing-result">
            <span>{statusLabel(result.status)}</span>
            <strong>{gapLabel(result.monthlyGap, result.status)}</strong>
          </div>
          <div className="landing-result">
            <span>Remaining</span>
            <strong>{formatWholeDollars(result.amountRemaining)}</strong>
          </div>
          <div className="landing-result">
            <span>Time remaining</span>
            <strong>{formatMonths(result.monthsUntilTarget)}</strong>
          </div>
          <div className="landing-result">
            <span>Progress</span>
            <strong>{result.progressPct.toFixed(0)}%</strong>
          </div>
        </div>

        <div className="landing-calculator__hook">
          <strong>Build this plan in BudgetBuddy.</strong>
          <span>
            Save the target, track real progress, and let your dashboard turn the
            monthly gap into a next action.
          </span>
        </div>

        <Link className="landing-calculator__cta" to="/signup">
          Build this plan in BudgetBuddy
        </Link>
      </aside>
    </section>
  );
}
