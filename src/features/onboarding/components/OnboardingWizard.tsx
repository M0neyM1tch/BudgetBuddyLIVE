import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CreditCard, LayoutDashboard, Plus, Target, WalletCards } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingStep } from './OnboardingStep';
import { useCompleteOnboarding } from '../hooks/useOnboarding';

const STEPS = [
  {
    eyebrow: 'Start here',
    title: 'Welcome to BudgBeacon',
    body: 'Track spending, reach your goals, and pay off debt from one secure workspace.',
    route: null,
    label: 'Next',
    Icon: WalletCards,
  },
  {
    eyebrow: 'Cash flow',
    title: 'Add your first transaction',
    body: 'Transactions are the base layer. Add income and expenses so every dashboard number has real data behind it.',
    route: '/dashboard/transactions?new=1',
    label: 'Go to Transactions',
    Icon: Plus,
  },
  {
    eyebrow: 'Savings',
    title: 'Set a savings goal',
    body: 'Create a goal for an emergency fund, trip, house deposit, or anything you want to build toward.',
    route: '/dashboard/goals?new=1',
    label: 'Go to Goals',
    Icon: Target,
  },
  {
    eyebrow: 'Payoff plan',
    title: 'Track a debt',
    body: 'Add debts with balances, rates, and minimum payments so you can compare payoff strategies.',
    route: '/dashboard/debts',
    label: 'Go to Debts',
    Icon: CreditCard,
  },
  {
    eyebrow: 'Big picture',
    title: 'Explore your dashboard',
    body: 'Your dashboard ties everything together with KPIs, snapshots, and recent activity.',
    route: '/dashboard',
    label: 'Finish',
    Icon: LayoutDashboard,
  },
] as const;

type OnboardingWizardProps = {
  isOpen: boolean;
};

export function OnboardingWizard({ isOpen }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const completeMutation = useCompleteOnboarding();
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const { Icon } = step;

  async function complete(route?: string | null) {
    await completeMutation.mutateAsync();
    if (route) navigate(route);
  }

  async function handlePrimaryAction() {
    if (isLastStep) {
      await complete(step.route);
      return;
    }

    if (step.route) navigate(step.route);
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Welcome"
      className="onboarding-wizard-modal"
      onClose={() => {
        void completeMutation.mutateAsync();
      }}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              void completeMutation.mutateAsync();
            }}
          >
            Skip
          </Button>
          <Button
            type="button"
            rightIcon={isLastStep ? <Check size={16} /> : <ArrowRight size={16} />}
            isLoading={completeMutation.isPending}
            onClick={() => {
              void handlePrimaryAction();
            }}
          >
            {step.label}
          </Button>
        </>
      }
    >
      <div className="onboarding-wizard">
        <div className="onboarding-hero-icon" aria-hidden="true">
          <Icon size={28} />
        </div>
        <OnboardingStep eyebrow={step.eyebrow} title={step.title}>
          <p>{step.body}</p>
        </OnboardingStep>
        <OnboardingProgress currentStep={stepIndex} totalSteps={STEPS.length} />
      </div>
    </Modal>
  );
}
