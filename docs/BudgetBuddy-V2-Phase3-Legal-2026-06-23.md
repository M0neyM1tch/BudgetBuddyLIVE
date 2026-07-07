# BudgetBuddy V2 Phase 3 Legal

Date: 2026-06-23
Branch: `phase-3/legal`
Base: `origin/develop` after `Phase 3/tooltips onboarding (#8)`

## Summary

This branch adds the first public legal surface for BudgetBuddy before launch: Terms of Service, Privacy Policy, a lightweight essential-storage notice, copyright footer text, and proprietary license metadata.

## Changes

- Added public routes:
  - `/terms`
  - `/privacy`
- Added reusable legal content in `src/features/legal/content/legalContent.ts`.
- Added `LegalPage` and legal page styling.
- Added global `CookieNotice` for essential browser storage.
- Updated landing footer with:
  - copyright notice
  - Terms link
  - Privacy link
- Added a proprietary `LICENSE` file.
- Added `license`, `copyright`, and `ossLicenseNote` metadata to `package.json`.
- Updated root package metadata in `package-lock.json`.

## Legal Posture

- Terms include explicit financial-calculator disclaimers:
  - BudgetBuddy outputs are estimates.
  - BudgetBuddy is not financial, investment, tax, accounting, legal, or professional advice.
  - Calculator assumptions and outcomes can differ materially from reality.
- Terms explicitly recommend legal review before launch because financial calculators and projections create liability considerations that generic templates do not fully cover.
- Privacy copy is Canada-first and references PIPEDA-style principles through plain-language product copy.
- Cookie/storage copy assumes no third-party analytics or marketing cookies at launch.
- The notice is framed as essential storage rather than a full marketing cookie consent flow, because the current launch surface is authentication, security, preferences, and dismissed notices.

## Supabase Notes

- No Supabase migration was required.
- No RLS or policy change was required.
- Privacy copy identifies Supabase as an authentication, database, and backend service provider.
- Current SPA auth/session storage should be reviewed again before launch if auth storage moves from browser local storage to cookies, server-side auth, or a custom domain/session setup.

## OSS And Copyright Notes

- The repository is marked `UNLICENSED` and private/proprietary.
- The `LICENSE` file reserves rights in BudgetBuddy code, product copy, assets, branding, and documentation.
- Third-party open-source dependencies remain governed by their own licenses.
- The package metadata notes that new dependencies should be reviewed for copyleft, network-copyleft, paid, source-available, or otherwise incompatible terms before approval.

## Validation

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- Browser smoke testing with temporary process-only Vite env values passed:
  - `/` renders with the essential-storage notice and no horizontal overflow
  - `/terms` renders the Terms of Service page and no horizontal overflow
  - `/privacy` renders the Privacy Policy page and no horizontal overflow
  - `Got it` dismisses the essential-storage notice
  - mobile `/terms` and `/privacy` render at 375px without horizontal overflow
  - browser console showed no warnings or errors during smoke

## Recommendation

Before launch, have a lawyer review the Terms, Privacy Policy, calculator disclaimers, data-retention language, business/entity name, governing law, contact method, and target jurisdictions. Update these documents again before enabling Plaid, paid subscriptions, analytics, email marketing, or payment processing.

## References Used

- Office of the Privacy Commissioner of Canada: PIPEDA overview and fair information principles.
  - https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/
- GDPR.eu cookie overview for practical cookie categories and strictly necessary cookie treatment. GDPR.eu is not an official EU government source, so use it as practical orientation only and verify with counsel for EU launch.
  - https://gdpr.eu/cookies/
