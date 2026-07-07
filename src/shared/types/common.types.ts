export type ID = string;

export type Nullable<T> = T | null;

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};
