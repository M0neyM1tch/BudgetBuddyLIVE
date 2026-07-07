import type {
  CompoundGrowthResult,
  CompoundGrowthScenario,
  GrowthPoint,
} from '../types/calculator.types';

export function compoundFutureValue(
  principalCents: number,
  monthlyContributionCents: number,
  annualRate: number,
  years: number,
): number {
  let balance = Math.max(0, principalCents);

  for (let year = 1; year <= years; year += 1) {
    balance = balance * (1 + annualRate) + monthlyContributionCents * 12;
  }

  return Math.round(balance);
}

export function buildGrowthSeries(scenario: CompoundGrowthScenario): GrowthPoint[] {
  const series: GrowthPoint[] = [];
  let balance = Math.max(0, scenario.principalCents);

  for (let year = 1; year <= scenario.years; year += 1) {
    balance = balance * (1 + scenario.annualRate) + scenario.monthlyContributionCents * 12;

    const contributions =
      scenario.principalCents + scenario.monthlyContributionCents * 12 * year;

    series.push({
      year,
      balanceCents: Math.round(balance),
      contributionsCents: contributions,
      growthCents: Math.round(balance - contributions),
    });
  }

  return series;
}

export function calculateCompoundGrowth(
  scenario: CompoundGrowthScenario,
): CompoundGrowthResult {
  const series = buildGrowthSeries(scenario);
  const futureValueCents = series.at(-1)?.balanceCents ?? scenario.principalCents;
  const totalContributionsCents =
    scenario.principalCents + scenario.monthlyContributionCents * 12 * scenario.years;
  const plusHundredFutureValueCents = compoundFutureValue(
    scenario.principalCents,
    scenario.monthlyContributionCents + 10_000,
    scenario.annualRate,
    scenario.years,
  );

  return {
    futureValueCents,
    totalContributionsCents,
    investmentGrowthCents: futureValueCents - totalContributionsCents,
    plusHundredFutureValueCents,
    series,
  };
}
