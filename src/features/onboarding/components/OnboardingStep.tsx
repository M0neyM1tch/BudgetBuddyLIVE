import type { ReactNode } from 'react';

type OnboardingStepProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function OnboardingStep({ eyebrow, title, children }: OnboardingStepProps) {
  return (
    <div className="onboarding-step">
      <p className="page-kicker">{eyebrow}</p>
      <h3>{title}</h3>
      <div className="onboarding-step-copy">{children}</div>
    </div>
  );
}

