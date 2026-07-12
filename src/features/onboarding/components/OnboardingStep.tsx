import type { ReactNode } from 'react';

type OnboardingStepProps = {
  eyebrow: string;
  eyebrowDetail?: string;
  title?: string;
  children: ReactNode;
};

export function OnboardingStep({ eyebrow, eyebrowDetail, title, children }: OnboardingStepProps) {
  return (
    <div className="onboarding-step">
      <p className="page-kicker onboarding-step-kicker">
        <span>{eyebrow}</span>
        {eyebrowDetail ? (
          <span className="onboarding-step-kicker-detail">{eyebrowDetail}</span>
        ) : null}
      </p>
      {title ? <h3>{title}</h3> : null}
      <div className="onboarding-step-copy">{children}</div>
    </div>
  );
}
