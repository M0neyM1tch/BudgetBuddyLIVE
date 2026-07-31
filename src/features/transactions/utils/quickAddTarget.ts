import type { QuickAddChip, TransactionDraft } from '../types/transactions.types';

type GoalWithDebtLink = {
  goal_type?: string;
  id: string;
  is_archived: boolean;
  name: string;
  linked_debt_id?: string | null;
};

type ActiveDebt = {
  id: string;
  is_archived: boolean;
  name: string;
};

export type QuickAddTargetResolution =
  | { status: 'resolved'; draft: Pick<TransactionDraft, 'kind' | 'category' | 'goal_id' | 'debt_id'>; label: string }
  | { status: 'missing_priority'; message: string }
  | { status: 'invalid_target'; message: string };

function resolveGoal(
  goal: GoalWithDebtLink | undefined,
  debts: ActiveDebt[],
): QuickAddTargetResolution {
  if (!goal || goal.is_archived) {
    return { status: 'invalid_target', message: 'This quick add target is no longer active. Edit the chip to choose another target.' };
  }

  if (goal.goal_type === 'debt_payoff' && !goal.linked_debt_id) {
    return {
      status: 'invalid_target',
      message: 'This debt priority no longer has an active linked debt. Review the priority before adding a payment.',
    };
  }

  if (goal.linked_debt_id) {
    const debt = debts.find((candidate) => candidate.id === goal.linked_debt_id && !candidate.is_archived);
    if (!debt) {
      return { status: 'invalid_target', message: 'This debt priority is no longer active. Edit the chip to choose another target.' };
    }
    return {
      status: 'resolved',
      draft: { kind: 'transfer', category: 'debt_payment', debt_id: debt.id, goal_id: null },
      label: debt.name,
    };
  }

  return {
    status: 'resolved',
    draft: { kind: 'transfer', category: 'savings', goal_id: goal.id, debt_id: null },
    label: goal.name,
  };
}

/** Resolves only RLS-loaded active records; the allocation RPC remains the final authority. */
export function resolveQuickAddTarget(
  chip: QuickAddChip,
  activeGoalId: string | null | undefined,
  goals: GoalWithDebtLink[],
  debts: ActiveDebt[],
): QuickAddTargetResolution {
  const target = chip.target;
  if (!target) {
    return {
      status: 'resolved',
      draft: { kind: chip.kind, category: chip.category, goal_id: null, debt_id: null },
      label: chip.category,
    };
  }

  if (target.kind === 'debt') {
    const debt = debts.find((candidate) => candidate.id === target.id && !candidate.is_archived);
    return debt
      ? { status: 'resolved', draft: { kind: 'transfer', category: 'debt_payment', debt_id: debt.id, goal_id: null }, label: debt.name }
      : { status: 'invalid_target', message: 'This quick add target is no longer active. Edit the chip to choose another target.' };
  }

  const goalId = target.kind === 'active_priority' ? activeGoalId : target.id;
  if (!goalId) {
    return target.kind === 'active_priority'
      ? { status: 'missing_priority', message: 'Choose a priority before using this quick add.' }
      : { status: 'invalid_target', message: 'This quick add target is no longer active. Edit the chip to choose another target.' };
  }

  return resolveGoal(goals.find((candidate) => candidate.id === goalId), debts);
}
