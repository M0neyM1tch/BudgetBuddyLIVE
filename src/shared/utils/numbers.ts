export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return clamp((part / total) * 100, 0, 100);
}

export function basisPointsToRate(basisPoints: number): number {
  return basisPoints / 10000;
}

export function rateToDisplayPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}