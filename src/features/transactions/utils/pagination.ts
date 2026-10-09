export const TRANSACTION_PAGE_SIZES = [10, 25, 50, 100] as const;

export function totalTransactionPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

export function clampTransactionPage(page: number, count: number, pageSize: number): number {
  return Math.max(0, Math.min(page, totalTransactionPages(count, pageSize) - 1));
}
