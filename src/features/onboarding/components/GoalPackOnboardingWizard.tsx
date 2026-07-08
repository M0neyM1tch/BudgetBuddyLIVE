import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Home,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { displayToCents } from '../../../shared/utils/currency';
import { today } from '../../../shared/utils/dates';
import {
  useCreateGoalPackOnboardingSetup,
  useRecalculateGoalPlan,
} from '../../goalPacks';
import {
  useCreateRecurringRule,
  useProcessRecurringRules,
  useRecurringRules,
} from '../../transactions/hooks/useTransactions';
import type { RecurringRule, RecurringRuleDraft } from '../../transactions/types/transactions.types';
import { useCompleteOnboarding } from '../hooks/useOnboarding';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingStep } from './OnboardingStep';
import {
  buildGoalPackOnboardingPlan,
  type GoalPackOnboardingDraft,
  type PriorityGoalType,
} from '../utils/goalPackOnboarding';

type GoalPackOnboardingWizardProps = {
  isOpen: boolean;
};

type PriorityOption = {
  body: string;
  Icon: LucideIcon;
  label: string;
  type: PriorityGoalType;
};

type SmartSetupForm = {
  createRecurringExpenseRule: boolean;
  createRecurringIncomeRule: boolean;
  recurringStartDate: string;
};

type OnboardingForm = GoalPackOnboardingDraft & SmartSetupForm;

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    body: 'Build a cash buffer for surprise costs and unstable months.',
    Icon: ShieldCheck,
    label: 'Emergency fund',
    type: 'emergency_fund',
  },
  {
    body: 'Focus extra cash toward a debt payoff order.',
    Icon: CreditCard,
    label: 'Debt payoff',
    type: 'debt_payoff',
  },
  {
    body: 'Save for a first home, car, move, trip, or other large target.',
    Icon: Home,
    label: 'Major purchase',
    type: 'major_purchase',
  },
  {
    body: 'Start with a flexible goal and refine the plan as details become clearer.',
    Icon: Target,
    label: 'Custom goal',
    type: 'custom',
  },
];

function createDefaultForm(): OnboardingForm {
  return {
    age: '',
    countryCode: 'CA',
    createRecurringExpenseRule: false,
    createRecurringIncomeRule: false,
    currentAmount: '',
    debtBalance: '',
    debtInterestRate: '',
    debtMinimumPayment: '',
    goalName: '',
    horizon: 'short_term',
    monthlyCommitment: '',
    monthlyEssentialExpenses: '',
    monthlyExpenses: '',
    monthlyIncome: '',
    priorityType: 'emergency_fund',
    recurringStartDate: today(),
    regionCode: '',
    targetAmount: '',
    targetDate: '',
    targetMonths: '3',
  };
}

function fieldLabel(type: PriorityGoalType) {
  if (type === 'emergency_fund') return 'Current buffer';
  return 'Current savings';
}

function priorityTitle(type: PriorityGoalType) {
  return PRIORITY_OPTIONS.find((option) => option.type === type)?.label ?? 'Goal';
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unable to create the priority plan.';
  return `${message} Try again; BudgetBuddy will reuse a saved starter plan if one was already created.`;
}

function positiveCents(value: string): number | null {
  const cents = displayToCents(value);
  return cents !== null && cents > 0 ? cents : null;
}

function dayOfMonth(isoDate: string): number | null {
  const day = Number(isoDate.split('-')[2]);
  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : null;
}

function recurringRulesForForm(form: OnboardingForm): RecurringRuleDraft[] {
  const startDate = form.recurringStartDate || today();
  const rules: RecurringRuleDraft[] = [];
  const monthlyIncomeCents = positiveCents(form.monthlyIncome);
  const monthlyExpenseCents = positiveCents(form.monthlyExpenses);

  if (form.createRecurringIncomeRule && monthlyIncomeCents) {
    rules.push({
      amount_cents: monthlyIncomeCents,
      category: 'pay',
      day_of_month: dayOfMonth(startDate),
      description: 'Monthly income',
      frequency: 'monthly',
      is_active: true,
      kind: 'income',
      next_run_date: startDate,
      notes: 'Created during priority setup.',
      skip_backdate: false,
      start_date: startDate,
    });
  }

  if (form.createRecurringExpenseRule && monthlyExpenseCents) {
    rules.push({
      amount_cents: monthlyExpenseCents,
      category: 'housing',
      day_of_month: dayOfMonth(startDate),
      description: 'Monthly essential bills',
      frequency: 'monthly',
      is_active: true,
      kind: 'expense',
      next_run_date: startDate,
      notes: 'Created during priority setup.',
      skip_backdate: false,
      start_date: startDate,
    });
  }

  return rules;
}

