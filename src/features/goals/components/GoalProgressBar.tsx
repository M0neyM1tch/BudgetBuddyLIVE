import { useEffect, useRef } from 'react';

type GoalProgressBarProps = {
  value: number;
  color?: string | null;
};

export function GoalProgressBar({ value, color }: GoalProgressBarProps) {
  const progress = Math.min(100, Math.max(0, value));
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fill.style.width = `${progress}%`;
      return;
    }

    let secondFrame = 0;
    fill.style.width = '0%';
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        fill.style.width = `${progress}%`;
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [progress]);

  return (
    <div
      className="goal-progress"
      aria-label={`Goal progress ${Math.round(progress)} percent`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      role="progressbar"
    >
      <span
        ref={fillRef}
        style={{
          background: color ?? 'var(--color-primary)',
          width: '0%',
        }}
      />
    </div>
  );
}
