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
  onFire: (chip: QuickAddChip) => void;
  onEdit: (chip: QuickAddChip) => void;
  onAdd: () => void;
  onReset: () => void;
};

export function QuickAddCards({
  chips,
  isLoading,
  isSaving,
  isCreating,
  onFire,
  onEdit,
  onAdd,
  onReset,
}: QuickAddCardsProps) {
  const visibleChips = chips.length > 0 ? chips : [...DEFAULT_QUICK_ADD_CHIPS];

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
            leftIcon={<Plus size={15} aria-hidden="true" />}
            onClick={onAdd}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            isLoading={isSaving}
            leftIcon={<RotateCcw size={15} aria-hidden="true" />}
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="quick-add-grid" aria-busy={isLoading}>
        {visibleChips.map((chip) => (
          <div key={chip.id} className={`quick-add-card quick-add-card--${chip.kind}`}>
            <button
              type="button"
              className="quick-add-card-fire"
              disabled={isCreating}
              onClick={() => onFire(chip)}
            >
              <span className="quick-add-card-icon" aria-hidden="true">
                <Zap size={16} />
              </span>
              <span className="quick-add-card-copy">
                <strong>{chip.label}</strong>
                <small>{getCategoryLabel(chip.category)}</small>
              </span>
              <span className="quick-add-card-amount">{centsToDisplay(chip.amount_cents)}</span>
            </button>
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
    </section>
  );
}
