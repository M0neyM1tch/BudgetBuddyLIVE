import type { Session, User } from '@supabase/supabase-js';

export type AuthMode = 'sign-in' | 'sign-up';

export type AuthCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = AuthCredentials & {
  acceptedTermsVersion: string;
};

export type AuthSignUpResult = {
  requiresEmailConfirmation: boolean;
};

export type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

export type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthSignUpResult>;
  signOut: () => Promise<void>;
};
