# BudgetBuddy V2 Security Baseline

## Supabase

- Start V2 on a fresh Supabase project.
- Keep the V1 database as a reference and migration source only.
- RLS must be enabled on every user-owned table.
- Use one policy per action per role.
- Use `(select auth.uid())` in RLS policies.
- Always include `WITH CHECK` for user-owned inserts and updates.
- Admin access must use a role table or custom claims, not hardcoded email addresses.
- Do not expose generic vault decryption RPCs in the `public` schema.

## Secrets

- Browser code may only use Supabase URL and publishable/anon keys.
- Service role keys live only in Supabase Edge Function secrets.
- Plaid access tokens are never stored in public tables as plaintext.
- Plaid token decryption happens only inside Edge Functions or private database functions with `EXECUTE` revoked from `anon` and `authenticated`.

## Edge Functions

- Require JWT verification by default.
- Validate HTTP method and request body.
- Scope service-role reads/writes by authenticated user id.
- Return safe public errors and log internal details server-side.
- Restrict CORS to known app domains before production.

## Launch Gates

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run build` passes.
- Supabase security advisors are clean or documented with accepted risk.
- Leaked password protection is enabled.
- Production environment variables are rotated and scoped.
