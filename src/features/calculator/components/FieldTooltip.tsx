import { Info, X } from 'lucide-react';
import { useState } from 'react';

type FieldTooltipProps = {
  content: string;
};

export function FieldTooltip({ content }: FieldTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="field-tooltip-wrap">
      <button
        type="button"
        className="field-tooltip-trigger"
        aria-label="More information"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Info size={14} aria-hidden="true" />
      </button>

      {isOpen ? (
        <span role="status" aria-live="polite" className="field-tooltip-popover">
          <span className="field-tooltip-content">{content}</span>
          <button
            type="button"
            className="field-tooltip-close"
            aria-label="Close"
            onClick={() => setIsOpen(false)}
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ) : null}
    </span>
  );
}
