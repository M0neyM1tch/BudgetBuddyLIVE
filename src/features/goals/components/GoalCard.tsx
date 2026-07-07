import { Archive, Calendar, Pencil, PlusCircle, RotateCcw, Trash2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { centsToDisplay } from '../../../shared/utils/currency';
import { formatDisplay } from '../../../shared/utils/dates';
import { getGoalStatusLabel } from '../../../shared/utils/finance';
import { getGoalIconOption } from '../constants/goalIcons';
import type { GoalWithProgress } from '../types/goals.types';
import { GoalProgressBar } from './GoalProgressBar';

type GoalCardProps = {
  goal: GoalWithProgress;
  isMutating: boolean;
  onAddFunds: (goal: GoalWithProgress) => void;
  onArchive: (goal: GoalWithProgress) => void;
  onDelete: (goal: GoalWithProgress) => void;
  onEdit: (goal: GoalWithProgress) => void;
  onRestore: (goal: GoalWithProgress) => void;
};

function daysLabel(daysRemaining: number | null): string {
  if (daysRemaining === null) return 'No target date';
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} overdue`;
  if (daysRemaining === 0) return 'Due today';
  return `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`;
}

export function GoalCard({
  goal,
  isMutating,
  onAddFunds,
  onArchive,
  onDelete,
  onEdit,
  onRestore,
}: GoalCardProps) {
  const color = goal.color ?? 'var(--color-primary)';
  const { Icon } = getGoalIconOption(goal.icon);

  return (
    <article
      className={`goal-card ${goal.is_archived ? 'is-archived' : ''}`}
      style={{ '--goal-color': color } as CSSProperties}
    >
      <div className="goal-card-header">
        <div className="goal-title-row">
          <span className="goal-icon-swatch" aria-hidden="true">
            <Icon size={18} aria-hidden="true" />
          </span>
          <div>
            <h3>{goal.name}</h3>
            <p className={`goal-status goal-status--${goal.status}`}>
              {getGoalStatusLabel(goal.status)}
            </p>
          </div>
        </div>
        <strong>{Math.round(goal.progress_pct)}%</strong>
      </div>

      <GoalProgressBar value={goal.progress_pct} color={color} />

      <dl className="goal-metrics">
        <div>
          <dt>Current</dt>
          <dd>{centsToDisplay(goal.current_amount_cents)}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>{centsToDisplay(goal.target_amount_cents)}</dd>
        </div>
        <div>
          <dt>Remaining</dt>
          <dd>{centsToDisplay(goal.amount_remaining_cents)}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd>
            <Calendar size={14} aria-hidden="true" />
            {goal.target_date ? formatDisplay(goal.target_date) : daysLabel(null)}
          </dd>
        </div>
      </dl>

      <p className="goal-days">{daysLabel(goal.days_remaining)}</p>

      <div className="goal-card-actions">
        {goal.is_archived ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isMutating}
            leftIcon={<RotateCcw size={15} aria-hidden="true" />}
            onClick={() => onRestore(goal)}
          >
            Restore
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            leftIcon={<PlusCircle size={15} aria-hidden="true" />}
            onClick={() => onAddFunds(goal)}
          >
            Add funds
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<Pencil size={15} aria-hidden="true" />}
          onClick={() => onEdit(goal)}
        >
          Edit
        </Button>
        {!goal.is_archived ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="goal-archive-button"
            leftIcon={<Archive size={15} aria-hidden="true" />}
            onClick={() => onArchive(goal)}
          >
            Archive
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="goal-delete-button"
          leftIcon={<Trash2 size={15} aria-hidden="true" />}
          onClick={() => onDelete(goal)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
