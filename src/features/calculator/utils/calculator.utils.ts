import { toISODate } from '../../../shared/utils/dates';

export function lastSixFullMonthsRange(now = new Date()): { from: string; to: string } {
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const to = new Date(currentMonthStart);
  to.setDate(0);

  return {
    from: toISODate(from),
    to: toISODate(to),
  };
}

export function lastFullMonthRange(now = new Date()): { from: string; to: string } {
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    from: toISODate(from),
    to: toISODate(to),
  };
}

export function monthDiff(fromDate: Date, toDate: Date): number {
  return (toDate.getFullYear() - fromDate.getFullYear()) * 12 + toDate.getMonth() - fromDate.getMonth();
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
