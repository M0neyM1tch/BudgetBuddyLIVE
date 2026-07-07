import { centsToDisplay } from '../../../shared/utils/currency';
import { getCategoryLabel, getFrequencyLabel } from '../../transactions';
import type { RecurringCostRow } from '../types/calculator.types';

type RecurringCostTableProps = {
  rows: RecurringCostRow[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function RecurringCostTable({ rows, selectedIds, onToggle }: RecurringCostTableProps) {
  return (
    <div className="calculator-table-wrap">
      <table className="calculator-table">
        <thead>
          <tr>
            <th>Model</th>
            <th>Item</th>
            <th>Category</th>
            <th>Monthly</th>
            <th>Annual</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <input
                  aria-label={`Model cancelling ${row.description}`}
                  checked={selectedIds.has(row.id)}
                  type="checkbox"
                  onChange={() => onToggle(row.id)}
                />
              </td>
              <td>
                <strong>{row.description}</strong>
                <span>{getFrequencyLabel(row.frequency)}</span>
              </td>
              <td>
                {getCategoryLabel(row.category)}
                {row.isLikelySubscription ? <span>Subscription-like</span> : null}
              </td>
              <td>{centsToDisplay(row.monthlyCents)}</td>
              <td>{centsToDisplay(row.annualCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
