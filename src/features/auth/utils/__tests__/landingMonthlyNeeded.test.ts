import { describe, expect, it } from 'vitest';
import { calculateLandingMonthlyNeeded } from '../landingMonthlyNeeded';

describe('calculateLandingMonthlyNeeded', () => {
  it('calculates monthly needed for a normal target and date', () => {
    const result = calculateLandingMonthlyNeeded({
      currentAmount: 3_000,
      currentDate: '2026-07-08',
      plannedMonthly: 500,
      priorityKind: 'major_purchase',
      targetAmount: 15_000,
      targetDate: '2027-07-08',
    });

    expect(result.amountRemaining).toBe(12_000);
    expect(result.monthsUntilTarget).toBe(12);
    expect(result.monthlyNeeded).toBe(1_000);
    expect(result.monthlyGap).toBe(500);
    expect(result.status).toBe('behind');
  });

  it('returns zero needed when the target is already reached', () => {
    const result = calculateLandingMonthlyNeeded({
      currentAmount: 15_000,
      currentDate: '2026-07-08',
      plannedMonthly: 250,
      priorityKind: 'emergency_fund',
      targetAmount: 12_000,
      targetDate: '2027-07-08',
    });

    expect(result.amountRemaining).toBe(0);
    expect(result.monthlyNeeded).toBe(0);
    expect(result.progressPct).toBe(100);
    expect(result.status).toBe('complete');
  });

  it('shows a monthly gap when planned monthly is below required', () => {
    const result = calculateLandingMonthlyNeeded({
      currentAmount: 0,
      currentDate: '2026-07-08',
      plannedMonthly: 500,
      priorityKind: 'custom',
      targetAmount: 12_000,
      targetDate: '2027-07-08',
    });

    expect(result.monthlyNeeded).toBe(1_000);
    expect(result.monthlyGap).toBe(500);
    expect(result.status).toBe('behind');
  });

  it('shows surplus when planned monthly is above required', () => {
    const result = calculateLandingMonthlyNeeded({
      currentAmount: 0,
      currentDate: '2026-07-08',
      plannedMonthly: 1_250,
      priorityKind: 'debt_payoff',
      targetAmount: 12_000,
      targetDate: '2027-07-08',
    });

    expect(result.monthlyNeeded).toBe(1_000);
    expect(result.monthlyGap).toBe(-250);
    expect(result.status).toBe('ahead');
  });

  it('uses at least one month for invalid or near-term dates', () => {
    const invalidDate = calculateLandingMonthlyNeeded({
      currentAmount: 0,
      currentDate: '2026-07-08',
      plannedMonthly: 0,
      priorityKind: 'custom',
      targetAmount: 750,
      targetDate: 'not-a-date',
    });
    const sameDay = calculateLandingMonthlyNeeded({
      currentAmount: 0,
      currentDate: '2026-07-08',
      plannedMonthly: 0,
      priorityKind: 'custom',
      targetAmount: 750,
      targetDate: '2026-07-08',
    });

    expect(invalidDate.monthsUntilTarget).toBe(1);
    expect(invalidDate.monthlyNeeded).toBe(750);
    expect(sameDay.monthsUntilTarget).toBe(1);
    expect(sameDay.monthlyNeeded).toBe(750);
  });
});
