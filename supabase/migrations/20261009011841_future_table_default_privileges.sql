-- The historical CRUD-only revoke left future TRUNCATE/REFERENCES/TRIGGER/MAINTAIN grants.
-- Restrict future postgres-owned public tables; existing table ACLs are unchanged.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated, service_role;
