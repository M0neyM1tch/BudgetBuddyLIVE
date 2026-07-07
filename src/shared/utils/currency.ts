export function centsToDisplay(cents: number, currencyCode = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function displayToCents(value: string | number): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value * 100) : null;
  }

  const normalized = value.trim().replace(/,/g, '').replace(/[^0-9.-]/g, '');
  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') {
    return null;
  }

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) return null;

  return Math.round(numeric * 100);
}

export function formatCompact(cents: number): string {
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (Math.abs(dollars) >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  return centsToDisplay(cents);
}
