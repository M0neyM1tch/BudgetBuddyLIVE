import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuickAddCards } from '../QuickAddCards';

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
});
