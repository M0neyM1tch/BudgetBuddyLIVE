import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { normalizeError } from '../../../shared/api/errors';
import { updatePassword } from '../api/auth.api';
import './LoginPage.css';

const RESET_PASSWORD_PATTERN = '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{10,}';
const RESET_PASSWORD_TITLE =
  'Use at least 10 characters with lowercase and uppercase letters, a number, and a symbol.';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      navigate('/login', { replace: true });
    } catch (caughtError) {
      setError(normalizeError(caughtError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="reset-password-title">
        <div className="auth-brand">
          <img
            src="/brand/budgbeacon-full-960x540.png"
            alt="BudgBeacon"
            className="auth-logo"
          />
          <h1 id="reset-password-title">Choose a new password</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>New password</span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={10}
              pattern={RESET_PASSWORD_PATTERN}
              title={RESET_PASSWORD_TITLE}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <small>{RESET_PASSWORD_TITLE}</small>
          </label>

          <label className="auth-field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save new password'}
          </button>
          <Link className="auth-secondary-link" to="/login">
            Back to sign in
          </Link>
        </form>
      </section>
    </main>
  );
}
