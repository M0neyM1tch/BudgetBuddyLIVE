import { Pencil, Plus, RotateCcw, Zap } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { centsToDisplay } from '../../../shared/utils/currency';
import { DEFAULT_QUICK_ADD_CHIPS, getCategoryLabel } from '../constants/categories';
import type { QuickAddChip } from '../types/transactions.types';

type QuickAddCardsProps = {
  chips: QuickAddChip[];
  isLoading: boolean;
  isSaving: boolean;
  isCreating: boolean;
  feedback?: string;
  activePriorityName?: string | null;
  getChipIssue: (chip: QuickAddChip) => string | null;
  onFire: (chip: QuickAddChip) => void;
  onChoosePriority: () => void;
  onEdit: (chip: QuickAddChip) => void;
  onAdd: () => void;
  onReset: () => void;
};

export function QuickAddCards({
  chips,
  isLoading,
  isSaving,
  isCreating,
  feedback,
  activePriorityName,
  getChipIssue,
  onFire,
  onChoosePriority,
  onEdit,
  onAdd,
  onReset,
}: QuickAddCardsProps) {
  const visibleChips: QuickAddChip[] = isLoading
    ? []
    : chips.length > 0
      ? chips
      : [...DEFAULT_QUICK_ADD_CHIPS];

  return (
    <section className="quick-add-panel" aria-labelledby="quick-add-title">
      <div className="section-heading-row">
        <div>
          <h3 id="quick-add-title">Quick add</h3>
        </div>
        <div className="quick-add-actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading || isSaving}
            leftIcon={<Plus size={15} aria-hidden="true" />}
            onClick={onAdd}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading}
            isLoading={isSaving}
            leftIcon={<RotateCcw size={15} aria-hidden="true" />}
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="quick-add-grid" aria-busy={isLoading}>
        {isLoading ? <p className="quick-add-loading" role="status">Loading quick adds…</p> : null}
        {visibleChips.map((chip) => (
          <div key={chip.id} className={`quick-add-card quick-add-card--${chip.kind}`}>
            {(() => {
              const issue = getChipIssue(chip);
              const label =
                chip.target?.kind === 'active_priority' && chip.label === 'Active priority'
                  ? activePriorityName
                    ? `Add to ${activePriorityName}`
                    : 'Choose a priority'
                  : chip.label;

              return (
            <button
              type="button"
              className="quick-add-card-fire"
              disabled={isCreating || (Boolean(issue) && issue !== 'Choose a priority before using this quick add.')}
              onClick={() =>
                issue === 'Choose a priority before using this quick add.'
                  ? onChoosePriority()
                  : onFire(chip)
              }
            >
              <span className="quick-add-card-icon" aria-hidden="true">
                <Zap size={16} />
              </span>
              <span className="quick-add-card-copy">
                <strong>{label}</strong>
                <small>{issue ?? getCategoryLabel(chip.category)}</small>
              </span>
              <span className="quick-add-card-amount">{centsToDisplay(chip.amount_cents)}</span>
            </button>
              );
            })()}
            <button
              type="button"
              className="quick-add-card-edit"
              aria-label={`Edit ${chip.label}`}
              onClick={() => onEdit(chip)}
            >
              <Pencil size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      {feedback ? <p className="quick-add-feedback" role="status">{feedback}</p> : null}
    </section>
  );
}
