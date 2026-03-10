-- ==============================================================================
-- db/migrations/008_fix_events_schema.sql
-- Fix events schema to match application expectations
-- ==============================================================================

-- 1. Rename existing organizer_id (which currently points to users) to posted_by
ALTER TABLE events RENAME COLUMN organizer_id TO posted_by;
ALTER TABLE events RENAME CONSTRAINT events_organizer_id_fkey TO events_posted_by_fkey;
ALTER INDEX IF EXISTS idx_events_organizer RENAME TO idx_events_posted_by;

-- 2. Rename columns to match frontend and API expectations
ALTER TABLE events RENAME COLUMN poster_url TO cover_image_url;
ALTER TABLE events RENAME COLUMN registration_link TO registration_url;
ALTER TABLE events RENAME COLUMN max_participants TO max_attendees;
ALTER TABLE events RENAME COLUMN meeting_link TO meeting_url;
ALTER TABLE events RENAME COLUMN registration_end TO registration_deadline;

-- 3. Add missing columns expected by the frontend
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_map_url TEXT;

-- 4. Add the true organizer_id that points to organizations (can be null for personal events)
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_events_organizer_new ON events(organizer_id);

-- 5. Drop unused organizing_body column (replaced by the actual relation above)
ALTER TABLE events DROP COLUMN IF EXISTS organizing_body;

-- 6. Update RLS Policies
-- When we renamed organizer_id to posted_by, Postgres might have automatically updated the 
-- policies to check `auth.uid() = posted_by`. However, dropping and recreating ensures
-- we have the correct rules for both posted_by and organizer_id.

DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_insert" ON events;
DROP POLICY IF EXISTS "events_update_own" ON events;
DROP POLICY IF EXISTS "events_delete_own" ON events;

-- Anyone can read published events (+ posters see their own drafts)
CREATE POLICY "events_select" ON events
    FOR SELECT TO authenticated
    USING (is_published = true OR auth.uid() = posted_by);

-- Users can insert events where they are the poster
CREATE POLICY "events_insert" ON events
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = posted_by);

-- Users can update events they posted
CREATE POLICY "events_update_own" ON events
    FOR UPDATE TO authenticated
    USING (auth.uid() = posted_by)
    WITH CHECK (auth.uid() = posted_by);

-- Users can delete events they posted
CREATE POLICY "events_delete_own" ON events
    FOR DELETE TO authenticated
    USING (auth.uid() = posted_by);

-- Record the migration
INSERT INTO _migrations (filename) VALUES ('008_fix_events_schema.sql');
