import { Link, Navigate } from 'react-router-dom';
import { LoadingState } from '../../../shared/components/feedback/LoadingState';
import { LandingFeatures } from '../components/LandingFeatures';
import { LandingFooter } from '../components/LandingFooter';
import { LandingHero } from '../components/LandingHero';
import { useAuth } from '../hooks/useAuth';
import '../../../styles/landing.css';

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingState label="Loading BudgetBuddy" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Landing">
        <Link className="landing-nav__brand" to="/">
          <img src="/BBLogo.jpg" alt="" />
          <span>BudgetBuddy</span>
        </Link>
        <div className="landing-nav__actions">
          <Link to="/login">Sign in</Link>
          <Link className="landing-button landing-button--primary" to="/signup">
            Start free
          </Link>
        </div>
      </nav>
      <LandingHero />
      <LandingFeatures />
      <section className="landing-final-cta" aria-labelledby="landing-final-title">
        <h2 id="landing-final-title">Start with a plan you can adjust.</h2>
        <p>
          Create your account, choose your top priority, and let BudgetBuddy turn your
          real numbers into a dashboard, timeline, and next action.
        </p>
        <p className="landing-final-cta__disclaimer">
          BudgetBuddy provides educational estimates and planning scenarios, not financial,
          investment, tax, mortgage, legal, or debt-relief advice.
        </p>
        <Link className="landing-button landing-button--primary" to="/signup">
          Create my account
        </Link>
      </section>
      <LandingFooter />
    </main>
  );
}
