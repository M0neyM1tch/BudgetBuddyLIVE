const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedPreviewOriginSuffixes = (
  Deno.env.get('ALLOWED_PREVIEW_ORIGIN_SUFFIXES') ??
  '.budgetbuddy-960.pages.dev,.budgetbuddy-v2.pages.dev'
)
  .split(',')
  .map((suffix) => suffix.trim().toLowerCase())
  .filter(Boolean);

const runtimeEnvironment = (
  Deno.env.get('APP_ENV') ??
  Deno.env.get('ENVIRONMENT') ??
  Deno.env.get('DENO_ENV') ??
  'development'
).toLowerCase();
const isProductionRuntime = runtimeEnvironment === 'production' || runtimeEnvironment === 'prod';

function isAllowedPreviewOrigin(origin: string): boolean {
  if (!origin || allowedPreviewOriginSuffixes.length === 0) return false;

  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:') return false;

    const hostname = url.hostname.toLowerCase();
    return allowedPreviewOriginSuffixes.some((suffix) => {
      const apex = suffix.replace(/^\./, '');
      return hostname === apex || hostname.endsWith(suffix);
    });
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.includes(origin) || isAllowedPreviewOrigin(origin);
}

export function corsHeaders(req: Request): HeadersInit {
  if (allowedOrigins.length === 0 && isProductionRuntime) {
    throw new Error('ALLOWED_ORIGINS must be configured for production Edge Functions.');
  }

  const origin = req.headers.get('Origin') ?? '';
  const allowOrigin =
    allowedOrigins.length === 0 || isAllowedOrigin(origin)
      ? origin || allowedOrigins[0] || 'http://localhost:5173'
      : allowedOrigins[0] || 'http://localhost:5173';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

export function preflight(req: Request) {
  return new Response('ok', { headers: corsHeaders(req) });
}
