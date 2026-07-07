import { getCategoryLabel } from '../../transactions/constants/categories';
import type {
  AnalyticsDebtSnapshot,
  AnalyticsGoalSnapshot,
  AnalyticsTransaction,
  CategoryBucket,
  CustomRangeValidation,
  DailyBucket,
  DateRange,
  MonthlyBucket,
  NetSummary,
  PeriodPreset,
} from '../types/analytics.types';

const DAY_MS = 86_400_000;
const MAX_CUSTOM_RANGE_DAYS = 366;

function utcDateFromISO(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, days: number): string {
  const date = utcDateFromISO(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toISODate(date);
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function startOfYear(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
}

function monthKey(value: string): string {
  return value.slice(0, 7);
}

function monthLabel(value: string): string {
  const date = utcDateFromISO(`${value}-01`);
  return new Intl.DateTimeFormat('en-CA', { month: 'short' }).format(date);
}

function shortDateLabel(value: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(utcDateFromISO(value));
}

export function rangeLengthDays(range: Pick<DateRange, 'from' | 'to'>): number {
  const from = utcDateFromISO(range.from).getTime();
  const to = utcDateFromISO(range.to).getTime();
  return Math.floor((to - from) / DAY_MS) + 1;
}

export function validateCustomRange(from: string, to: string): CustomRangeValidation {
  if (!from || !to) {
    return { isValid: false, message: 'Choose a start and end date.' };
  }

  if (from > to) {
    return { isValid: false, message: 'Start date must be before end date.' };
  }

  if (rangeLengthDays({ from, to }) > MAX_CUSTOM_RANGE_DAYS) {
    return { isValid: false, message: 'Custom ranges can be up to 366 days.' };
  }

  return { isValid: true, message: null };
}

export function buildPresetRange(preset: Exclude<PeriodPreset, 'custom'>, now = new Date()): DateRange {
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  if (preset === 'this_month') {
    return {
      from: toISODate(startOfMonth(today)),
      to: toISODate(today),
      preset,
    };
  }

  if (preset === 'last_month') {
    const previousMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
    return {
      from: toISODate(startOfMonth(previousMonth)),
      to: toISODate(endOfMonth(previousMonth)),
      preset,
    };
  }

  if (preset === 'last_3_months' || preset === 'last_6_months') {
    const months = preset === 'last_3_months' ? 2 : 5;
    const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - months, 1));
    return {
      from: toISODate(from),
      to: toISODate(today),
      preset,
    };
  }

  return {
    from: toISODate(startOfYear(today)),
    to: toISODate(today),
    preset,
  };
}

export function buildCustomRange(from: string, to: string): DateRange {
  return { from, to, preset: 'custom' };
}

export function getPriorDateRange(range: DateRange): DateRange {
  const days = rangeLengthDays(range);
  const priorTo = addDays(range.from, -1);
  const priorFrom = addDays(priorTo, -(days - 1));
  return { from: priorFrom, to: priorTo, preset: 'custom' };
}

export function calculateNetSummary(
  current: AnalyticsTransaction[],
  prior: AnalyticsTransaction[],
): NetSummary {
  const currentIncome = sumByKind(current, 'income');
  const currentExpenses = sumByKind(current, 'expense');
  const priorIncome = sumByKind(prior, 'income');
  const priorExpenses = sumByKind(prior, 'expense');

  return {
    incomeCents: currentIncome,
    expensesCents: currentExpenses,
    netCents: currentIncome - currentExpenses,
    priorIncomeCents: priorIncome,
    priorExpensesCents: priorExpenses,
    priorNetCents: priorIncome - priorExpenses,
  };
}

export function periodDelta(currentCents: number, priorCents: number): number | null {
  if (priorCents === 0) return currentCents === 0 ? 0 : null;
  return ((currentCents - priorCents) / Math.abs(priorCents)) * 100;
}

