import { CalendarClock, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { centsToDisplay } from '../../../shared/utils/currency';
import { formatDisplay } from '../../../shared/utils/dates';
import {
  getCategoryLabel,
  getFrequencyLabel,
} from '../constants/categories';
import type { RecurringRule } from '../types/transactions.types';

type RecurringRulesPanelProps = {
  debtLabels: Record<string, string>;
  rules: RecurringRule[];
  isLoading: boolean;
  isToggling: boolean;
  isDeleting: boolean;
  processMessage?: string;
  onAdd: () => void;
  onEdit: (rule: RecurringRule) => void;
  onDelete: (rule: RecurringRule) => void;
  onToggle: (rule: RecurringRule) => void;
};

export function RecurringRulesPanel({
  debtLabels,
  rules,
  isLoading,
  isToggling,
  isDeleting,
  processMessage,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: RecurringRulesPanelProps) {
  return (
    <section className="recurring-panel" aria-labelledby="recurring-title">
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">Automation setup</p>
          <h3 id="recurring-title">Recurring rules</h3>
        </div>
        <div className="recurring-panel-actions">
          <Button
            type="button"
            size="sm"
            leftIcon={<Plus size={15} aria-hidden="true" />}
            onClick={onAdd}
          >
            Add rule
          </Button>
        </div>
      </div>

      {processMessage ? <p className="recurring-process-message">{processMessage}</p> : null}

      {isLoading ? (
        <div className="recurring-rule-list" aria-label="Loading recurring rules">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="recurring-rule-card recurring-rule-card--skeleton" key={index}>
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="recurring-empty">
          <CalendarClock size={22} aria-hidden="true" />
          <p>No recurring rules yet.</p>
        </div>
      ) : (
        <div className="recurring-rule-list">
          {rules.map((rule) => {
            const linkedDebtName = rule.debt_id ? debtLabels[rule.debt_id] : undefined;
            const label = linkedDebtName ?? getCategoryLabel(rule.category);

            return (
              <article
                className={`recurring-rule-card ${!rule.is_active ? 'is-paused' : ''}`}
                key={rule.id}
              >
                <div className="recurring-rule-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    isLoading={isToggling}
                    leftIcon={<Power size={15} aria-hidden="true" />}
                    onClick={() => onToggle(rule)}
                  >
                    {rule.is_active ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    leftIcon={<Pencil size={15} aria-hidden="true" />}
                    onClick={() => onEdit(rule)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="transaction-delete-button"
                    isLoading={isDeleting}
                    leftIcon={<Trash2 size={15} aria-hidden="true" />}
                    onClick={() => onDelete(rule)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="recurring-rule-main">
                  <div className="recurring-rule-header">
                    <span className={`recurring-rule-status ${rule.is_active ? 'is-active' : ''}`}>
                      {rule.is_active ? 'Active' : 'Paused'}
                    </span>
                    <strong className={`transaction-amount transaction-amount--${rule.kind}`}>
                      {rule.kind === 'income' ? '+' : '-'}
                      {centsToDisplay(rule.amount_cents)}
                    </strong>
                  </div>
                  <h4>{rule.description || label}</h4>
                  <p>
                    {getFrequencyLabel(rule.frequency)} - {label} - Next{' '}
                    {formatDisplay(rule.next_run_date)}
                  </p>
                  {rule.notes ? <p className="recurring-rule-notes">{rule.notes}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
