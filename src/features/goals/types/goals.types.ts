import type { Tables, TablesInsert, TablesUpdate } from '../../../types/database.types';
import type { GoalStatus } from '../../../shared/utils/finance';
import type { Transaction } from '../../transactions';

export type Goal = Tables<'goals'>;
export type GoalInsert = TablesInsert<'goals'>;
export type GoalUpdate = TablesUpdate<'goals'>;

export type GoalDraft = {
  name: string;
  color: string | null;
  icon: string;
  target_amount_cents: number;
  starting_balance_cents: number;
  target_date: string | null;
};

export type GoalWithProgress = Goal & {
  amount_remaining_cents: number;
  days_remaining: number | null;
  progress_pct: number;
  status: GoalStatus;
};

export type GoalContributionDraft = {
  goal_id: string;
  amount_cents: number;
  transaction_date: string;
  description: string;
  notes: string | null;
};

export type GoalContributionResult = {
  goal: Goal;
  transaction: Transaction;
};

export type GoalSummary = {
  activeCount: number;
  completedCount: number;
  onTrackCount: number;
  totalCurrentCents: number;
  totalTargetCents: number;
};
