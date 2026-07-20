import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  ANNUAL_RETURN_OPTIONS,
  calculateFreedomSnapshot,
  formatWholeDollars,
  type ProjectionPoint,
} from '../../../shared/utils/finance';

type CalculatorField = {
  label: string;
  max: number;
  min: number;
  name: 'currentAge' | 'monthlyIncome' | 'currentSavings' | 'monthlyExpenses';
  prefix?: string;
  step: number;
  suffix?: string;
};

const CALCULATOR_FIELDS: CalculatorField[] = [
  { label: 'Current age', max: 70, min: 18, name: 'currentAge', step: 1, suffix: ' yrs' },
  { label: 'Monthly income', max: 30_000, min: 1_000, name: 'monthlyIncome', prefix: '$', step: 250 },
  {
    label: 'Current Savings',
    max: 500_000,
    min: 0,
    name: 'currentSavings',
    prefix: '$',
    step: 1_000,
  },
  { label: 'Monthly expenses', max: 10_000, min: 0, name: 'monthlyExpenses', prefix: '$', step: 50 },
];

type CalculatorState = {
  annualReturnRate: number;
  currentAge: number;
  currentSavings: number;
  monthlyExpenses: number;
  monthlyIncome: number;
};

type CalculatorNumberField = CalculatorField['name'];

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatInputValue(value: number) {
  return String(value);
}

function formatFieldValue(field: CalculatorField, value: number) {
  if (field.prefix === '$') return formatWholeDollars(value);
  return `${value}${field.suffix ?? ''}`;
}

function getSliderStyle(value: number, min: number, max: number): CSSProperties {
  const progress = ((value - min) / (max - min)) * 100;

  return { '--slider-progress': `${clampValue(progress, 0, 100)}%` } as CSSProperties;
}

