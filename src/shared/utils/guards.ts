export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export function assertNonNullable<T>(
  value: T,
  label = 'value'
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${label} to be non-nullable, got ${value}`);
  }
}