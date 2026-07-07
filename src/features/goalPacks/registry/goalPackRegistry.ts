import {
  DEFERRED_GOAL_PACK_TYPES,
  GOAL_TYPES,
  MVP_GOAL_PACK_TYPES,
  type GoalPackDefinition,
  type GoalPackRegistry,
  type GoalType,
  type MvpGoalPackType,
} from '../types/goalPacks.types';

const commonDashboardCards = [
  'activeGoalHero',
  'goalProgress',
  'planConfidence',
  'nextAction',
  'planDrivers',
  'recentTransactions',
] as const;

export const GOAL_PACK_REGISTRY: GoalPackRegistry = {
  emergency_fund: {
    type: 'emergency_fund',
    label: 'Emergency Fund',
    description: 'Build a cash buffer for essential expenses and surprise costs.',
    lifecycle: 'mvp',
    requiredInputs: [
      {
        key: 'monthly_essential_expenses_cents',
        label: 'Monthly essentials',
        type: 'money',
        required: true,
      },
      {
        key: 'current_amount_cents',
        label: 'Current buffer',
        type: 'money',
        required: true,
      },
      {
        key: 'target_months',
        label: 'Target months',
        type: 'integer',
        required: true,
      },
    ],
    optionalInputs: [
      {
        key: 'monthly_commitment_cents',
        label: 'Monthly contribution',
        type: 'money',
        required: false,
      },
    ],
    dashboardCards: [...commonDashboardCards, 'supportingGuardrail', 'laterGoals'],
    calculators: ['contributionChange', 'dateChange', 'categoryCutImpact', 'surplusAllocation'],
    planningRules: [
      'cashFlowCapacity',
      'requiredMonthlyContribution',
      'projectedCompletionDate',
      'confidenceScore',
    ],
    actionRules: ['set_recurring_contribution', 'confirm_contribution', 'review_spending_leak'],
    riskCopy: 'Emergency fund projections are estimates based on user-entered expenses and savings behavior.',
  },
  debt_payoff: {
    type: 'debt_payoff',
    label: 'Debt Payoff',
    description: 'Compare common payoff methods and model extra cash against debt pressure.',
    lifecycle: 'mvp',
    requiredInputs: [
      {
        key: 'debt_scope',
        label: 'Debt focus',
        type: 'select',
        required: true,
      },
      {
        key: 'extra_payment_cents',
        label: 'Extra monthly payment',
        type: 'money',
        required: true,
      },
    ],
    optionalInputs: [
      {
        key: 'preferred_method',
        label: 'Preferred method',
        type: 'select',
        helperText: 'Compare avalanche and snowball as scenarios, not prescriptions.',
        required: false,
      },
    ],
    dashboardCards: [...commonDashboardCards, 'supportingGuardrail', 'laterGoals'],
    calculators: ['debtPayoffComparison', 'contributionChange', 'dateChange'],
    planningRules: [
      'cashFlowCapacity',
      'projectedCompletionDate',
      'confidenceScore',
      'debtMethodComparison',
    ],
    actionRules: ['select_debt_method', 'confirm_contribution', 'review_spending_leak'],
    riskCopy: 'Debt payoff ordering is educational scenario planning, not financial, credit, lending, or debt-relief advice.',
  },
  major_purchase: {
    type: 'major_purchase',
    label: 'Major Purchase / Home Fund',
    description: 'Turn a large savings target into a date, gap, and monthly plan.',
    lifecycle: 'mvp',
    requiredInputs: [
      {
        key: 'target_amount_cents',
        label: 'Target amount',
        type: 'money',
        required: true,
      },
      {
        key: 'current_amount_cents',
        label: 'Current savings',
        type: 'money',
        required: true,
      },
    ],
    optionalInputs: [
      {
        key: 'target_date',
        label: 'Target date',
        type: 'date',
        required: false,
      },
      {
        key: 'monthly_commitment_cents',
        label: 'Monthly contribution',
        type: 'money',
        required: false,
      },
    ],
    dashboardCards: [...commonDashboardCards, 'supportingGuardrail', 'laterGoals'],
    calculators: ['contributionChange', 'dateChange', 'targetChange', 'categoryCutImpact'],
    planningRules: [
      'cashFlowCapacity',
      'requiredMonthlyContribution',
      'projectedCompletionDate',
      'confidenceScore',
    ],
    actionRules: ['set_recurring_contribution', 'confirm_contribution', 'refine_missing_target'],
    riskCopy: 'Major purchase and home-fund timelines are estimates based on target amount, savings, and contribution assumptions; they do not assess mortgage approval, tax treatment, or legal readiness.',
  },
  home_fund: {
    type: 'home_fund',
    label: 'Home Fund',
    description: 'A future country-aware home savings pack built on the major purchase engine.',
    lifecycle: 'deferred',
    requiredInputs: [],
    optionalInputs: [],
    dashboardCards: [...commonDashboardCards, 'supportingGuardrail', 'laterGoals'],
    calculators: ['contributionChange', 'dateChange', 'targetChange'],
    planningRules: [
      'cashFlowCapacity',
      'requiredMonthlyContribution',
      'projectedCompletionDate',
      'confidenceScore',
    ],
    actionRules: ['set_recurring_contribution', 'confirm_contribution', 'refine_missing_target'],
    riskCopy: 'Home fund planning is an estimate only and does not assess mortgage approval, tax treatment, legal readiness, account eligibility, or investment suitability.',
  },
  custom: {
    type: 'custom',
    label: 'Custom Goal',
    description: 'Clarify vague goals into a target, timeline, and next action.',
    lifecycle: 'mvp',
    requiredInputs: [
      {
        key: 'name',
        label: 'Goal name',
        type: 'text',
        required: true,
      },
    ],
    optionalInputs: [
      {
        key: 'target_amount_cents',
        label: 'Target amount',
        type: 'money',
        required: false,
      },
      {
        key: 'target_date',
        label: 'Target date',
        type: 'date',
        required: false,
      },
    ],
    dashboardCards: [...commonDashboardCards, 'laterGoals'],
    calculators: ['contributionChange', 'dateChange', 'targetChange'],
    planningRules: ['requiredMonthlyContribution', 'projectedCompletionDate', 'confidenceScore'],
    actionRules: ['refine_missing_target', 'confirm_contribution'],
    riskCopy: 'Custom goal guidance is only as reliable as the target and timeline the user provides.',
  },
  retirement: {
    type: 'retirement',
    label: 'Retirement',
    description: 'Deferred long-term planning pack for age, horizon, and wealth assumptions.',
    lifecycle: 'deferred',
    requiredInputs: [],
    optionalInputs: [],
    dashboardCards: [...commonDashboardCards, 'supportingGuardrail', 'laterGoals'],
    calculators: ['contributionChange', 'dateChange'],
    planningRules: ['cashFlowCapacity', 'projectedCompletionDate', 'confidenceScore'],
    actionRules: ['refine_missing_target', 'set_recurring_contribution'],
    riskCopy: 'Retirement projections require careful non-advice language and conservative assumptions.',
  },
  general_savings: {
    type: 'general_savings',
    label: 'General Savings',
    description: 'Deferred pack for low-specificity savings goals.',
    lifecycle: 'deferred',
    requiredInputs: [],
    optionalInputs: [],
    dashboardCards: [...commonDashboardCards],
    calculators: ['contributionChange', 'dateChange', 'targetChange'],
    planningRules: ['requiredMonthlyContribution', 'projectedCompletionDate', 'confidenceScore'],
    actionRules: ['refine_missing_target', 'confirm_contribution'],
    riskCopy: 'General savings plans should push users toward clearer targets before making strong projections.',
  },
  bill_reliability: {
    type: 'bill_reliability',
    label: 'Bill Reliability',
    description: 'Deferred pack for upcoming bills, due-date risk, and cash buffer timing.',
    lifecycle: 'deferred',
    requiredInputs: [],
    optionalInputs: [],
    dashboardCards: [...commonDashboardCards, 'supportingGuardrail'],
    calculators: ['categoryCutImpact', 'surplusAllocation'],
    planningRules: ['cashFlowCapacity', 'confidenceScore'],
    actionRules: ['review_spending_leak', 'confirm_contribution'],
    riskCopy: 'Bill reliability outputs are reminders and estimates, not guarantees of payment success.',
  },
};

export function isGoalType(value: string): value is GoalType {
  return GOAL_TYPES.includes(value as GoalType);
}

export function isMvpGoalPackType(value: GoalType): value is MvpGoalPackType {
  return MVP_GOAL_PACK_TYPES.includes(value as MvpGoalPackType);
}

export function getGoalPackDefinition(type: GoalType): GoalPackDefinition {
  return GOAL_PACK_REGISTRY[type];
}

export function getMvpGoalPackDefinitions(): GoalPackDefinition[] {
  return MVP_GOAL_PACK_TYPES.map((type) => GOAL_PACK_REGISTRY[type]);
}

export function getDeferredGoalPackDefinitions(): GoalPackDefinition[] {
  return DEFERRED_GOAL_PACK_TYPES.map((type) => GOAL_PACK_REGISTRY[type]);
}