function recurringRuleMatches(rule: RecurringRule, draft: RecurringRuleDraft) {
  return (
    rule.is_active === draft.is_active &&
    rule.amount_cents === draft.amount_cents &&
    rule.category === draft.category &&
    rule.description === draft.description &&
    rule.frequency === draft.frequency &&
    rule.kind === draft.kind &&
    rule.start_date === draft.start_date
  );
}

export function GoalPackOnboardingWizard({ isOpen }: GoalPackOnboardingWizardProps) {
  const navigate = useNavigate();
  const completeMutation = useCompleteOnboarding();
  const createOnboardingSetupMutation = useCreateGoalPackOnboardingSetup();
  const createRecurringRuleMutation = useCreateRecurringRule();
  const processRecurringRulesMutation = useProcessRecurringRules();
  const recalculateGoalPlanMutation = useRecalculateGoalPlan();
  const recurringRulesQuery = useRecurringRules();
  const submissionInFlightRef = useRef(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<OnboardingForm>(() => createDefaultForm());
  const [clientError, setClientError] = useState<string | null>(null);
  const isLastStep = stepIndex === 3;
  const totalSteps = 4;
  const isSubmitting =
    completeMutation.isPending ||
    createOnboardingSetupMutation.isPending ||
    createRecurringRuleMutation.isPending ||
    processRecurringRulesMutation.isPending ||
    recalculateGoalPlanMutation.isPending;

  function updateField<Key extends keyof OnboardingForm>(
    key: Key,
    value: OnboardingForm[Key],
  ) {
    setClientError(null);
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function completeWithoutPlan() {
    await completeMutation.mutateAsync();
  }

  async function processRecurringCatchup() {
    let runsLeft = 10;

    while (runsLeft > 0) {
      const result = await processRecurringRulesMutation.mutateAsync({
        throughDate: today(),
      });

      runsLeft -= 1;
      if (!result.limited) break;
    }
  }

  async function createSelectedRecurringRules(): Promise<boolean> {
    const drafts = recurringRulesForForm(form);
    if (drafts.length === 0) return false;

    const refetchedRules = recurringRulesQuery.data ?? (await recurringRulesQuery.refetch()).data ?? [];
    const knownRules = [...refetchedRules];
    const shouldBackdate = drafts.some((draft) => draft.start_date <= today());

    for (const draft of drafts) {
      if (knownRules.some((rule) => recurringRuleMatches(rule, draft))) continue;

      const created = await createRecurringRuleMutation.mutateAsync(draft);
      knownRules.push(created);
    }

    return shouldBackdate;
  }

  async function createPriorityPlan() {
    if (submissionInFlightRef.current || isSubmitting) return;

    submissionInFlightRef.current = true;
    setClientError(null);

    try {
      const plan = buildGoalPackOnboardingPlan(form);
      const setup = await createOnboardingSetupMutation.mutateAsync({
        actionDraft: plan.actionDraft,
        debtDraft: plan.debtDraft,
        goalDraft: plan.goalDraft,
        goalPlanUpdate: plan.goalPlanUpdate,
        priorityDraft: plan.priorityDraft,
      });
      await recalculateGoalPlanMutation.mutateAsync({
        goalId: setup.goal_id,
      });
      const shouldBackdateRecurringRules = await createSelectedRecurringRules();
      if (shouldBackdateRecurringRules) {
        await processRecurringCatchup();
      }
      await completeMutation.mutateAsync();
      navigate('/dashboard');
    } catch (error) {
      setClientError(errorMessage(error));
    } finally {
      submissionInFlightRef.current = false;
    }
  }

  async function handlePrimaryAction() {
    if (!isLastStep) {
      setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
      return;
    }

    await createPriorityPlan();
  }

  const selectedPriority = priorityTitle(form.priorityType);

  return (
    <Modal
      isOpen={isOpen}
      title="Priority setup"
      className="onboarding-wizard-modal onboarding-wizard-modal--wide"
      onClose={() => {
        void completeWithoutPlan();
      }}
      footer={
        <>
          {stepIndex > 0 ? (
            <Button
              type="button"
              variant="ghost"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                void completeWithoutPlan();
              }}
            >
              Skip
            </Button>
          )}
          <Button
            type="button"
            rightIcon={isLastStep ? <Check size={16} /> : <ArrowRight size={16} />}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => {
              void handlePrimaryAction();
            }}
          >
            {isLastStep ? 'Create plan' : 'Next'}
          </Button>
        </>
      }
    >
      <div className="onboarding-wizard goal-pack-onboarding">
        <div className="onboarding-hero-icon" aria-hidden="true">
          {stepIndex === 0 ? <WalletCards size={28} /> : null}
          {stepIndex === 1 ? <Sparkles size={28} /> : null}
          {stepIndex === 2 ? <Target size={28} /> : null}
          {stepIndex === 3 ? <Repeat2 size={28} /> : null}
        </div>

        {stepIndex === 0 ? (
          <OnboardingStep eyebrow="Your cash flow" title="Add the monthly baseline">
            <div className="priority-form-grid">
              <label className="priority-form-field">
                <span>Monthly income</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="5200.00"
                  value={form.monthlyIncome}
                  onChange={(event) => updateField('monthlyIncome', event.target.value)}
                />
              </label>
              <label className="priority-form-field">
                <span>Monthly expenses</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="3100.00"
                  value={form.monthlyExpenses}
                  onChange={(event) => updateField('monthlyExpenses', event.target.value)}
                />
              </label>
            </div>
            <p className="priority-form-note">
              These numbers let BudgetBuddy estimate monthly capacity. You can optionally turn
              them into recurring rules before finishing setup.
            </p>
          </OnboardingStep>
        ) : null}

        {stepIndex === 1 ? (
          <OnboardingStep eyebrow="Top priority" title="Choose the first plan">
            <div className="priority-option-grid">
              {PRIORITY_OPTIONS.map(({ body, Icon, label, type }) => (
                <button
                  key={type}
                  type="button"
                  className={
                    form.priorityType === type
                      ? 'priority-option is-selected'
                      : 'priority-option'
                  }
                  aria-pressed={form.priorityType === type}
                  onClick={() => updateField('priorityType', type)}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{label}</span>
                  <small>{body}</small>
                </button>
              ))}
            </div>
          </OnboardingStep>
        ) : null}

        {stepIndex === 2 ? (
          <OnboardingStep eyebrow={selectedPriority} title="Create the starter goal">
            <div className="priority-form-grid">
              <label className="priority-form-field priority-form-field--wide">
                <span>Goal name</span>
                <input
                  type="text"
                  maxLength={100}
                  placeholder={selectedPriority}
                  value={form.goalName}
                  onChange={(event) => updateField('goalName', event.target.value)}
                />
              </label>

              {form.priorityType === 'emergency_fund' ? (
                <>
                  <label className="priority-form-field">
                    <span>Monthly essentials</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="2100.00"
                      value={form.monthlyEssentialExpenses}
                      onChange={(event) =>
                        updateField('monthlyEssentialExpenses', event.target.value)
                      }
                    />
                  </label>
                  <label className="priority-form-field">
                    <span>Target months</span>
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={form.targetMonths}
                      onChange={(event) => updateField('targetMonths', event.target.value)}
                    />
                  </label>
                </>
              ) : null}

              {form.priorityType === 'debt_payoff' ? (
                <>
                  <label className="priority-form-field">
                    <span>Focused balance</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="8200.00"
                      value={form.debtBalance}
                      onChange={(event) => updateField('debtBalance', event.target.value)}
                    />
                  </label>
                  <label className="priority-form-field">
                    <span>Interest rate</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="19.99"
                      value={form.debtInterestRate}
                      onChange={(event) => updateField('debtInterestRate', event.target.value)}
                    />
                  </label>
                  <label className="priority-form-field">
                    <span>Minimum payment</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="150.00"
                      value={form.debtMinimumPayment}
                      onChange={(event) => updateField('debtMinimumPayment', event.target.value)}
                    />
                  </label>
                </>
              ) : null}

              {form.priorityType === 'major_purchase' || form.priorityType === 'custom' ? (
                <>
                  <label className="priority-form-field">
                    <span>Target amount</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="25000.00"
                      value={form.targetAmount}
                      onChange={(event) => updateField('targetAmount', event.target.value)}
                    />
                  </label>
                  <label className="priority-form-field">
                    <span>{fieldLabel(form.priorityType)}</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="1000.00"
                      value={form.currentAmount}
                      onChange={(event) => updateField('currentAmount', event.target.value)}
                    />
                  </label>
                </>
              ) : null}

              {form.priorityType === 'emergency_fund' ? (
                <label className="priority-form-field">
                  <span>{fieldLabel(form.priorityType)}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="500.00"
                    value={form.currentAmount}
                    onChange={(event) => updateField('currentAmount', event.target.value)}
                  />
                </label>
              ) : null}

              {form.priorityType !== 'debt_payoff' ? (
                <label className="priority-form-field">
                  <span>Monthly contribution</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="250.00"
                    value={form.monthlyCommitment}
                    onChange={(event) => updateField('monthlyCommitment', event.target.value)}
                  />
                </label>
              ) : null}

              <label className="priority-form-field priority-form-field--wide">
                <span>Target date</span>
                <input
                  type="date"
                  value={form.targetDate}
                  onInput={(event) => updateField('targetDate', event.currentTarget.value)}
                  onChange={(event) => updateField('targetDate', event.currentTarget.value)}
                />
              </label>
            </div>

            <p className="priority-form-note">
              The starter plan is an educational scenario based on what you enter here. It does
              not provide financial, tax, mortgage, legal, debt-relief, or investment advice.
            </p>

            {clientError ? (
              <p className="priority-form-error" role="alert">
                {clientError}
              </p>
            ) : null}
          </OnboardingStep>
        ) : null}

        {stepIndex === 3 ? (
          <OnboardingStep eyebrow="Optional setup" title="Make the plan smarter">
            <div className="priority-form-grid">
              <label className="priority-form-field priority-form-field--wide">
                <span>First recurring date</span>
                <input
                  type="date"
                  value={form.recurringStartDate}
                  onInput={(event) => updateField('recurringStartDate', event.currentTarget.value)}
                  onChange={(event) => updateField('recurringStartDate', event.currentTarget.value)}
                />
              </label>

              <label
                className={
                  positiveCents(form.monthlyIncome)
                    ? 'priority-checkbox-card'
                    : 'priority-checkbox-card is-disabled'
                }
              >
                <input
                  type="checkbox"
                  checked={form.createRecurringIncomeRule}
                  disabled={!positiveCents(form.monthlyIncome)}
                  onChange={(event) =>
                    updateField('createRecurringIncomeRule', event.target.checked)
                  }
                />
                <span>
                  <strong>Track monthly income</strong>
                  <small>Create a monthly pay rule from the income baseline.</small>
                </span>
              </label>

              <label
                className={
                  positiveCents(form.monthlyExpenses)
                    ? 'priority-checkbox-card'
                    : 'priority-checkbox-card is-disabled'
                }
              >
                <input
                  type="checkbox"
                  checked={form.createRecurringExpenseRule}
                  disabled={!positiveCents(form.monthlyExpenses)}
                  onChange={(event) =>
                    updateField('createRecurringExpenseRule', event.target.checked)
                  }
                />
                <span>
                  <strong>Track monthly bills</strong>
                  <small>Create a monthly essential-bills rule from the expense baseline.</small>
                </span>
              </label>
            </div>

            <p className="priority-form-note">
              Recurring rules live in Transactions and can be edited or deleted any time. Skipping
              this keeps the starter plan manual.
            </p>

            {clientError ? (
              <p className="priority-form-error" role="alert">
                {clientError}
              </p>
            ) : null}
          </OnboardingStep>
        ) : null}

        <OnboardingProgress currentStep={stepIndex} totalSteps={totalSteps} />
      </div>
    </Modal>
  );
}
