import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: vi.fn(function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    }),
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: vi.fn(function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    }),
  });
});

afterEach(() => {
  cleanup();
  for (const [method, descriptor] of [
    ['showModal', originalShowModal],
    ['close', originalClose],
  ] as const) {
    if (descriptor) {
      Object.defineProperty(HTMLDialogElement.prototype, method, descriptor);
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, method);
    }
  }
});

describe('Modal accessible names', () => {
  it('uses its own current title when a different closed dialog is mounted first', () => {
    const onClose = vi.fn();
    const dialogs = (title: string) => (
      <>
        <Modal isOpen={false} title="Delete transaction" onClose={onClose}>
          Delete confirmation
        </Modal>
        <Modal isOpen title={title} onClose={onClose}>
          Rule form
        </Modal>
      </>
    );
    const { rerender } = render(dialogs('Add recurring rule'));

    const openDialog = screen.getByRole('dialog', { name: 'Add recurring rule' });
    expect(openDialog).toHaveAttribute('open');
    expect(screen.queryByRole('dialog', { name: 'Delete transaction' })).not.toBeInTheDocument();

    rerender(dialogs('Edit recurring rule'));
    expect(screen.getByRole('dialog', { name: 'Edit recurring rule' })).toBe(openDialog);
    expect(screen.queryByRole('dialog', { name: 'Add recurring rule' })).not.toBeInTheDocument();
  });
});
