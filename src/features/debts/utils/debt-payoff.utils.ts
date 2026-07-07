import { addMonths } from '../../../shared/utils/dates';
import type { DebtWithProgress } from '../types/debts.types';

export type PayoffStrategy = 'avalanche' | 'snowball';

export type PayoffDebtRow = {
  id: string;
  name: string;
  startingBalanceCents: number;
  interestRateBasisPoints: number;
  minimumPaymentCents: number;
};

export type AmortizationPreviewRow = {
  month: number;
  balanceCents: number;
  interestCents: number;
  paidCents: number;
};

export type PayoffPlanResult = {
  strategy: PayoffStrategy;
  monthsToDebtFree: number | null;
  debtFreeDate: string | null;
  totalInterestCents: number;
  totalPaidCents: number;
  orderedDebts: PayoffDebtRow[];
  preview: AmortizationPreviewRow[];
};

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function normalizeDebtsForPayoff(debts: DebtWithProgress[]): PayoffDebtRow[] {
  return debts
    .filter((debt) => !debt.is_archived && debt.current_balance_cents > 0)
    .map((debt) => ({
      id: debt.id,
      name: debt.name,
      startingBalanceCents: debt.current_balance_cents,
      interestRateBasisPoints: debt.interest_rate_basis_points,
      minimumPaymentCents: debt.minimum_payment_cents,
    }));
}

export function orderDebtsForStrategy(
  debts: PayoffDebtRow[],
  strategy: PayoffStrategy,
): PayoffDebtRow[] {
  if (strategy === 'avalanche') {
    return [...debts].sort((a, b) => b.interestRateBasisPoints - a.interestRateBasisPoints);
  }

  return [...debts].sort((a, b) => a.startingBalanceCents - b.startingBalanceCents);
}

export function calculatePayoffPlan(
  debts: PayoffDebtRow[],
  strategy: PayoffStrategy,
  extraMonthlyPaymentCents: number,
): PayoffPlanResult {
  const orderedDebts = orderDebtsForStrategy(debts, strategy);
  const balances = new Map(orderedDebts.map((debt) => [debt.id, debt.startingBalanceCents]));
  const preview: AmortizationPreviewRow[] = [];
  let totalInterestCents = 0;
  let totalPaidCents = 0;

  for (let month = 1; month <= 600; month += 1) {
    let monthInterestCents = 0;
    let monthPaidCents = 0;

    for (const debt of orderedDebts) {
      const balance = balances.get(debt.id) ?? 0;
      if (balance <= 0) continue;
      const interest = Math.round(balance * (debt.interestRateBasisPoints / 10_000 / 12));
      balances.set(debt.id, balance + interest);
      monthInterestCents += interest;
    }

    for (const debt of orderedDebts) {
      const balance = balances.get(debt.id) ?? 0;
      if (balance <= 0) continue;
      const payment = Math.min(balance, debt.minimumPaymentCents);
      balances.set(debt.id, balance - payment);
      monthPaidCents += payment;
    }

    let extra = extraMonthlyPaymentCents;
    for (const debt of orderedDebts) {
      if (extra <= 0) break;
      const balance = balances.get(debt.id) ?? 0;
      if (balance <= 0) continue;
      const payment = Math.min(balance, extra);
      balances.set(debt.id, balance - payment);
      monthPaidCents += payment;
      extra -= payment;
    }

    totalInterestCents += monthInterestCents;
    totalPaidCents += monthPaidCents;

    if (month <= 12) {
      preview.push({
        month,
        balanceCents: [...balances.values()].reduce((sum, balance) => sum + Math.max(0, balance), 0),
        interestCents: monthInterestCents,
        paidCents: monthPaidCents,
      });
    }

    const remainingBalance = [...balances.values()].reduce(
      (sum, balance) => sum + Math.max(0, balance),
      0,
    );

    if (remainingBalance <= 0) {
      return {
        strategy,
        monthsToDebtFree: month,
        debtFreeDate: toISODate(addMonths(new Date(), month)),
        totalInterestCents,
        totalPaidCents,
        orderedDebts,
        preview,
      };
    }
  }

  return {
    strategy,
    monthsToDebtFree: null,
    debtFreeDate: null,
    totalInterestCents,
    totalPaidCents,
    orderedDebts,
    preview,
  };
}
