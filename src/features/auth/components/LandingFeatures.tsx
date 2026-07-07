import {
  ArrowLeftRight,
  BarChart2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  ListChecks,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

type LandingFeature = {
  Icon: LucideIcon;
  label: string;
  tagline: string;
};

type LandingStep = {
  body: string;
  title: string;
};

const FEATURES: LandingFeature[] = [
  {
    Icon: Target,
    label: 'Pick your top priority',
    tagline: 'Start with the goal that matters most right now.',
  },
  {
    Icon: ShieldCheck,
    label: 'Build a cash buffer',
    tagline: 'Know how much safety margin you have and what to add next.',
  },
  {
    Icon: CreditCard,
    label: 'Pay down debt with a clear method',
    tagline: 'Compare payoff order, pressure, and momentum without a spreadsheet.',
  },
  {
    Icon: PiggyBank,
    label: 'Save for a major purchase',
    tagline: 'Track the amount, timeline, monthly gap, and trade-offs.',
  },
  {
    Icon: ArrowLeftRight,
    label: 'See what changed your timeline',
    tagline: 'Connect cash-flow changes to earlier or later goal dates.',
  },
  {
    Icon: ListChecks,
    label: 'Turn transactions into next actions',
    tagline: 'Use real spending to decide the next useful move.',
  },
];

const HOW_IT_WORKS: LandingStep[] = [
  {
    title: 'Choose your priority.',
    body: 'Tell BudgetBuddy whether you are focused on a buffer, debt, a purchase, or a custom goal.',
  },
  {
    title: 'BudgetBuddy builds your starter plan.',
    body: 'The app creates the goal, planning assumptions, and first action so you are not starting from blank.',
  },
  {
    title: 'Your dashboard updates as your money changes.',
    body: 'Transactions, recurring rules, debts, and goals keep the plan honest over time.',
  },
];

const GOAL_PACKS: LandingFeature[] = [
  {
    Icon: ShieldCheck,
    label: 'Emergency Fund',
    tagline: 'Build a practical buffer and see how many months it covers.',
  },
  {
    Icon: CreditCard,
    label: 'Debt Payoff',
    tagline: 'Organize balances, compare methods, and track payoff momentum.',
  },
  {
    Icon: WalletCards,
    label: 'Major Purchase',
    tagline: 'Plan for a house fund, car, trip, or other large target.',
  },
  {
    Icon: Sparkles,
    label: 'Custom Goal',
    tagline: 'Shape a flexible plan when your priority does not fit a preset.',
  },
];

const PROGRESS_SIGNALS: LandingFeature[] = [
  {
    Icon: CalendarClock,
    label: 'Debt-free date moved closer',
    tagline: 'See the timeline effect when payments, rates, or spending change.',
  },
  {
    Icon: ShieldCheck,
    label: 'Emergency buffer improved',
    tagline: 'Turn each contribution into visible months of protection.',
  },
  {
    Icon: BarChart2,
    label: 'Monthly gap reduced',
    tagline: 'Watch the remaining monthly amount shrink as the plan improves.',
  },
  {
    Icon: CheckCircle2,
    label: 'Next action completed',
    tagline: 'Keep progress moving with one practical step at a time.',
  },
];

function FeatureGrid({
  features,
  variant,
}: {
  features: LandingFeature[];
  variant?: 'compact';
}) {
  const gridClassName =
    variant === 'compact' ? 'landing-feature-grid landing-feature-grid--compact' : 'landing-feature-grid';

  return (
    <div className={gridClassName}>
      {features.map(({ Icon, label, tagline }) => (
        <article className="landing-feature" key={label}>
          <span className="landing-feature__mark" aria-hidden="true">
            <Icon size={26} strokeWidth={2.2} />
          </span>
          <h3>{label}</h3>
          <p>{tagline}</p>
        </article>
      ))}
    </div>
  );
}

export function LandingFeatures() {
  return (
    <>
      <section className="landing-section" aria-labelledby="landing-features-title">
        <div className="landing-section__header">
          <p className="landing-eyebrow">What BudgetBuddy helps with</p>
          <h2 id="landing-features-title">Turn your financial goals into a clear, actionable plan.</h2>
        </div>

        <FeatureGrid features={FEATURES} />
      </section>

      <section className="landing-section landing-section--plain" aria-labelledby="landing-how-title">
        <div className="landing-section__header">
          <p className="landing-eyebrow">How it works</p>
          <h2 id="landing-how-title">A plan that starts simple and gets sharper as you use it.</h2>
        </div>

        <div className="landing-steps">
          {HOW_IT_WORKS.map((step, index) => (
            <article className="landing-step" key={step.title}>
              <span aria-hidden="true">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" aria-labelledby="landing-packs-title">
        <div className="landing-section__header">
          <p className="landing-eyebrow">Goal Packs</p>
          <h2 id="landing-packs-title">Choose the planning mode that matches your current season.</h2>
        </div>

        <FeatureGrid features={GOAL_PACKS} variant="compact" />
      </section>

      <section className="landing-section landing-section--plain" aria-labelledby="landing-progress-title">
        <div className="landing-section__header">
          <p className="landing-eyebrow">Progress you can feel</p>
          <h2 id="landing-progress-title">Small updates should show you what actually changed.</h2>
        </div>

        <FeatureGrid features={PROGRESS_SIGNALS} variant="compact" />
      </section>
    </>
  );
}
