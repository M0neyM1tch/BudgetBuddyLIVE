import type { ReactNode } from 'react';
import { Tooltip } from '../../../shared/components/ui/Tooltip';
import { useDismissTooltip, useOnboardingPreferences } from '../hooks/useOnboarding';

type OnboardingTooltipProps = {
  id: string;
  content: string;
  children: ReactNode;
};

export function OnboardingTooltip({ id, content, children }: OnboardingTooltipProps) {
  const preferencesQuery = useOnboardingPreferences();
  const { dismissTooltip } = useDismissTooltip();
  const isDismissed = preferencesQuery.data?.dismissed_tooltips.includes(id) ?? true;

  return (
    <Tooltip
      content={content}
      isOpen={!isDismissed}
      onDismiss={() => dismissTooltip(id)}
    >
      {children}
    </Tooltip>
  );
}

