import { Link, useLocation } from 'react-router-dom';
import './LoginPage.css';

type ConfirmEmailState = {
  email?: string;
};

export function ConfirmEmailPage() {
  const location = useLocation();
  const state = location.state as ConfirmEmailState | null;

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="confirm-email-title">
        <div className="auth-brand">
          <img
            src="/brand/budgbeacon-full-960x540.png"
            alt="BudgBeacon"
            className="auth-logo"
          />
          <h1 id="confirm-email-title">Check your email</h1>
        </div>

        <p className="auth-copy">
          We sent a confirmation link{state?.email ? ` to ${state.email}` : ''}. Open it to
          activate your account before signing in.
        </p>
        <p className="auth-copy auth-copy--muted">
          If it does not arrive within a few minutes, check your spam folder or try signing up
          again with the same email address.
        </p>

        <Link className="auth-submit auth-submit--link" to="/login">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
