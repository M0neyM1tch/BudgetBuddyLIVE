import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  MoveRight,
  Banknote,
  Bus,
  CreditCard,
  Home,
  Landmark,
  PiggyBank,
  Receipt,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { centsToDisplay } from '../../../shared/utils/currency';
import { formatDisplay } from '../../../shared/utils/dates';
import { getCategoryLabel, getKindLabel } from '../../transactions/constants/categories';
import type { DashboardTransactionSnapshot } from '../types/dashboard.types';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  debt_payment: CreditCard,
  food: Utensils,
  housing: Home,
  investment: Landmark,
  pay: Banknote,
  savings: PiggyBank,
  subscriptions: Receipt,
  transportation: Bus,
};

type RecentTransactionsProps = {
  transactions?: DashboardTransactionSnapshot[];
  isLoading: boolean;
};

function signedAmount(transaction: DashboardTransactionSnapshot): number {
  if (transaction.kind === 'income') return transaction.amountCents;
  return -transaction.amountCents;
}

function KindIcon({ kind }: { kind: DashboardTransactionSnapshot['kind'] }) {
  if (kind === 'income') return <ArrowDownLeft size={14} />;
  if (kind === 'transfer') return <MoveRight size={14} />;
  return <ArrowUpRight size={14} />;
}

function kindLabel(kind: DashboardTransactionSnapshot['kind']): string {
  if (kind === 'transfer') return 'Transfer';
  return getKindLabel(kind);
}

export function RecentTransactions({
  transactions = [],
  isLoading,
}: RecentTransactionsProps) {
  return (
    <section className="dashboard-panel dashboard-panel--wide" aria-labelledby="dashboard-transactions-title">
      <div className="dashboard-panel-header">
        <div>
          <p className="section-kicker">Activity</p>
          <h3 id="dashboard-transactions-title">Recent transactions</h3>
        </div>
        <Link className="dashboard-panel-link" to="/dashboard/transactions">
          View all <ArrowRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="dashboard-transaction-list">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="dashboard-transaction-row dashboard-transaction-row--skeleton" key={index}>
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="dashboard-empty-copy">
          <p>No transactions yet. Add income or expenses to start building your overview.</p>
          <Link className="btn btn--primary btn--sm" to="/dashboard/transactions?new=1">
            Add Transaction
          </Link>
        </div>
      ) : (
        <div className="dashboard-transaction-list">
          {transactions.map((transaction) => {
            const Icon = CATEGORY_ICONS[transaction.category] ?? Receipt;
            const amount = signedAmount(transaction);
            const kind = transaction.kind;

            return (
              <article className="dashboard-transaction-row" key={transaction.id}>
                <div className="dashboard-transaction-main">
                  <div className="dashboard-transaction-icon" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4>{transaction.description || getCategoryLabel(transaction.category)}</h4>
                    <p>
                      {formatDisplay(transaction.transactionDate)} /{' '}
                      {getCategoryLabel(transaction.category)}
                    </p>
                  </div>
                </div>
                <div className="dashboard-transaction-side">
                  <strong
                    className={clsx(
                      'dashboard-transaction-amount',
                      `dashboard-transaction-amount--${transaction.kind}`,
                    )}
                  >
                    {amount > 0 ? '+' : ''}
                    {centsToDisplay(amount)}
                  </strong>
                  <span className={clsx('dashboard-kind-pill', `dashboard-kind-pill--${kind}`)}>
                    <KindIcon kind={transaction.kind} />
                    {kindLabel(kind)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
