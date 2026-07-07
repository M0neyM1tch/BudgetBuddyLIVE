export class AppError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error && typeof error === 'object' && 'message' in error) {
    const e = error as { message: string; code?: string; status?: number };
    return new AppError(
      e.message ?? 'An unexpected error occurred',
      e.code ?? 'UNKNOWN',
      e.status
    );
  }

  return new AppError('An unexpected error occurred', 'UNKNOWN');
}

export const ErrorCodes = {
  NOT_FOUND: 'PGRST116',
  DUPLICATE: '23505',
  FOREIGN_KEY: '23503',
  RLS_VIOLATION: '42501',
  JWT_EXPIRED: 'JWT expired',
} as const;