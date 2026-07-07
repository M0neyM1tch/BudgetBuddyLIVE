const required = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const optional = (key: string): string | undefined => {
  const value = import.meta.env[key];
  return value || undefined;
};

const optionalBoolean = (key: string, fallback = false): boolean => {
  const value = optional(key);
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export const env = {
  supabase: {
    url: required('VITE_SUPABASE_URL'),
    publishableKey:
      optional('VITE_SUPABASE_PUBLISHABLE_KEY') ??
      optional('VITE_SUPABASE_ANON_KEY') ??
      required('VITE_SUPABASE_PUBLISHABLE_KEY'),
  },
  app: {
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    version: import.meta.env.VITE_APP_VERSION ?? '2.0.0',
  },
  features: {
    goalPacksEnabled: optionalBoolean('VITE_GOAL_PACKS_ENABLED'),
  },
} as const;
