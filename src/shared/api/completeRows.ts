import { AppError } from './errors';

type CountedRows<Row> = {
  data: Row[] | null;
  count: number | null;
};

/** Only use with rows and an exact count returned by the same SELECT request. */
export function requireCompleteRows<Row>(
  result: CountedRows<Row>,
  label: string,
): Row[] {
  if (
    !Array.isArray(result.data) ||
    !Number.isSafeInteger(result.count) ||
    result.count == null ||
    result.count < 0
  ) {
    throw new AppError(
      `The complete ${label} could not be verified. Please try again before using this view.`,
      'INCOMPLETE_DATA',
    );
  }

  if (result.data.length !== result.count) {
    throw new AppError(
      `The complete ${label} could not be loaded. This view cannot show partial results. Choose a shorter period where available, or contact support.`,
      'INCOMPLETE_DATA',
    );
  }

  return result.data;
}