function WealthProjectionChart({ data }: { data: ProjectionPoint[] }) {
  if (data.length < 2) return null;

  const width = 560;
  const height = 220;
  const pad = { bottom: 34, left: 54, right: 16, top: 14 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const maxValue = Math.max(...data.map((point) => Math.max(point.balance, point.contributions))) * 1.08;
  const scaleX = (index: number) => pad.left + (index / (data.length - 1)) * innerWidth;
  const scaleY = (value: number) => pad.top + innerHeight - (value / maxValue) * innerHeight;
  const pathFor = (key: 'balance' | 'contributions') =>
    data
      .map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command}${scaleX(index).toFixed(1)},${scaleY(point[key]).toFixed(1)}`;
      })
      .join(' ');
  const balancePath = pathFor('balance');
  const contributionsPath = pathFor('contributions');
  const areaPath = `${balancePath} L${scaleX(data.length - 1)},${pad.top + innerHeight} L${pad.left},${pad.top + innerHeight} Z`;
  const ticks = [0, 0.33, 0.66, 1].map((fraction) => ({
    value: fraction * maxValue,
    y: scaleY(fraction * maxValue),
  }));

  return (
    <div className="landing-projection" aria-label="Wealth projection chart">
      <div className="landing-projection__header">
        <h3>Wealth projection chart</h3>
        <span>Balance vs contributions</span>
      </div>
      <svg className="landing-projection__chart" viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <linearGradient id="landingBalanceFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => (
          <g key={tick.y}>
            <line
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              x1={pad.left}
              x2={width - pad.right}
              y1={tick.y}
              y2={tick.y}
            />
            <text fill="rgba(241,245,249,0.45)" fontSize="10" textAnchor="end" x={pad.left - 8} y={tick.y + 4}>
              {tick.value >= 1_000_000
                ? `$${(tick.value / 1_000_000).toFixed(1)}M`
                : `$${(tick.value / 1_000).toFixed(0)}K`}
            </text>
          </g>
        ))}
        <path d={areaPath} fill="url(#landingBalanceFill)" />
        <path d={contributionsPath} fill="none" stroke="rgba(245, 158, 11, 0.72)" strokeDasharray="5 4" strokeWidth="2" />
        <path d={balancePath} fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="3" />
        {data
          .filter((point) => point.year % 5 === 0)
          .map((point, index) => (
            <text
              fill="rgba(241,245,249,0.45)"
              fontSize="10"
              key={point.year}
              textAnchor="middle"
              x={scaleX(data.findIndex((candidate) => candidate.year === point.year))}
              y={height - 10}
            >
              {index === 0 ? `Year ${point.year}` : point.year}
            </text>
          ))}
      </svg>
      <div className="landing-projection__legend">
        <span>
          <i className="landing-projection__dot landing-projection__dot--green" />
          Projected balance
        </span>
        <span>
          <i className="landing-projection__dot landing-projection__dot--amber" />
          Total contributions
        </span>
      </div>
    </div>
  );
}

export function LandingHero() {
  const [calculator, setCalculator] = useState<CalculatorState>({
    annualReturnRate: 0.07,
    currentAge: 30,
    currentSavings: 10_000,
    monthlyIncome: 5_000,
    monthlyExpenses: 2_800,
  });
  const [fieldDrafts, setFieldDrafts] = useState<Record<CalculatorNumberField, string>>({
    currentAge: '30',
    currentSavings: '10000',
    monthlyExpenses: '2800',
    monthlyIncome: '5000',
  });

  const monthlySavings = Math.max(calculator.monthlyIncome - calculator.monthlyExpenses, 0);
  const results = useMemo(
    () =>
      calculateFreedomSnapshot({
        annualReturnRate: calculator.annualReturnRate,
        currentAge: calculator.currentAge,
        currentSavings: calculator.currentSavings,
        monthlyExpenses: calculator.monthlyExpenses,
        monthlyIncome: calculator.monthlyIncome,
        monthlySavings,
      }),
    [calculator, monthlySavings],
  );
  const yearsLabel = results.yearsToFreedom === null ? '60+ years' : `${results.yearsToFreedom} years`;
  const impliedSavingsRate = calculator.monthlyIncome > 0 ? (monthlySavings / calculator.monthlyIncome) * 100 : 0;

  const updateCalculator = (name: CalculatorNumberField | 'annualReturnRate', value: number) => {
    setCalculator((current) => ({ ...current, [name]: value }));
  };

  const updateNumberField = (field: CalculatorField, rawValue: string) => {
    setFieldDrafts((current) => ({ ...current, [field.name]: rawValue }));

    if (rawValue.trim() === '') return;

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) return;

    updateCalculator(field.name, clampValue(parsed, field.min, field.max));
  };

  const normalizeNumberField = (field: CalculatorField) => {
    const parsed = Number(fieldDrafts[field.name]);
    const nextValue = Number.isFinite(parsed)
      ? clampValue(parsed, field.min, field.max)
      : calculator[field.name];

    updateCalculator(field.name, nextValue);
    setFieldDrafts((current) => ({ ...current, [field.name]: formatInputValue(nextValue) }));
  };

  const updateSliderField = (field: CalculatorField, value: number) => {
    updateCalculator(field.name, value);
    setFieldDrafts((current) => ({ ...current, [field.name]: formatInputValue(value) }));
  };

  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-hero__content">
        <img
          className="landing-hero__brand"
          src="/brand/budgbeacon-full-960x540.png"
          alt=""
          aria-hidden="true"
        />
        <div className="landing-hero__copy-block">
          <h1 id="landing-title">
            Turn your top financial priority into a clear plan.{' '}
            <span>Know the next move every month.</span>
          </h1>
          <p className="landing-hero__copy">
            BudgBeacon helps you choose the goal that matters now, estimate the
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

      <aside className="landing-calculator" aria-label="Long-term planning estimate preview">
        <div className="landing-calculator__header">
          <h2>Long-term planning estimate</h2>
          <p>Adjust your income, spending, savings, and growth assumption to preview a long-term scenario.</p>
          <small>
            Educational estimate only. Results are not investment, tax, legal, accounting,
            mortgage, or financial advice.
          </small>
        </div>

        <div className="landing-calculator__inputs">
          {CALCULATOR_FIELDS.map((field) => (
            <label className="landing-slider" key={field.name}>
              <span>
                {field.label}
                <strong>{formatFieldValue(field, calculator[field.name])}</strong>
              </span>
              <input
                aria-label={field.label}
                max={field.max}
                min={field.min}
                onChange={(event) => updateSliderField(field, Number(event.target.value))}
                step={field.step}
                style={getSliderStyle(calculator[field.name], field.min, field.max)}
                type="range"
                value={calculator[field.name]}
              />
              <input
                aria-label={`${field.label} exact amount`}
                className="landing-slider__number"
                inputMode="numeric"
                onBlur={() => normalizeNumberField(field)}
                onChange={(event) => updateNumberField(field, event.target.value)}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    normalizeNumberField(field);
                    event.currentTarget.blur();
                  }
                }}
                pattern="[0-9]*"
                type="text"
                value={fieldDrafts[field.name]}
              />
              {field.name === 'monthlyExpenses' ? (
                <small className="landing-slider__note">
                  Implied monthly savings: {formatWholeDollars(monthlySavings)} ({impliedSavingsRate.toFixed(1)}% of income)
                </small>
              ) : null}
            </label>
          ))}
        </div>

        <div className="landing-return" aria-label="Growth assumption selection">
          <div className="landing-return__header">
            <span>Growth assumption</span>
            <strong>{(calculator.annualReturnRate * 100).toFixed(1)}%</strong>
          </div>
          <div className="landing-return__buttons">
            {ANNUAL_RETURN_OPTIONS.map((option) => (
              <button
                className={calculator.annualReturnRate === option.rate ? 'is-active' : ''}
                key={option.label}
                onClick={() => updateCalculator('annualReturnRate', option.rate)}
                type="button"
              >
                <span>{option.label}</span>
                <strong>{(option.rate * 100).toFixed(0)}%</strong>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
          <input
            aria-label="Custom annual return"
            max="0.15"
            min="0"
            onChange={(event) => updateCalculator('annualReturnRate', Number(event.target.value))}
            step="0.005"
            style={getSliderStyle(calculator.annualReturnRate, 0, 0.15)}
            type="range"
            value={calculator.annualReturnRate}
          />
        </div>

        <div className="landing-calculator__results">
          <div className="landing-result landing-result--primary">
            <span>Estimated timeline</span>
            <strong>{yearsLabel}</strong>
          </div>
          <div className="landing-result">
            <span>Target estimate</span>
            <strong>{formatWholeDollars(results.freedomNumber)}</strong>
          </div>
          <div className="landing-result">
            <span>Monthly savings</span>
            <strong>{formatWholeDollars(monthlySavings)}</strong>
          </div>
          <div className="landing-result">
            <span>Projected balance</span>
            <strong>{formatWholeDollars(results.projectedBalance)}</strong>
          </div>
          <div className="landing-result">
            <span>Estimated growth</span>
            <strong>{formatWholeDollars(results.investmentReturns)}</strong>
          </div>
          <div className="landing-result">
            <span>Total contributions</span>
            <strong>{formatWholeDollars(results.totalContributions)}</strong>
          </div>
          <div className="landing-result">
            <span>Growth multiplier</span>
            <strong>{results.growthMultiplier.toFixed(2)}x</strong>
          </div>
        </div>

        <WealthProjectionChart data={results.projectionData} />

        <div className="landing-calculator__hook">
          <strong>Save this projection inside BudgBeacon.</strong>
          <span>Turn the estimate into tracked transactions, goals, debt payoff, and monthly plan prompts.</span>
        </div>

        <Link className="landing-calculator__cta" to="/signup">
          Start tracking free
        </Link>
      </aside>
    </section>
  );
}
