import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuickAddCards } from '../QuickAddCards';
import { resolveQuickAddTarget } from '../../utils/quickAddTarget';
import type { QuickAddChip } from '../../types/transactions.types';

describe('QuickAddCards', () => {
  it('renders one quick-add landmark and one active-priority action', () => {
    render(
      <QuickAddCards
        chips={[{
          id: 'active-priority', label: 'Active priority', description: '', amount_cents: 10_000,
          kind: 'expense', category: 'savings', target: { kind: 'active_priority' },
        }]}
        isLoading={false}
        isSaving={false}
        isCreating={false}
        activePriorityName="Emergency fund"
        getChipIssue={() => null}
        getChipCategory={(chip) => chip.category}
        onFire={vi.fn()}
        onChoosePriority={vi.fn()}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('region', { name: 'Quick add' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /add to emergency fund/i })).toHaveLength(1);
  });

  it('preserves an edited label without changing the active-priority target', () => {
    render(
      <QuickAddCards
        chips={[{
          id: 'active-priority', label: 'Fund my plan', description: '', amount_cents: 12_500,
          kind: 'expense', category: 'savings', target: { kind: 'active_priority' },
        }]}
        isLoading={false}
        isSaving={false}
        isCreating={false}
        activePriorityName="Emergency fund"
        getChipIssue={() => null}
        getChipCategory={(chip) => chip.category}
        onFire={vi.fn()}
        onChoosePriority={vi.fn()}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText('Fund my plan')).toBeInTheDocument();
  });

  it('does not expose executable defaults while saved preferences are loading', () => {
    render(
      <QuickAddCards
        chips={[]}
        isLoading
        isSaving={false}
        isCreating={false}
        getChipIssue={() => null}
        getChipCategory={(chip) => chip.category}
        onFire={vi.fn()}
        onChoosePriority={vi.fn()}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText('Loading quick adds…')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /active priority/i })).not.toBeInTheDocument();
  });

  it.each([
    ['debt_payoff', 'debt-id', 'Debt payment'],
    ['emergency_fund', null, 'Savings'],
  ] as const)('shows the resolved %s allocation category rather than the stored chip default', (goalType, debtId, category) => {
    const chip: QuickAddChip = {
      id: 'priority', label: 'Active priority', description: '', amount_cents: 10_000,
      kind: 'expense', category: 'savings', target: { kind: 'active_priority' },
    };
    const goal = { id: 'goal-id', name: 'My plan', goal_type: goalType, linked_debt_id: debtId, is_archived: false };
    const debts = [{ id: 'debt-id', name: 'Card', is_archived: false }];
    render(<QuickAddCards
      chips={[chip]} isLoading={false} isSaving={false} isCreating={false}
      activePriorityName={goal.name} getChipIssue={() => null}
      getChipCategory={(current) => {
        const resolved = resolveQuickAddTarget(current, goal.id, [goal], debts);
        return resolved.status === 'resolved' ? resolved.draft.category : current.category;
      }}
      onFire={vi.fn()} onChoosePriority={vi.fn()} onEdit={vi.fn()} onAdd={vi.fn()} onReset={vi.fn()}
    />);
    expect(screen.getByRole('button', { name: /^Add to My plan/ })).toHaveTextContent(category);
    if (debtId) expect(screen.queryByText('Savings')).not.toBeInTheDocument();
  });
});
