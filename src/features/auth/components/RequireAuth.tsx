import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '../../../shared/components/feedback/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { saveAuthRedirect } from '../utils/redirects';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingState />;

  if (!isAuthenticated) {
    saveAuthRedirect({
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
