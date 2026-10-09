-- A schema-level REVOKE cannot remove PostgreSQL's global PUBLIC EXECUTE default.
-- Restrict only future postgres-owned functions across schemas; existing ACLs
-- remain unchanged. New callable RPCs must receive explicit execution grants.
alter default privileges for role postgres revoke execute on functions from public;
