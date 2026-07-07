import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: 'sm' | 'md' | 'lg';
};

export function Card({
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div className={clsx('card', `card--pad-${padding}`, className)} {...props}>
      {children}
    </div>
  );
}
