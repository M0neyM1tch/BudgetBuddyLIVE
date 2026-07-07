import type { ReactNode } from 'react';
import { Button } from './Button';
import './Tooltip.css';

type TooltipProps = {
  content: string;
  isOpen: boolean;
  children: ReactNode;
  onDismiss: () => void;
};

export function Tooltip({ content, isOpen, children, onDismiss }: TooltipProps) {
  return (
    <div className="tooltip-anchor">
      {children}
      {isOpen ? (
        <div className="tooltip-popover" role="note">
          <span>{content}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="tooltip-dismiss"
            aria-label="Dismiss tip"
            onClick={onDismiss}
          >
            Close
          </Button>
        </div>
      ) : null}
    </div>
  );
}
