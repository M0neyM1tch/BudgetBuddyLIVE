import { Link } from 'react-router-dom';
import {
  LEGAL_LAST_UPDATED,
  legalLinks,
  privacySections,
  termsSections,
} from '../content/legalContent';
import './LegalPage.css';

type LegalPageProps = {
  kind: 'terms' | 'privacy';
};

export function LegalPage({ kind }: LegalPageProps) {
  const isTerms = kind === 'terms';
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy';
  const description = isTerms
    ? 'The ground rules for using BudgetBuddy and understanding the limits of financial calculators.'
    : 'How BudgetBuddy handles account, financial, and essential browser-storage data.';
  const sections = isTerms ? termsSections : privacySections;

  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link className="legal-brand" to="/">
          <img src="/BBLogo.jpg" alt="" />
          <span>BudgetBuddy</span>
        </Link>
        <nav aria-label="Legal documents">
          {legalLinks.map((link) => (
            <Link
              className={link.to === (isTerms ? '/terms' : '/privacy') ? 'is-active' : undefined}
              key={link.to}
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="legal-hero" aria-labelledby="legal-title">
        <p className="page-kicker">Legal</p>
        <h1 id="legal-title">{title}</h1>
        <p>{description}</p>
        <small>Last updated: {LEGAL_LAST_UPDATED}</small>
      </section>

      <section className="legal-notice" aria-label="Important legal notice">
        <h2>Pre-launch review note</h2>
        <p>
          These documents are practical product copy, not legal advice. BudgetBuddy
          should have counsel review Terms, Privacy, cookie notices, Goal Pack
          estimate language, financial calculator disclaimers, debt payoff scenario
          copy, and launch jurisdictions before public release.
        </p>
      </section>

      <article className="legal-content">
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>

      <footer className="legal-footer">
        <span>Copyright © 2026 BudgetBuddy. All rights reserved.</span>
        <Link to="/">Back to BudgetBuddy</Link>
      </footer>
    </main>
  );
}
