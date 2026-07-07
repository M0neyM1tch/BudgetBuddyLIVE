import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { normalizeError } from '../../../shared/api/errors';
import { requestPasswordReset } from '../api/auth.api';
import './LoginPage.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim(), `${window.location.origin}/reset-password`);
      setSuccess('If an account exists for that email, a reset link will arrive shortly.');
    } catch (caughtError) {
      setError(normalizeError(caughtError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="forgot-password-title">
        <div className="auth-brand">
          <img src="/BBLogo.jpg" alt="BudgetBuddy" className="auth-logo" />
          <div>
            <p className="auth-kicker">BudgetBuddy</p>
            <h1 id="forgot-password-title">Reset your password</h1>
          </div>
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

          {success ? <p className="auth-success">{success}</p> : null}
          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
          <Link className="auth-secondary-link" to="/login">
            Back to sign in
          </Link>
        </form>
      </section>
    </main>
  );
}
