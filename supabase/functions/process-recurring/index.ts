import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, preflight } from '../_shared/cors.ts';

type ProcessRecurringResponse = {
  created?: number;
  rules_advanced?: number;
  skipped_paused?: number;
  paused_names?: string[];
  limited?: boolean;
  through?: string;
};

function jsonResponse(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json',
    },
  });
}

function getServiceRoleKey(): string | null {
  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacyKey) return legacyKey;

  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (!secretKeys) return null;

  try {
    const parsed = JSON.parse(secretKeys) as Record<string, string | undefined>;
    return parsed.default ?? null;
  } catch {
    return null;
  }
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization') ?? '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);

  if (req.method !== 'POST') {
    return jsonResponse(req, 405, { error: 'Method not allowed' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('process-recurring missing Supabase service configuration');
    return jsonResponse(req, 500, { error: 'Recurring processor is not configured.' });
  }

  const token = getBearerToken(req);
  if (!token) {
    return jsonResponse(req, 401, { error: 'Unauthorized' });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await serviceClient.auth.getUser(token);

  if (userError || !user) {
    return jsonResponse(req, 401, { error: 'Unauthorized' });
  }

  let throughDate: string | undefined;

  try {
    const body = (await req.json().catch(() => ({}))) as { through_date?: unknown };
    if (typeof body.through_date === 'string') {
      if (!isIsoDate(body.through_date)) {
        return jsonResponse(req, 400, { error: 'through_date must use YYYY-MM-DD format.' });
      }

      throughDate = body.through_date;
    }
  } catch {
    return jsonResponse(req, 400, { error: 'Invalid request body.' });
  }

  const { data, error } = await serviceClient.rpc('process_due_recurring_rules', {
    p_user_id: user.id,
    ...(throughDate ? { p_through: throughDate } : {}),
  });

  if (error) {
    console.error('process-recurring RPC failed', error.message);
    return jsonResponse(req, 500, { error: 'Unable to process recurring transactions.' });
  }

  const result = (data ?? {}) as ProcessRecurringResponse;

  return jsonResponse(req, 200, {
    created: result.created ?? 0,
    rules_advanced: result.rules_advanced ?? 0,
    skipped_paused: result.skipped_paused ?? 0,
    paused_names: result.paused_names ?? [],
    limited: result.limited ?? false,
    through: result.through ?? throughDate ?? null,
  });
});
