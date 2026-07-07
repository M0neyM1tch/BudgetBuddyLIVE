type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="onboarding-progress" aria-label={`Step ${currentStep + 1} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <span
          aria-hidden="true"
          className={index === currentStep ? 'is-active' : ''}
          key={index}
        />
      ))}
    </div>
  );
}

