import { QueryClient } from '@tanstack/react-query';

function hasAuthStatus(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('status' in error)) return false;

  const status = (error as { status?: unknown }).status;
  return status === 401 || status === 403;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => {
        if (hasAuthStatus(error)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
