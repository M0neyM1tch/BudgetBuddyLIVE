import type { ComponentType, SVGProps } from 'react';
import {
  AnalyticsIcon,
  CalculatorIcon,
  DashboardIcon,
  DebtsIcon,
  GoalsIcon,
  PreferencesIcon,
  TransactionsIcon,
} from './navIcons';

export type ShellNavItem = {
  to: string;
  label: string;
  mobileLabel: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const SHELL_NAV_ITEMS: ShellNavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    mobileLabel: 'Home',
    description: 'Overview',
    Icon: DashboardIcon,
  },
  {
    to: '/dashboard/transactions',
    label: 'Transactions',
    mobileLabel: 'Txns',
    description: 'Income and spending',
    Icon: TransactionsIcon,
  },
  {
    to: '/dashboard/analytics',
    label: 'Analytics',
    mobileLabel: 'Charts',
    description: 'Insights',
    Icon: AnalyticsIcon,
  },
  {
    to: '/dashboard/goals',
    label: 'Goals',
    mobileLabel: 'Goals',
    description: 'Savings targets',
    Icon: GoalsIcon,
  },
  {
    to: '/dashboard/debts',
    label: 'Debts',
    mobileLabel: 'Debts',
    description: 'Payoff planning',
    Icon: DebtsIcon,
  },
  {
    to: '/dashboard/calculator',
    label: 'Calculator',
    mobileLabel: 'Calc',
    description: 'Financial tools',
    Icon: CalculatorIcon,
  },
  {
    to: '/dashboard/preferences',
    label: 'Preferences',
    mobileLabel: 'Prefs',
    description: 'Guided setup',
    Icon: PreferencesIcon,
  },
];
