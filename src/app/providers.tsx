import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/components/AuthProvider';
import { queryClient } from '../shared/api/queryClient';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
