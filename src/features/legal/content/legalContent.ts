export const LEGAL_LAST_UPDATED = 'July 1, 2026';

export const legalLinks = [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
] as const;

export const termsSections = [
  {
    title: 'Use of BudgBeacon',
    body: [
      'BudgBeacon helps users organize income, expenses, goals, debts, Goal Packs, and planning scenarios. You are responsible for the accuracy of the information you enter and for decisions you make using the app.',
      'You must use BudgBeacon only for lawful personal finance planning purposes and must not misuse the service, interfere with security, or attempt to access data that does not belong to you.',
    ],
  },
  {
    title: 'Financial information and calculators',
    body: [
      'BudgBeacon provides budgeting tools, Goal Packs, projections, calculators, debt payoff comparisons, next actions, and educational planning outputs. These outputs are estimates and scenarios only and are not financial, investment, tax, mortgage, accounting, legal, or professional advice.',
      'Calculator and Goal Pack results depend on assumptions such as user-entered balances, expenses, income, contribution amounts, target dates, APRs, payoff methods, spending categories, and optional growth assumptions. Actual outcomes can differ materially.',
      'Debt payoff comparisons, contribution paths, category-shift scenarios, and active-priority actions show common approaches and possible trade-offs. They are not recommendations to choose a particular strategy, account, loan, mortgage, security, investment product, tax position, or legal structure.',
      'BudgBeacon is not registered as a financial adviser, investment dealer, mortgage broker, credit counsellor, tax preparer, accountant, lawyer, or portfolio manager under Ontario securities law, federal financial services regulations, or comparable laws. Consider speaking with a qualified professional before making decisions with legal, tax, mortgage, investment, or debt-relief consequences.',
    ],
  },
  {
    title: 'Accounts and security',
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials and for activity that occurs through your account.',
      'BudgBeacon uses Supabase-backed authentication and row-level access controls. No system is perfectly secure, so you should use a strong unique password and keep your email account secure.',
    ],
  },
  {
    title: 'Subscriptions and future paid features',
    body: [
      'BudgBeacon may add paid plans or premium features in the future. Any paid terms, billing details, cancellation rules, taxes, and refund policies should be presented before purchase.',
      'Until a paid plan is launched, any subscription language should be treated as a placeholder and reviewed before activation.',
    ],
  },
  {
    title: 'Availability and changes',
    body: [
      'BudgBeacon may change, suspend, or discontinue features as the product evolves. We may update these terms when needed and will revise the last-updated date when material changes are made.',
      'The service is provided on an as-is and as-available basis to the fullest extent permitted by law.',
    ],
  },
  {
    title: 'Limitation of liability',
    body: [
      'To the fullest extent permitted by law, BudgBeacon is not responsible for indirect, incidental, consequential, special, exemplary, or punitive damages, or for financial losses arising from reliance on estimates, projections, Goal Pack outputs, categorization, scenario comparisons, or user-entered information.',
      'Some jurisdictions do not allow certain limitations, so these limits may not apply to every user.',
    ],
  },
  {
    title: 'Governing law',
    body: [
      'These terms are drafted for a Canada-first launch posture and should be reviewed for the final business entity, operating province, target markets, and launch jurisdictions before production use.',
    ],
  },
] as const;

export const privacySections = [
  {
    title: 'What BudgBeacon collects',
    body: [
      'BudgBeacon may collect account information such as email address, authentication identifiers, and profile preferences.',
      'When you use the app, BudgBeacon stores the financial information you choose to enter, including transactions, recurring rules, goals, debts, financial priorities, Goal Pack setup inputs, plan snapshots, next-action status, simulator assumptions, and related notes.',
      'BudgBeacon may also process technical information needed to operate and secure the app, such as browser, device, session, and diagnostic information.',
    ],
  },
  {
    title: 'How information is used',
    body: [
      'Information is used to provide your BudgBeacon account, sync your data across devices, calculate summaries, Goal Pack plans, projections, scenarios, and next actions, secure the service, troubleshoot issues, and improve product quality.',
      'BudgBeacon should not sell personal financial data. If advertising, Plaid, payments, or marketing systems are added later, this policy and consent controls should be updated before launch.',
      'BudgBeacon uses Cloudflare Web Analytics to understand aggregate site usage and page performance. Cloudflare Web Analytics may load a browser beacon for real-user monitoring. We use this information to improve reliability and the product experience, not for advertising, marketing retargeting, or selling user data.',
    ],
  },
  {
    title: 'Storage, processors, and security',
    body: [
      'BudgBeacon uses Supabase for authentication, database storage, and backend services. Hosting may be provided through Cloudflare Pages or similar infrastructure.',
      'Data is protected using technical controls such as authentication, database permissions, row-level security, and transport encryption. No service can guarantee absolute security.',
    ],
  },
  {
    title: 'Cookies and local storage',
    body: [
      'At launch, BudgBeacon is intended to use only essential browser storage needed for authentication, security, preferences, and remembering whether notices or onboarding tips were dismissed.',
      'BudgBeacon may also use Cloudflare Web Analytics for aggregate performance and usage measurement. Cloudflare Web Analytics may load a browser beacon for real-user monitoring, but this does not require BudgBeacon to set marketing cookies. This analytics is not used for advertising or marketing retargeting.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You can update or delete information in your account where the app provides controls. You may also request access, correction, or deletion of personal information, subject to identity verification and legal retention requirements.',
      'You can clear browser storage through your browser settings, but doing so may sign you out or reset local preferences.',
    ],
  },
  {
    title: 'Retention',
    body: [
      'BudgBeacon should retain personal information only as long as needed to provide the service, meet legal obligations, resolve disputes, prevent abuse, and maintain backups.',
      'BudgBeacon retains account and financial data for as long as your account is active and for a reasonable period thereafter to meet legal, security, and dispute-resolution obligations. You may request deletion of your account and associated data by contacting us directly.',
    ],
  },
  {
    title: 'Canada-first privacy posture',
    body: [
      'This policy is drafted with a Canada-first launch in mind. The Office of the Privacy Commissioner of Canada describes PIPEDA obligations through principles such as accountability, identifying purposes, consent, limiting collection, safeguards, openness, access, and challenging compliance.',
      'If BudgBeacon targets users outside Canada, especially in the European Union, United Kingdom, or California, additional legal review and region-specific disclosures may be required.',
    ],
  },
  {
    title: 'Contact and privacy requests',
    body: [
      'You may contact BudgBeacon with questions, access requests, correction requests, or deletion requests by emailing Budgca@gmail.com. We will respond within 30 days.',
      'BudgBeacon is accountable for personal information under its control and will designate a person responsible for compliance with these privacy principles.',
    ],
  },
] as const;
