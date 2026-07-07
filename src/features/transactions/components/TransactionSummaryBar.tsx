import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { centsToDisplay } from '../../../shared/utils/currency';
import type { TransactionSummary } from '../types/transactions.types';

type TransactionSummaryBarProps = {
  summary: TransactionSummary;
};

export function TransactionSummaryBar({ summary }: TransactionSummaryBarProps) {
  const items = [
    {
      label: 'Income',
      value: summary.income_cents,
      tone: 'income',
      Icon: ArrowUpRight,
    },
    {
      label: 'Expenses',
      value: summary.expense_cents,
      tone: 'expense',
      Icon: ArrowDownRight,
    },
    {
      label: 'Net',
      value: summary.net_cents,
      tone: summary.net_cents >= 0 ? 'income' : 'expense',
      Icon: Minus,
    },
  ] as const;

  return (
    <section className="transactions-summary" aria-label="Transaction summary">
      {items.map(({ label, value, tone, Icon }) => (
        <article className={`transactions-summary-card transactions-summary-card--${tone}`} key={label}>
          <div className="transactions-summary-icon" aria-hidden="true">
            <Icon size={18} strokeWidth={2.2} />
          </div>
          <div>
            <p>{label}</p>
            <strong>{centsToDisplay(value)}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}
