-- ==========================================
-- Migration: Add Status to Notices
-- Description: Introduces Draft/Published workflow
-- ==========================================

-- 1. Create the enum type for status
CREATE TYPE notice_status AS ENUM ('draft', 'published', 'archived');

-- 2. Add the status column to the notices table
ALTER TABLE notices 
ADD COLUMN status notice_status NOT NULL DEFAULT 'published';

-- 3. Update RLS Policies for Notices
-- Drop existing policies
DROP POLICY IF EXISTS "notices_select" ON notices;

-- Create new policies incorporating status
-- Anyone can read published active notices OR their own notices (including drafts)
CREATE POLICY "notices_select" ON notices
    FOR SELECT TO authenticated
    USING (
        (is_active = true AND status = 'published') 
        OR 
        auth.uid() = posted_by
    );

-- Keep existing insert/update/delete policies as they already restrict to `posted_by`
