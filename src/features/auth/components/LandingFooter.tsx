import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div>
        <img src="/BBLogo.jpg" alt="" className="landing-footer__logo" />
        <span>BudgetBuddy</span>
        <small>Copyright © 2026 BudgetBuddy. All rights reserved.</small>
      </div>
      <nav aria-label="Landing footer">
        <Link to="/login">Sign in</Link>
        <Link to="/signup">Create account</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
      </nav>
    </footer>
  );
}
