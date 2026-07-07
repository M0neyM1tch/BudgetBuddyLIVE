import { lazy, Suspense, type ReactNode } from 'react';
import { LoadingState } from '../shared/components/feedback/LoadingState';

const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);

const TransactionsPage = lazy(() =>
  import('../features/transactions/pages/TransactionsPage').then((module) => ({
    default: module.TransactionsPage,
  })),
);

const AnalyticsPage = lazy(() =>
  import('../features/analytics/pages/AnalyticsPage').then((module) => ({
    default: module.AnalyticsPage,
  })),
);

const GoalsPage = lazy(() =>
  import('../features/goals/pages/GoalsPage').then((module) => ({
    default: module.GoalsPage,
  })),
);

const DebtsPage = lazy(() =>
  import('../features/debts/pages/DebtsPage').then((module) => ({
    default: module.DebtsPage,
  })),
);

const CalculatorPage = lazy(() =>
  import('../features/calculator/pages/CalculatorPage').then((module) => ({
    default: module.CalculatorPage,
  })),
);

const PreferencesPage = lazy(() =>
  import('../features/preferences/pages/PreferencesPage').then((module) => ({
    default: module.PreferencesPage,
  })),
);

const LegalPage = lazy(() =>
  import('../features/legal/pages/LegalPage').then((module) => ({
    default: module.LegalPage,
  })),
);

const ConfirmEmailPage = lazy(() =>
  import('../features/auth/pages/ConfirmEmailPage').then((module) => ({
    default: module.ConfirmEmailPage,
  })),
);

const ForgotPasswordPage = lazy(() =>
  import('../features/auth/pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);

const ResetPasswordPage = lazy(() =>
  import('../features/auth/pages/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  })),
);

const NotFoundPage = lazy(() =>
  import('../features/errors/pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
);

function RouteBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>;
}

export function DashboardRoute() {
  return (
    <RouteBoundary>
      <DashboardPage />
    </RouteBoundary>
  );
}

export function TransactionsRoute() {
  return (
    <RouteBoundary>
      <TransactionsPage />
    </RouteBoundary>
  );
}

export function AnalyticsRoute() {
  return (
    <RouteBoundary>
      <AnalyticsPage />
    </RouteBoundary>
  );
}

export function GoalsRoute() {
  return (
    <RouteBoundary>
      <GoalsPage />
    </RouteBoundary>
  );
}

export function DebtsRoute() {
  return (
    <RouteBoundary>
      <DebtsPage />
    </RouteBoundary>
  );
}

export function CalculatorRoute() {
  return (
    <RouteBoundary>
      <CalculatorPage />
    </RouteBoundary>
  );
}

export function PreferencesRoute() {
  return (
    <RouteBoundary>
      <PreferencesPage />
    </RouteBoundary>
  );
}

export function TermsRoute() {
  return (
    <RouteBoundary>
      <LegalPage kind="terms" />
    </RouteBoundary>
  );
}

export function PrivacyRoute() {
  return (
    <RouteBoundary>
      <LegalPage kind="privacy" />
    </RouteBoundary>
  );
}

export function ConfirmEmailRoute() {
  return (
    <RouteBoundary>
      <ConfirmEmailPage />
    </RouteBoundary>
  );
}

export function ForgotPasswordRoute() {
  return (
    <RouteBoundary>
      <ForgotPasswordPage />
    </RouteBoundary>
  );
}

export function ResetPasswordRoute() {
  return (
    <RouteBoundary>
      <ResetPasswordPage />
    </RouteBoundary>
  );
}

export function NotFoundRoute() {
  return (
    <RouteBoundary>
      <NotFoundPage />
    </RouteBoundary>
  );
}
