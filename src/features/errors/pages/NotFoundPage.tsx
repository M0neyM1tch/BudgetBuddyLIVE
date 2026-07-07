import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import './NotFoundPage.css';

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  const target = isAuthenticated ? '/dashboard' : '/';

  return (
    <main className="not-found-page">
      <section className="not-found-panel" aria-labelledby="not-found-title">
        <p className="page-kicker">404</p>
        <h1 id="not-found-title">Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <Link className="not-found-action" to={target}>
          {isAuthenticated ? 'Go to dashboard' : 'Go home'}
        </Link>
      </section>
    </main>
  );
}
