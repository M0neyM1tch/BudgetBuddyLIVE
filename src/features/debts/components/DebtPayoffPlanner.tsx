import { AlertCircle, CalendarCheck, Landmark, Scale, TrendingDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { centsToDisplay } from '../../../shared/utils/currency';
import { formatDisplay } from '../../../shared/utils/dates';
import {
  calculatePayoffPlan,
  normalizeDebtsForPayoff,
  type PayoffStrategy,
} from '../utils/debt-payoff.utils';
import type { DebtWithProgress } from '../types/debts.types';

type DebtPayoffPlannerProps = {
  debts: DebtWithProgress[];
};

function strategyLabel(strategy: PayoffStrategy): string {
  return strategy === 'avalanche' ? 'Avalanche' : 'Snowball';
}

function monthsLabel(months: number | null): string {
  if (months === null) return 'Needs more payment';
  return `${months} months`;
}

export function DebtPayoffPlanner({ debts }: DebtPayoffPlannerProps) {
  const payoffDebts = useMemo(() => normalizeDebtsForPayoff(debts), [debts]);
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche');
  const [extraPayment, setExtraPayment] = useState(10_000);
  const [rawExtra, setRawExtra] = useState(String(Math.round(extraPayment / 100)));
  const selectedPlan = calculatePayoffPlan(payoffDebts, strategy, extraPayment);
  const alternateStrategy: PayoffStrategy = strategy === 'avalanche' ? 'snowball' : 'avalanche';
  const alternatePlan = calculatePayoffPlan(payoffDebts, alternateStrategy, extraPayment);
  const interestSavings = Math.max(
    0,
    alternatePlan.totalInterestCents - selectedPlan.totalInterestCents,
  );

  if (payoffDebts.length === 0) {
    return (
      <section className="debt-planner-panel">
        <h3>Debt Payoff Planner</h3>
        <p className="debt-planner-empty">
          Add an active debt with a balance and minimum payment to compare payoff strategies.
        </p>
      </section>
    );
  }

  return (
    <section className="debt-planner-panel" aria-labelledby="debt-planner-title">
      <div className="debt-planner-copy">
        <p className="page-kicker">Planning</p>
        <h3 id="debt-planner-title">Debt Payoff Planner</h3>
        <p>
          Compare avalanche and snowball as common payoff approaches using your active debt
          balances, APRs, minimum payments, and an editable extra-payment scenario.
        </p>
        <p className="debt-planner-disclosure">
          <AlertCircle size={15} aria-hidden="true" />
          This comparison is an estimate, not a recommendation to choose a payoff method,
          refinance, consolidate debt, or change a credit product.
        </p>
      </div>

      <div className="debt-planner-controls">
        <div className="debt-strategy-toggle" role="group" aria-label="Payoff strategy">
          {(['avalanche', 'snowball'] as PayoffStrategy[]).map((option) => (
            <button
              className={strategy === option ? 'is-active' : ''}
              key={option}
              type="button"
              onClick={() => setStrategy(option)}
            >
              {strategyLabel(option)}
            </button>
          ))}
        </div>
        <label className="debt-planner-field">
          <span>Extra monthly payment</span>
          <input
            min={0}
            step={25}
            type="number"
            value={rawExtra}
            onChange={(event) => {
              const text = event.target.value;
              setRawExtra(text);

              const next = parseFloat(text);
              if (text !== '' && Number.isFinite(next) && next >= 0) {
                setExtraPayment(Math.round(next * 100));
              }
            }}
            onBlur={() => {
              const parsed = parseFloat(rawExtra);

              if (rawExtra === '' || !Number.isFinite(parsed)) {
                setRawExtra(String(Math.round(extraPayment / 100)));
                return;
              }

              const normalized = Math.max(0, parsed);
              setRawExtra(String(normalized));
              setExtraPayment(Math.round(normalized * 100));
            }}
          />
        </label>
      </div>

      <div className="debt-planner-results">
        <article>
          <CalendarCheck size={19} aria-hidden="true" />
          <p>Debt-free date</p>
          <strong>
            {selectedPlan.debtFreeDate ? formatDisplay(selectedPlan.debtFreeDate) : 'Not projected'}
          </strong>
          <small>{monthsLabel(selectedPlan.monthsToDebtFree)}</small>
        </article>
        <article>
          <Landmark size={19} aria-hidden="true" />
          <p>Total interest</p>
          <strong>{centsToDisplay(selectedPlan.totalInterestCents)}</strong>
          <small>{centsToDisplay(interestSavings)} vs alternate</small>
        </article>
        <article>
          <TrendingDown size={19} aria-hidden="true" />
          <p>Total paid</p>
          <strong>{centsToDisplay(selectedPlan.totalPaidCents)}</strong>
          <small>{strategyLabel(strategy)} selected</small>
        </article>
        <article>
          <Scale size={19} aria-hidden="true" />
          <p>Strategy order</p>
          <strong>{selectedPlan.orderedDebts.map((debt) => debt.name).join(' -> ')}</strong>
          <small>Avalanche minimizes interest; Snowball prioritizes quick wins.</small>
        </article>
      </div>

      <div className="debt-planner-table-wrap">
        <table className="debt-planner-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Projected balance</th>
              <th>Interest</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {selectedPlan.preview.map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td>{centsToDisplay(row.balanceCents)}</td>
                <td>{centsToDisplay(row.interestCents)}</td>
                <td>{centsToDisplay(row.paidCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
