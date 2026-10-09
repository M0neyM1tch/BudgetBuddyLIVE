import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  onClose: () => void;
};

export function Modal({
  isOpen,
  title,
  children,
  className,
  footer,
  onClose,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={className ? `modal ${className}` : 'modal'}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="modal-header">
        <h2 id={titleId} className="modal-title">
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          Close
        </Button>
      </div>
      <div className="modal-body">{children}</div>
      {footer ? <div className="modal-footer">{footer}</div> : null}
    </dialog>
  );
}
