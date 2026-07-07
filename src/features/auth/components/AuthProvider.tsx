import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { queryClient } from '../../../shared/api/queryClient';
import { AuthContext } from '../AuthContext';
import {
  getCurrentSession,
  signInWithPassword,
  signOut as signOutRequest,
  signUpWithPassword,
  subscribeToAuthChanges,
} from '../api/auth.api';
import type {
  AuthContextValue,
  AuthCredentials,
  AuthState,
  SignUpCredentials,
} from '../types/auth.types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then((session) => {
        if (!isMounted) return;
        setState({
          session,
          user: session?.user ?? null,
          isLoading: false,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setState({
          session: null,
          user: null,
          isLoading: false,
        });
      });

    const subscription = subscribeToAuthChanges((event, session) => {
      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });

      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (credentials: AuthCredentials) => {
    const session = await signInWithPassword(credentials);
    setState({
      session,
      user: session?.user ?? null,
      isLoading: false,
    });
  }, []);

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    const session = await signUpWithPassword(credentials);
    setState({
      session,
      user: session?.user ?? null,
      isLoading: false,
    });

    return {
      requiresEmailConfirmation: !session,
    };
  }, []);

  const signOut = useCallback(async () => {
    await signOutRequest();
    queryClient.clear();
    setState({
      session: null,
      user: null,
      isLoading: false,
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.session),
      signIn,
      signUp,
      signOut,
    }),
    [signIn, signOut, signUp, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
