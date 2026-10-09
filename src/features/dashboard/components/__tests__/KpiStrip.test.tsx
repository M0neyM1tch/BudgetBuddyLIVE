import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { KpiStrip } from '../KpiStrip';

describe('KpiStrip errors', () => {
  it('retains the fallback message and retry when no specific error message is available', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<KpiStrip error isLoading={false} onRetry={onRetry} />);
    expect(screen.getByRole('region', { name: 'Dashboard totals error' })).toHaveTextContent(
      'Try again before making decisions from this dashboard.',
    );
    expect(screen.queryByRole('region', { name: 'Dashboard totals' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
