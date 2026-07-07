import { centsToDisplay } from '../../../shared/utils/currency';
import type { GoalPlanSnapshot, GoalType } from '../../goalPacks/types/goalPacks.types';
import {
  buildCategoryBuckets,
  calculateNetSummary,
  rangeLengthDays,
} from './analytics.utils';
import type { AnalyticsTransaction, DateRange } from '../types/analytics.types';

const AVERAGE_MONTH_DAYS = 30.4375;
const DAY_MS = 86_400_000;

type InsightTone = 'good' | 'neutral' | 'risk' | 'watch';

export type GoalAwareAnalyticsPlanInput = {
  amountRemainingCents: number;
  confidenceScore: number | null;
  currencyCode: string;
  currentAmountCents: number;
  goalName: string;
  goalType: GoalType;
  monthlyCommitmentCents: number;
  projectedCompletionDate: string | null;
  requiredMonthlyCents: number | null;
  targetAmountCents: number;
};

export type GoalAwareAnalyticsMetric = {
  label: string;
  tone: InsightTone;
  value: string;
};

export type GoalAwareAnalyticsInsight = {
  body: string;
  label: string;
  tone: InsightTone;
};

export type GoalAwareSpendingLever = {
  category: string;
  impactLabel: string;
  label: string;
  monthlyEstimateLabel: string;
  scenarioAmountLabel: string;
  tone: InsightTone;
};

export type GoalAwareAnalyticsModel = {
  changeInsights: GoalAwareAnalyticsInsight[];
  goalName: string;
  metrics: GoalAwareAnalyticsMetric[];
  planStatus: GoalAwareAnalyticsInsight;
  spendingLevers: GoalAwareSpendingLever[];
};

export type BuildGoalAwareAnalyticsModelInput = {
  latestSnapshot: GoalPlanSnapshot | null;
  plan: GoalAwareAnalyticsPlanInput;
  priorTransactions: AnalyticsTransaction[];
  previousSnapshot: GoalPlanSnapshot | null;
  range: DateRange;
  transactions: AnalyticsTransaction[];
};

function monthlyize(cents: number, range: DateRange) {
  return Math.round((cents * AVERAGE_MONTH_DAYS) / Math.max(1, rangeLengthDays(range)));
}

