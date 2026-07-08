import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../../../shared/lib/supabase';
import type { AuthCredentials, SignUpCredentials } from '../types/auth.types';

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithPassword(credentials: AuthCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;
  return data.session;
}

export async function signUpWithPassword(credentials: SignUpCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        accepted_terms_accepted: true,
        accepted_terms_version: credentials.acceptedTermsVersion,
      },
    },
  });

  if (error) throw error;
  return data.session;
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function clearLocalSession() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange(callback).data.subscription;
}
