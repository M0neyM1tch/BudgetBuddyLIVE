import { useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../../auth/hooks/useAuth';

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function firstNameFromUser(user: User | null): string | null {
  if (!user) return null;

  const metadata = user.user_metadata as Record<string, unknown>;
  const metadataName = [metadata.display_name, metadata.full_name, metadata.name].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );
  const fallbackName = user.email?.split('@')[0];
  const name = metadataName ?? fallbackName;

  return name?.trim().split(/\s+/)[0] ?? null;
}

export function DashboardGreeting() {
  const { user } = useAuth();
  const now = useMemo(() => new Date(), []);
  const firstName = firstNameFromUser(user);
  const greeting = greetingForHour(now.getHours());
  const dateLabel = new Intl.DateTimeFormat('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  return (
    <header className="dashboard-greeting">
      <div>
        <p className="page-kicker">Financial overview</p>
        <h2 id="dashboard-title" className="page-title">
          {greeting}
          {firstName ? `, ${firstName}` : ''}
        </h2>
        <p className="page-description">
          {dateLabel}. Your cash flow, goals, debts, and recent activity in one focused view.
        </p>
      </div>
    </header>
  );
}