function formatDateLabel(value: string | null) {
  if (!value) return 'Needs contribution';

  return new Intl.DateTimeFormat('en-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function signedMoneyLabel(cents: number, currencyCode: string) {
  const absolute = centsToDisplay(Math.abs(cents), currencyCode);
  if (cents > 0) return `+${absolute}`;
  if (cents < 0) return `-${absolute}`;
  return absolute;
}

function dateDeltaDays(current: string | null, previous: string | null) {
  if (!current || !previous) return null;

  const currentDate = new Date(`${current}T00:00:00Z`).getTime();
  const previousDate = new Date(`${previous}T00:00:00Z`).getTime();

  if (!Number.isFinite(currentDate) || !Number.isFinite(previousDate)) return null;
  return Math.round((currentDate - previousDate) / DAY_MS);
}

function goalProgressPct(plan: GoalAwareAnalyticsPlanInput) {
  if (plan.targetAmountCents <= 0) return 0;
  return Math.min(100, Math.max(0, (plan.currentAmountCents / plan.targetAmountCents) * 100));
}

function monthsSaved(
  amountRemainingCents: number,
  monthlyBaseCents: number,
  monthlyScenarioCents: number,
) {
  if (amountRemainingCents <= 0 || monthlyBaseCents <= 0 || monthlyScenarioCents <= 0) {
    return 0;
  }

  const currentMonths = Math.ceil(amountRemainingCents / monthlyBaseCents);
  const scenarioMonths = Math.ceil(amountRemainingCents / (monthlyBaseCents + monthlyScenarioCents));
  return Math.max(0, currentMonths - scenarioMonths);
}

function planStatus(input: {
  monthlyGapCents: number | null;
  monthlyNetCents: number;
  monthlyTargetCents: number;
  plan: GoalAwareAnalyticsPlanInput;
}): GoalAwareAnalyticsInsight {
  if (input.plan.amountRemainingCents <= 0) {
    return {
      body: 'This goal is funded. Pick the next priority or close out the active plan.',
      label: 'Goal funded',
      tone: 'good',
    };
  }

  if (input.monthlyTargetCents <= 0) {
    return {
      body: 'Add a target date or monthly contribution so Analytics can compare cash flow to the plan.',
      label: 'Plan needs a target',
      tone: 'neutral',
    };
  }

  if (input.monthlyGapCents === 0) {
    return {
      body: `Estimated monthly cash flow covers the ${centsToDisplay(
        input.monthlyTargetCents,
        input.plan.currencyCode,
      )} plan target.`,
      label: 'Cash flow supports the plan',
      tone: 'good',
    };
  }

  if (input.monthlyNetCents > 0) {
    return {
      body: `Estimated monthly cash flow is positive, but the plan still needs about ${centsToDisplay(
        input.monthlyGapCents ?? 0,
        input.plan.currencyCode,
      )} more per month.`,
      label: 'Monthly gap to close',
      tone: 'watch',
    };
  }

  return {
    body: 'This period is running negative, so the active goal is relying on future cash-flow improvement.',
    label: 'Cash flow pressure',
    tone: 'risk',
  };
}

function buildSnapshotInsight(
  latestSnapshot: GoalPlanSnapshot | null,
  previousSnapshot: GoalPlanSnapshot | null,
  currencyCode: string,
): GoalAwareAnalyticsInsight | null {
  if (!latestSnapshot || !previousSnapshot) return null;

  const projectedDelta = dateDeltaDays(
    latestSnapshot.projected_completion_date,
    previousSnapshot.projected_completion_date,
  );

  if (projectedDelta !== null && projectedDelta !== 0) {
    return {
      body:
        projectedDelta < 0
          ? `Projected completion moved ${Math.abs(projectedDelta)} days sooner since the previous plan snapshot.`
          : `Projected completion slipped ${projectedDelta} days later since the previous plan snapshot.`,
      label: 'Plan date changed',
      tone: projectedDelta < 0 ? 'good' : 'watch',
    };
  }

  const requiredDelta =
    (latestSnapshot.required_monthly_cents ?? 0) - (previousSnapshot.required_monthly_cents ?? 0);

  if (requiredDelta !== 0) {
    return {
      body:
        requiredDelta < 0
          ? `Required monthly funding fell by ${centsToDisplay(Math.abs(requiredDelta), currencyCode)}.`
          : `Required monthly funding rose by ${centsToDisplay(requiredDelta, currencyCode)}.`,
      label: 'Monthly target changed',
      tone: requiredDelta < 0 ? 'good' : 'watch',
    };
  }

  return {
    body: 'The latest plan snapshot held steady against the previous snapshot.',
    label: 'Plan held steady',
    tone: 'neutral',
  };
}

function buildChangeInsights(input: {
  latestSnapshot: GoalPlanSnapshot | null;
  plan: GoalAwareAnalyticsPlanInput;
  priorTransactions: AnalyticsTransaction[];
  previousSnapshot: GoalPlanSnapshot | null;
  transactions: AnalyticsTransaction[];
}): GoalAwareAnalyticsInsight[] {
  const summary = calculateNetSummary(input.transactions, input.priorTransactions);
  const insights: GoalAwareAnalyticsInsight[] = [];

  if (input.priorTransactions.length > 0) {
    const netDelta = summary.netCents - summary.priorNetCents;
    insights.push({
      body:
        netDelta >= 0
          ? `Net cash flow improved by ${centsToDisplay(netDelta, input.plan.currencyCode)} versus the previous period.`
          : `Net cash flow tightened by ${centsToDisplay(Math.abs(netDelta), input.plan.currencyCode)} versus the previous period.`,
      label: 'Cash-flow change',
      tone: netDelta >= 0 ? 'good' : 'watch',
    });
  } else {
    insights.push({
      body: 'Add another period of transactions to unlock period-over-period plan changes.',
      label: 'Comparison pending',
      tone: 'neutral',
    });
  }

  const spendingDeltas = buildCategoryBuckets(
    input.transactions,
    'expense',
    input.priorTransactions,
  )
    .map((bucket) => ({
      deltaCents: bucket.totalCents - (bucket.priorCents ?? 0),
      label: bucket.label,
    }))
    .filter((bucket) => bucket.deltaCents !== 0)
    .sort((a, b) => Math.abs(b.deltaCents) - Math.abs(a.deltaCents));

  const topSpendingDelta = spendingDeltas[0];
  if (topSpendingDelta) {
    insights.push({
      body:
        topSpendingDelta.deltaCents > 0
          ? `${topSpendingDelta.label} spending rose by ${centsToDisplay(
              topSpendingDelta.deltaCents,
              input.plan.currencyCode,
            )}.`
          : `${topSpendingDelta.label} spending fell by ${centsToDisplay(
              Math.abs(topSpendingDelta.deltaCents),
              input.plan.currencyCode,
            )}.`,
      label: topSpendingDelta.deltaCents > 0 ? 'Largest increase' : 'Largest decrease',
      tone: topSpendingDelta.deltaCents > 0 ? 'watch' : 'good',
    });
  }

  const snapshotInsight = buildSnapshotInsight(
    input.latestSnapshot,
    input.previousSnapshot,
    input.plan.currencyCode,
  );
  if (snapshotInsight) insights.push(snapshotInsight);

  insights.push({
    body: `${goalProgressPct(input.plan).toFixed(1)}% funded with ${centsToDisplay(
      input.plan.amountRemainingCents,
      input.plan.currencyCode,
    )} remaining.`,
    label: 'Goal progress',
    tone: input.plan.amountRemainingCents <= 0 ? 'good' : 'neutral',
  });

  return insights.slice(0, 3);
}

function buildSpendingLevers(input: {
  monthlyGapCents: number | null;
  monthlyNetCents: number;
  plan: GoalAwareAnalyticsPlanInput;
  priorTransactions: AnalyticsTransaction[];
  range: DateRange;
  transactions: AnalyticsTransaction[];
}): GoalAwareSpendingLever[] {
  const baseMonthlyCents = Math.max(input.monthlyNetCents, input.plan.monthlyCommitmentCents, 0);
  const positiveGapCents = Math.max(0, input.monthlyGapCents ?? 0);

  return buildCategoryBuckets(input.transactions, 'expense', input.priorTransactions)
    .filter((bucket) => bucket.totalCents > 0)
    .slice(0, 4)
    .map((bucket) => {
      const monthlyEstimateCents = monthlyize(bucket.totalCents, input.range);
      const tenPercentScenarioCents = Math.max(0, Math.round(monthlyEstimateCents * 0.1));
      const scenarioCents =
        positiveGapCents > 0
          ? Math.min(positiveGapCents, tenPercentScenarioCents)
          : tenPercentScenarioCents;
      const savedMonths = monthsSaved(
        input.plan.amountRemainingCents,
        baseMonthlyCents,
        scenarioCents,
      );
      const gapCoveragePct =
        positiveGapCents > 0 && scenarioCents > 0
          ? Math.min(100, (scenarioCents / positiveGapCents) * 100)
          : null;

      return {
        category: bucket.category,
        impactLabel:
          gapCoveragePct !== null
            ? `Scenario: covers ${gapCoveragePct.toFixed(0)}% of the monthly gap.`
            : savedMonths > 0
              ? `Scenario: about ${savedMonths} months sooner.`
              : `Scenario: ${signedMoneyLabel(scenarioCents, input.plan.currencyCode)} per month.`,
        label: bucket.label,
        monthlyEstimateLabel: centsToDisplay(monthlyEstimateCents, input.plan.currencyCode),
        scenarioAmountLabel: centsToDisplay(scenarioCents, input.plan.currencyCode),
        tone: bucket.totalCents > (bucket.priorCents ?? 0) ? 'watch' : 'neutral',
      };
    });
}

export function buildGoalAwareAnalyticsModel({
  latestSnapshot,
  plan,
  priorTransactions,
  previousSnapshot,
  range,
  transactions,
}: BuildGoalAwareAnalyticsModelInput): GoalAwareAnalyticsModel {
  const summary = calculateNetSummary(transactions, priorTransactions);
  const monthlyNetCents = monthlyize(summary.netCents, range);
  const monthlyTargetCents = plan.requiredMonthlyCents ?? plan.monthlyCommitmentCents;
  const monthlyGapCents =
    monthlyTargetCents > 0 ? Math.max(0, monthlyTargetCents - monthlyNetCents) : null;
  const coveragePct =
    monthlyTargetCents > 0 ? Math.max(0, (monthlyNetCents / monthlyTargetCents) * 100) : null;
  const status = planStatus({
    monthlyGapCents,
    monthlyNetCents,
    monthlyTargetCents,
    plan,
  });

  return {
    changeInsights: buildChangeInsights({
      latestSnapshot,
      plan,
      priorTransactions,
      previousSnapshot,
      transactions,
    }),
    goalName: plan.goalName,
    metrics: [
      {
        label: 'Plan coverage',
        tone: coveragePct === null ? 'neutral' : coveragePct >= 100 ? 'good' : 'watch',
        value: coveragePct === null ? 'Needs target' : `${Math.min(999, coveragePct).toFixed(0)}%`,
      },
      {
        label: 'Monthly gap',
        tone: monthlyGapCents === null || monthlyGapCents === 0 ? 'good' : 'watch',
        value:
          monthlyGapCents === null
            ? 'Set target'
            : monthlyGapCents === 0
              ? 'Covered'
              : centsToDisplay(monthlyGapCents, plan.currencyCode),
      },
      {
        label: 'Projected date',
        tone: plan.projectedCompletionDate ? 'neutral' : 'watch',
        value: formatDateLabel(plan.projectedCompletionDate),
      },
      {
        label: 'Confidence',
        tone:
          plan.confidenceScore === null
            ? 'neutral'
            : plan.confidenceScore >= 75
              ? 'good'
              : plan.confidenceScore >= 45
                ? 'watch'
                : 'risk',
        value: plan.confidenceScore === null ? 'New' : `${plan.confidenceScore}%`,
      },
    ],
    planStatus: status,
    spendingLevers: buildSpendingLevers({
      monthlyGapCents,
      monthlyNetCents,
      plan,
      priorTransactions,
      range,
      transactions,
    }),
  };
}
