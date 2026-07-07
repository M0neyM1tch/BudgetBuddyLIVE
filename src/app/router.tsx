import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../features/auth/components/RequireAuth';
import { LandingPage } from '../features/auth/pages/LandingPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { AppShell } from '../shared/components/layout/AppShell';
import {
  AnalyticsRoute,
  CalculatorRoute,
  ConfirmEmailRoute,
  DashboardRoute,
  DebtsRoute,
  ForgotPasswordRoute,
  GoalsRoute,
  NotFoundRoute,
  PreferencesRoute,
  PrivacyRoute,
  ResetPasswordRoute,
  TermsRoute,
  TransactionsRoute,
} from './routeElements';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/terms', element: <TermsRoute /> },
  { path: '/privacy', element: <PrivacyRoute /> },
  { path: '/legal/terms', element: <TermsRoute /> },
  { path: '/legal/privacy', element: <PrivacyRoute /> },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardRoute /> },
      { path: 'transactions', element: <TransactionsRoute /> },
      { path: 'analytics', element: <AnalyticsRoute /> },
      { path: 'goals', element: <GoalsRoute /> },
      { path: 'debts', element: <DebtsRoute /> },
      { path: 'calculator', element: <CalculatorRoute /> },
      { path: 'preferences', element: <PreferencesRoute /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <LoginPage /> },
  { path: '/signup/confirm-email', element: <ConfirmEmailRoute /> },
  { path: '/forgot-password', element: <ForgotPasswordRoute /> },
  { path: '/reset-password', element: <ResetPasswordRoute /> },
  { path: '*', element: <NotFoundRoute /> },
]);
