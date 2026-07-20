import { useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { normalizeError } from '../../../shared/api/errors';
import { LEGAL_LAST_UPDATED } from '../../legal/content/legalContent';
import { useAuth } from '../hooks/useAuth';
import { consumeAuthRedirect, redirectTargetToPath } from '../utils/redirects';
import './LoginPage.css';

type LoginLocationState = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

const SIGN_UP_PASSWORD_PATTERN = '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{10,}';
const SIGN_UP_PASSWORD_TITLE =
  'Use at least 10 characters with lowercase and uppercase letters, a number, and a symbol.';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationState = location.state as LoginLocationState | null;
  const storedRedirect = useMemo(() => consumeAuthRedirect(), []);
  const redirectTo =
    locationState?.from
      ? redirectTargetToPath({
          pathname: locationState.from.pathname ?? '/dashboard',
          search: locationState.from.search ?? '',
          hash: locationState.from.hash ?? '',
        })
      : redirectTargetToPath(storedRedirect);
  const mode = location.pathname === '/signup' ? 'sign-up' : 'sign-in';
  const isSignUp = mode === 'sign-up';

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const clearMessages = () => {
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isSignUp && !acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const credentials = {
        email: email.trim(),
        password,
      };

      if (isSignUp) {
        const result = await signUp({
          ...credentials,
          acceptedTermsVersion: LEGAL_LAST_UPDATED,
        });

        if (result.requiresEmailConfirmation) {
          setPassword('');
          navigate('/signup/confirm-email', { replace: true, state: { email: credentials.email } });
          return;
        }
      } else {
        await signIn(credentials);
      }

      navigate(redirectTo, { replace: true });
    } catch (caughtError) {
      setError(normalizeError(caughtError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-brand">
          <img
            src="/brand/budgbeacon-full-960x540.png"
            alt="BudgBeacon"
            className="auth-logo"
          />
          <h1 id="auth-title">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        </div>

        <div className="auth-tabs" aria-label="Authentication mode">
          <Link
            className={mode === 'sign-in' ? 'auth-tab auth-tab--active' : 'auth-tab'}
            onClick={clearMessages}
            state={location.state}
            to="/login"
            replace
          >
            Sign in
          </Link>
          <Link
            className={mode === 'sign-up' ? 'auth-tab auth-tab--active' : 'auth-tab'}
            onClick={clearMessages}
            state={location.state}
            to="/signup"
            replace
          >
            Sign up
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              minLength={isSignUp ? 10 : undefined}
              pattern={isSignUp ? SIGN_UP_PASSWORD_PATTERN : undefined}
              title={isSignUp ? SIGN_UP_PASSWORD_TITLE : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {isSignUp ? <small>{SIGN_UP_PASSWORD_TITLE}</small> : null}
          </label>

          {isSignUp ? (
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                required
              />
              <span>
                I agree to the{' '}
                <a href="/legal/terms" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          ) : (
            <Link className="auth-secondary-link" to="/forgot-password">
              Forgot your password?
            </Link>
          )}

          {error ? <p className="auth-error">{error}</p> : null}

          <button
            className="auth-submit"
            type="submit"
            disabled={isSubmitting || (isSignUp && !acceptedTerms)}
          >
            {isSubmitting ? 'Working...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
