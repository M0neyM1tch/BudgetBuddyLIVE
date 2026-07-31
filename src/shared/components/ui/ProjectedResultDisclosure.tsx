import { Info, X } from 'lucide-react';
import { useId, useState } from 'react';
import './ProjectedResultDisclosure.css';

type ProjectedResultDisclosureProps = {
  className?: string;
  label?: string;
};

const DEFAULT_LABEL = 'Show projection estimate details';
const DISCLOSURE_COPY =
  'Projection based on the amounts and timing currently in your plan. It is an estimate, not a guarantee.';

export function ProjectedResultDisclosure({
  className,
  label = DEFAULT_LABEL,
}: ProjectedResultDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <span className={`projected-result-disclosure${className ? ` ${className}` : ''}`}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={label}
        className="projected-result-disclosure__trigger"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Info aria-hidden="true" size={14} />
      </button>
      {isOpen ? (
        <span className="projected-result-disclosure__panel" id={panelId} role="note">
          <span>{DISCLOSURE_COPY}</span>
          <button
            aria-label="Close projection estimate details"
            className="projected-result-disclosure__close"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            <X aria-hidden="true" size={12} />
          </button>
        </span>
      ) : null}
    </span>
  );
}
