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
import { centsToDisplay, displayToCents } from '../../../shared/utils/currency';
import { today } from '../../../shared/utils/dates';
import {
  useCreateGoalPackOnboardingSetup,
  useRecalculateGoalPlan,
} from '../../goalPacks';
import { getCategoryLabel } from '../../transactions/constants/categories';
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
  advancedExpenseAmounts: Record<AdvancedExpenseSplitKey, string>;
  advancedIncomeAmounts: Record<AdvancedIncomeSplitKey, string>;
  createRecurringExpenseRule: boolean;
  createRecurringIncomeRule: boolean;
  recurringSetupMode: RecurringSetupMode;
  recurringStartDate: string;
};

type OnboardingForm = GoalPackOnboardingDraft & SmartSetupForm;

type RecurringSetupMode = 'quick' | 'advanced';

type AdvancedRecurringSplitDefinition<Key extends string = string> = {
  category: string;
  description: string;
  helper: string;
  key: Key;
  kind: Extract<RecurringRuleDraft['kind'], 'income' | 'expense'>;
  label: string;
  placeholder: string;
};

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

const ADVANCED_INCOME_SPLITS = [
  {
    category: 'pay',
    description: 'Pay',
    helper: 'Salary, wages, or regular take-home pay.',
    key: 'pay',
    kind: 'income',
    label: 'Pay',
    placeholder: '5200.00',
  },
  {
    category: 'investment',
    description: 'Savings and investment income',
    helper: 'Recurring interest, dividends, or planned investment income.',
    key: 'savings_investments',
    kind: 'income',
    label: 'Savings/investments',
    placeholder: '150.00',
  },
  {
    category: 'pay',
    description: 'Other income',
    helper: 'Side income, support payments, or other regular money in.',
    key: 'other_income',
    kind: 'income',
    label: 'Other',
    placeholder: '300.00',
  },
] as const satisfies readonly AdvancedRecurringSplitDefinition[];

const ADVANCED_EXPENSE_SPLITS = [
  {
    category: 'housing',
    description: 'Rent/housing',
    helper: 'Rent, mortgage, condo fees, or core housing costs.',
    key: 'housing',
    kind: 'expense',
    label: 'Rent/housing',
    placeholder: '1800.00',
  },
  {
    category: 'food',
    description: 'Food/groceries',
    helper: 'Groceries, recurring meal spend, or food basics.',
    key: 'food',
    kind: 'expense',
    label: 'Food/groceries',
    placeholder: '650.00',
  },
  {
    category: 'transportation',
    description: 'Transportation',
    helper: 'Transit, fuel, insurance, parking, or car payments.',
    key: 'transportation',
    kind: 'expense',
    label: 'Transportation',
    placeholder: '350.00',
  },
  {
    category: 'subscriptions',
    description: 'Subscriptions/bills',
    helper: 'Phone, utilities, software, streaming, or recurring bills.',
    key: 'subscriptions',
    kind: 'expense',
    label: 'Subscriptions/bills',
    placeholder: '250.00',
  },
  {
    category: 'debt_payment',
    description: 'Debt payments',
    helper: 'Minimum payments or planned recurring debt payments.',
    key: 'debt_payment',
    kind: 'expense',
    label: 'Debt payments',
    placeholder: '300.00',
  },
] as const satisfies readonly AdvancedRecurringSplitDefinition[];

type AdvancedIncomeSplitKey = (typeof ADVANCED_INCOME_SPLITS)[number]['key'];
type AdvancedExpenseSplitKey = (typeof ADVANCED_EXPENSE_SPLITS)[number]['key'];

function createEmptyAdvancedIncomeAmounts(): Record<AdvancedIncomeSplitKey, string> {
  return {
    other_income: '',
    pay: '',
    savings_investments: '',
  };
}

function createEmptyAdvancedExpenseAmounts(): Record<AdvancedExpenseSplitKey, string> {
  return {
    debt_payment: '',
    food: '',
    housing: '',
    subscriptions: '',
    transportation: '',
  };
}

