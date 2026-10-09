import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ProjectedResultDisclosure } from './ProjectedResultDisclosure';

describe('ProjectedResultDisclosure', () => {
  it('starts collapsed and supports touch, keyboard, and explicit close controls', async () => {
    const user = userEvent.setup();
    render(<ProjectedResultDisclosure />);

    const trigger = screen.getByRole('button', { name: 'Show projection estimate details' });
    const panelId = trigger.getAttribute('aria-controls');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('note')).not.toBeInTheDocument();

    await user.pointer({ keys: '[TouchA]', target: trigger });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('note')).toHaveAttribute('id', panelId ?? '');
    expect(screen.getByRole('note')).toHaveTextContent(
      'Projection based on the amounts and timing currently in your plan. It is an estimate, not a guarantee.',
    );

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Close projection estimate details' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
