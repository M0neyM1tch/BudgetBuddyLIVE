function padDatePart(value: number): string {
  return String(value).padStart(2, '0');
}

function parseLocalISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `${year}-${month}-${day}`;
}

export function today(): string {
  return toISODate(new Date());
}

export function formatDisplay(isoDate: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parseLocalISODate(isoDate));
}

export function monthLabel(isoDate: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
  }).format(parseLocalISODate(isoDate));
}

export function daysBetween(a: string, b: string): number {
  const ms = parseLocalISODate(b).getTime() - parseLocalISODate(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}