function createDefaultForm(): OnboardingForm {
  return {
    advancedExpenseAmounts: createEmptyAdvancedExpenseAmounts(),
    advancedIncomeAmounts: createEmptyAdvancedIncomeAmounts(),
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
    recurringSetupMode: 'quick',
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

function positiveInteger(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function createRecurringRuleDraft(
  split: Pick<AdvancedRecurringSplitDefinition, 'category' | 'description' | 'kind'>,
  amountCents: number,
  startDate: string,
): RecurringRuleDraft {
  return {
    amount_cents: amountCents,
    category: split.category,
    day_of_month: dayOfMonth(startDate),
    description: split.description,
    frequency: 'monthly',
    is_active: true,
    kind: split.kind,
    next_run_date: startDate,
    notes: 'Created during priority setup.',
    skip_backdate: false,
    start_date: startDate,
  };
}

function pushAdvancedRecurringRules<Key extends string>(
  rules: RecurringRuleDraft[],
  startDate: string,
  definitions: readonly AdvancedRecurringSplitDefinition<Key>[],
  amounts: Record<Key, string>,
) {
  definitions.forEach((definition) => {
    const amountCents = positiveCents(amounts[definition.key]);
    if (!amountCents) return;

    rules.push(createRecurringRuleDraft(definition, amountCents, startDate));
  });
}

function recurringRulesForForm(form: OnboardingForm): RecurringRuleDraft[] {
  const startDate = form.recurringStartDate || today();
  const rules: RecurringRuleDraft[] = [];
  const monthlyIncomeCents = positiveCents(form.monthlyIncome);
  const monthlyExpenseCents = positiveCents(form.monthlyExpenses);

  if (form.recurringSetupMode === 'advanced') {
    pushAdvancedRecurringRules(
      rules,
      startDate,
      ADVANCED_INCOME_SPLITS,
      form.advancedIncomeAmounts,
    );
    pushAdvancedRecurringRules(
      rules,
      startDate,
      ADVANCED_EXPENSE_SPLITS,
      form.advancedExpenseAmounts,
    );
    return rules;
  }

  if (form.createRecurringIncomeRule && monthlyIncomeCents) {
    rules.push(
      createRecurringRuleDraft(
        {
          category: 'pay',
          description: 'Monthly income',
          kind: 'income',
        },
        monthlyIncomeCents,
        startDate,
      ),
    );
  }

  if (form.createRecurringExpenseRule && monthlyExpenseCents) {
    rules.push(
      createRecurringRuleDraft(
        {
          category: 'housing',
          description: 'Monthly essential bills',
          kind: 'expense',
        },
        monthlyExpenseCents,
        startDate,
      ),
    );
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

function targetAmountForReview(form: OnboardingForm): number | null {
  if (form.priorityType === 'emergency_fund') {
    const essentialsCents = positiveCents(form.monthlyEssentialExpenses);
    const targetMonths = positiveInteger(form.targetMonths);
    return essentialsCents && targetMonths ? essentialsCents * targetMonths : null;
  }

  if (form.priorityType === 'debt_payoff') {
    return positiveCents(form.debtBalance);
  }

  return positiveCents(form.targetAmount);
}

function currentAmountForReview(form: OnboardingForm): number | null {
  if (form.priorityType === 'debt_payoff') return 0;
  return positiveCents(form.currentAmount) ?? 0;
}

function monthlyContributionForReview(form: OnboardingForm): number | null {
  if (form.priorityType === 'debt_payoff') return positiveCents(form.debtMinimumPayment);
  return positiveCents(form.monthlyCommitment);
}

function currencyOrUnset(cents: number | null): string {
  return cents === null ? 'Not set yet' : centsToDisplay(cents);
}

function progressForReview(currentCents: number | null, targetCents: number | null): string {
  if (currentCents === null || !targetCents) return 'Needs target';
  return `${Math.min(100, Math.round((currentCents / targetCents) * 100))}%`;
}

function dashboardCardsForPriority(type: PriorityGoalType): string[] {
  if (type === 'debt_payoff') {
    return ['Active debt focus', 'Debt-free date', 'Interest pressure', 'Next payoff action'];
  }

  if (type === 'emergency_fund') {
    return ['Buffer progress', 'Months covered', 'Monthly gap', 'Next savings action'];
  }

  return ['Active goal', 'Progress percent', 'Target date', 'Next contribution action'];
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
  const isLastStep = stepIndex === 4;
  const totalSteps = 5;
  const isSubmitting =
    completeMutation.isPending ||
    createOnboardingSetupMutation.isPending ||
    createRecurringRuleMutation.isPending ||
    processRecurringRulesMutation.isPending ||
    recalculateGoalPlanMutation.isPending;

  function updateField<Key extends keyof OnboardingForm>(key: Key, value: OnboardingForm[Key]) {
    setClientError(null);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateAdvancedIncomeAmount(key: AdvancedIncomeSplitKey, value: string) {
    setClientError(null);
    setForm((current) => ({
      ...current,
      advancedIncomeAmounts: {
        ...current.advancedIncomeAmounts,
        [key]: value,
      },
    }));
  }

  function updateAdvancedExpenseAmount(key: AdvancedExpenseSplitKey, value: string) {
    setClientError(null);
    setForm((current) => ({
      ...current,
      advancedExpenseAmounts: {
        ...current.advancedExpenseAmounts,
        [key]: value,
      },
    }));
  }

  function updateRecurringSetupMode(mode: RecurringSetupMode) {
    setClientError(null);
    setForm((current) => {
      if (mode === 'quick') {
        return { ...current, recurringSetupMode: mode };
      }

      const shouldSeedIncome = !Object.values(current.advancedIncomeAmounts).some((value) =>
        value.trim(),
      );
      const shouldSeedExpenses = !Object.values(current.advancedExpenseAmounts).some((value) =>
        value.trim(),
      );

      return {
        ...current,
        advancedExpenseAmounts: shouldSeedExpenses
          ? {
              ...current.advancedExpenseAmounts,
              housing: current.monthlyExpenses,
            }
          : current.advancedExpenseAmounts,
        advancedIncomeAmounts: shouldSeedIncome
          ? {
              ...current.advancedIncomeAmounts,
              pay: current.monthlyIncome,
            }
          : current.advancedIncomeAmounts,
        recurringSetupMode: mode,
      };
    });
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

    const refetchedRules =
      recurringRulesQuery.data ?? (await recurringRulesQuery.refetch()).data ?? [];
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
  const reviewGoalName = form.goalName.trim() || selectedPriority;
  const reviewRecurringRules = recurringRulesForForm(form);
  const reviewTargetCents = targetAmountForReview(form);
  const reviewCurrentCents = currentAmountForReview(form);
  const reviewContributionCents = monthlyContributionForReview(form);
  const reviewCards = dashboardCardsForPriority(form.priorityType);

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
          {stepIndex === 4 ? <Check size={28} /> : null}
        </div>

        {stepIndex === 0 ? (
          <OnboardingStep
            eyebrow="Your cash flow"
            title="Your Cash Flow: how much you make and spend every month"
          >
            <p className="priority-step-why">
              This lets BudgetBuddy estimate your monthly gap before it builds a plan.
            </p>
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
              These numbers let BudgetBuddy estimate monthly capacity. You can optionally turn them
              into recurring rules before finishing setup.
            </p>
          </OnboardingStep>
        ) : null}

        {stepIndex === 1 ? (
          <OnboardingStep eyebrow="Top priority" title="Choose the first plan">
            <p className="priority-step-why">
              This tells BudgetBuddy which financial outcome to optimize first.
            </p>
            <div className="priority-option-grid">
              {PRIORITY_OPTIONS.map(({ body, Icon, label, type }) => (
                <button
                  key={type}
                  type="button"
                  className={
                    form.priorityType === type ? 'priority-option is-selected' : 'priority-option'
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
            <p className="priority-step-why">
              This turns the priority into a target, date, and monthly pace.
            </p>
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
              The starter plan is an educational scenario based on what you enter here. It does not
              provide financial, tax, mortgage, legal, debt-relief, or investment advice.
            </p>

            {clientError ? (
              <p className="priority-form-error" role="alert">
                {clientError}
              </p>
            ) : null}
          </OnboardingStep>
        ) : null}

        {stepIndex === 3 ? (
          <OnboardingStep eyebrow="Optional setup" title="Set up monthly money entries">
            <p className="priority-step-why">
              This gives your plan real income and expense entries to analyze.
            </p>

            <div className="recurring-mode-toggle" role="group" aria-label="Recurring setup depth">
              <button
                type="button"
                className={
                  form.recurringSetupMode === 'quick'
                    ? 'recurring-mode-option is-selected'
                    : 'recurring-mode-option'
                }
                aria-pressed={form.recurringSetupMode === 'quick'}
                onClick={() => updateRecurringSetupMode('quick')}
              >
                <strong>Skip advanced (recommended)</strong>
                <small>Use one income rule and one monthly bills rule.</small>
              </button>
              <button
                type="button"
                className={
                  form.recurringSetupMode === 'advanced'
                    ? 'recurring-mode-option is-selected'
                    : 'recurring-mode-option'
                }
                aria-pressed={form.recurringSetupMode === 'advanced'}
                onClick={() => updateRecurringSetupMode('advanced')}
              >
                <strong>Proceed with advanced split</strong>
                <small>Break income and expenses into clearer categories.</small>
              </button>
            </div>

            <div className="priority-form-grid">
              <label className="priority-form-field priority-form-field--wide">
                <span>First Occurrence</span>
                <input
                  type="date"
                  value={form.recurringStartDate}
                  onInput={(event) => updateField('recurringStartDate', event.currentTarget.value)}
                  onChange={(event) => updateField('recurringStartDate', event.currentTarget.value)}
                />
                <small>
                  Set this date prior to today to backdate monthly income and expenses so you have
                  previous transactions to analyze.
                </small>
              </label>

              {form.recurringSetupMode === 'quick' ? (
                <>
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
                      <small>
                        Create one monthly essential-bills rule from the expense baseline.
                      </small>
                    </span>
                  </label>
                </>
              ) : null}
            </div>

            {form.recurringSetupMode === 'advanced' ? (
              <div className="recurring-split-layout">
                <div className="recurring-split-group">
                  <h4>Income</h4>
                  <div className="recurring-split-list">
                    {ADVANCED_INCOME_SPLITS.map((split) => (
                      <label className="recurring-split-row" key={split.key}>
                        <span>
                          <strong>{split.label}</strong>
                          <small>{split.helper}</small>
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder={split.placeholder}
                          value={form.advancedIncomeAmounts[split.key]}
                          onChange={(event) =>
                            updateAdvancedIncomeAmount(split.key, event.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="recurring-split-group">
                  <h4>Expenses</h4>
                  <div className="recurring-split-list">
                    {ADVANCED_EXPENSE_SPLITS.map((split) => (
                      <label className="recurring-split-row" key={split.key}>
                        <span>
                          <strong>{split.label}</strong>
                          <small>{split.helper}</small>
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder={split.placeholder}
                          value={form.advancedExpenseAmounts[split.key]}
                          onChange={(event) =>
                            updateAdvancedExpenseAmount(split.key, event.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <p className="priority-form-note">
              Recurring rules live in Transactions and can be edited or deleted any time. Leave an
              advanced row blank to skip it, or keep the recommended quick setup for a faster start.
            </p>

            {clientError ? (
              <p className="priority-form-error" role="alert">
                {clientError}
              </p>
            ) : null}
          </OnboardingStep>
        ) : null}

        {stepIndex === 4 ? (
          <OnboardingStep eyebrow="Review" title="Review the plan before it is created">
            <p className="priority-step-why">
              This confirms what BudgetBuddy will create before anything is saved.
            </p>

            <div className="onboarding-review-grid">
              <article>
                <span>Active priority</span>
                <strong>{selectedPriority}</strong>
                <small>{reviewGoalName}</small>
              </article>
              <article>
                <span>Goal amount</span>
                <strong>{currencyOrUnset(reviewTargetCents)}</strong>
                <small>{progressForReview(reviewCurrentCents, reviewTargetCents)} funded</small>
              </article>
              <article>
                <span>Monthly pace</span>
                <strong>{currencyOrUnset(reviewContributionCents)}</strong>
                <small>
                  {form.targetDate ? `Target date: ${form.targetDate}` : 'No target date yet'}
                </small>
              </article>
            </div>

            <div className="onboarding-review-section">
              <h4>Recurring entries to create</h4>
              {reviewRecurringRules.length ? (
                <ul>
                  {reviewRecurringRules.map((rule) => (
                    <li key={`${rule.kind}-${rule.category}-${rule.description}`}>
                      <span>
                        {rule.kind === 'income' ? 'Income' : 'Expense'} -{' '}
                        {getCategoryLabel(rule.category)}
                      </span>
                      <strong>{centsToDisplay(rule.amount_cents)}</strong>
                      <small>
                        {rule.description}, monthly from {rule.start_date}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recurring entries selected. The starter plan will stay manual for now.</p>
              )}
            </div>

            <div className="onboarding-review-section">
              <h4>Dashboard cards you will see</h4>
              <ul>
                {reviewCards.map((card) => (
                  <li key={card}>
                    <span>{card}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="priority-form-note">
              After setup, start with Dashboard, then review Transactions, then open Analytics once
              transactions exist. BudgetBuddy will use those entries to turn your priority into next
              actions and progress momentum.
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