export function buildIncomeExpenseBuckets(
  transactions: AnalyticsTransaction[],
  range: DateRange,
): MonthlyBucket[] {
  const singleMonth = monthKey(range.from) === monthKey(range.to);
  const buckets = new Map<string, MonthlyBucket>();

  for (const transaction of transactions) {
    const key = singleMonth ? weeklyKey(transaction.date, range.from) : monthKey(transaction.date);
    const label = singleMonth ? key : monthLabel(key);
    const bucket =
      buckets.get(key) ??
      {
        month: key,
        label,
        incomeCents: 0,
        expensesCents: 0,
        netCents: 0,
      };

    if (transaction.kind === 'income') bucket.incomeCents += transaction.amountCents;
    if (transaction.kind === 'expense') bucket.expensesCents += transaction.amountCents;
    bucket.netCents = bucket.incomeCents - bucket.expensesCents;
    buckets.set(key, bucket);
  }

  return [...buckets.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function buildCategoryBuckets(
  transactions: AnalyticsTransaction[],
  kind: 'income' | 'expense',
  priorTransactions: AnalyticsTransaction[] = [],
): CategoryBucket[] {
  const totals = sumCategories(transactions, kind);
  const priorTotals = sumCategories(priorTransactions, kind);
  const totalForKind = [...totals.values()].reduce((sum, total) => sum + total, 0);

  return [...totals.entries()]
    .map(([category, totalCents]) => ({
      category,
      label: getCategoryLabel(category),
      totalCents,
      percentage: totalForKind > 0 ? (totalCents / totalForKind) * 100 : 0,
      priorCents: priorTotals.get(category) ?? 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

export function topCategoryBuckets(buckets: CategoryBucket[], limit: number): CategoryBucket[] {
  if (buckets.length <= limit) return buckets;

  const visible = buckets.slice(0, limit);
  const rest = buckets.slice(limit);
  const otherTotal = rest.reduce((sum, bucket) => sum + bucket.totalCents, 0);
  const otherPrior = rest.reduce((sum, bucket) => sum + (bucket.priorCents ?? 0), 0);
  const total = buckets.reduce((sum, bucket) => sum + bucket.totalCents, 0);

  return [
    ...visible,
    {
      category: 'other',
      label: 'Other',
      totalCents: otherTotal,
      percentage: total > 0 ? (otherTotal / total) * 100 : 0,
      priorCents: otherPrior,
    },
  ];
}

export function buildDailySpendingBuckets(
  transactions: AnalyticsTransaction[],
  range: DateRange,
): DailyBucket[] {
  const buckets = new Map<string, DailyBucket>();
  const days = rangeLengthDays(range);

  for (let index = 0; index < days; index += 1) {
    const date = addDays(range.from, index);
    buckets.set(date, { date, label: shortDateLabel(date), expensesCents: 0 });
  }

  for (const transaction of transactions) {
    if (transaction.kind !== 'expense') continue;
    const bucket = buckets.get(transaction.date);
    if (bucket) bucket.expensesCents += transaction.amountCents;
  }

  return [...buckets.values()];
}

export function averageDailySpend(buckets: DailyBucket[]): number {
  if (buckets.length === 0) return 0;
  return buckets.reduce((sum, bucket) => sum + bucket.expensesCents, 0) / buckets.length;
}

export function goalProgress(currentCents: number, targetCents: number): number {
  if (targetCents <= 0) return 0;
  return Math.min(100, Math.max(0, (currentCents / targetCents) * 100));
}

export function debtProgress(principalCents: number, currentBalanceCents: number): number {
  if (principalCents <= 0) return 0;
  return Math.min(100, Math.max(0, ((principalCents - currentBalanceCents) / principalCents) * 100));
}

export function sortGoalsByProgress(goals: AnalyticsGoalSnapshot[]): AnalyticsGoalSnapshot[] {
  return [...goals].sort((a, b) => b.progressPct - a.progressPct);
}

export function sortDebtsByInterest(debts: AnalyticsDebtSnapshot[]): AnalyticsDebtSnapshot[] {
  return [...debts].sort((a, b) => b.interestRateBasisPoints - a.interestRateBasisPoints);
}

function sumByKind(transactions: AnalyticsTransaction[], kind: 'income' | 'expense'): number {
  return transactions.reduce(
    (sum, transaction) => sum + (transaction.kind === kind ? transaction.amountCents : 0),
    0,
  );
}

function sumCategories(
  transactions: AnalyticsTransaction[],
  kind: 'income' | 'expense',
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.kind !== kind) continue;
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amountCents);
  }

  return totals;
}

function weeklyKey(date: string, rangeStart: string): string {
  const daysFromStart = rangeLengthDays({ from: rangeStart, to: date }) - 1;
  const week = Math.floor(daysFromStart / 7) + 1;
  return `Week ${week}`;
}
