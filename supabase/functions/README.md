# Edge Functions

BudgBeacon Edge Functions hold privileged logic only:

- recurring transaction processing
- Plaid token exchange and transaction sync
- future recommendation orchestration
- future billing webhooks

Rules:

- JWT verification is required by default.
- Service role keys are only read from Edge Function secrets.
- Vault secrets are never exposed through public RPCs.
- Function errors returned to clients must be safe and generic.
