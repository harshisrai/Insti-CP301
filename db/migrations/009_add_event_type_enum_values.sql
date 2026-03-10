-- ==============================================================================
-- db/migrations/009_add_event_type_enum_values.sql
-- Add missing enum values to event_type
-- ==============================================================================

-- Adding missing event types from the frontend definitions
-- Note: Postgres does not allow adding ENUM values in a transaction block
-- when running multiple ALTER TYPE ADD VALUE statements inside the same transaction
-- in some older versions, but typically safe in modern Postgres when run sequentially.
-- IF NOT EXISTS makes it idempotent.

ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'club_event';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'other';

-- Record the migration
INSERT INTO _migrations (filename) VALUES ('009_add_event_type_enum_values.sql');
