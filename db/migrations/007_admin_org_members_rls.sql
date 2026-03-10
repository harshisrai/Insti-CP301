-- ==============================================================================
-- db/migrations/007_admin_org_members_rls.sql
-- Missing RLS Policies for Admin Actions on org_members (Insert and Update)
-- ==============================================================================

-- 1. Allow Site Admins or Club Admins (Secretaries, Coordinators, Mentors, etc.) to ADD members
CREATE POLICY "org_members_insert_admin" ON org_members
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Site Admin Check
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
        OR 
        -- Club Admin Check (Has an active position in this organization)
        EXISTS (SELECT 1 FROM user_positions WHERE user_id = auth.uid() AND org_id = org_members.org_id AND is_active = true)
    );

-- 2. Allow Site Admins or Club Admins to UPDATE members (e.g. changing status to 'removed')
CREATE POLICY "org_members_update_admin" ON org_members
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
        OR 
        EXISTS (SELECT 1 FROM user_positions WHERE user_id = auth.uid() AND org_id = org_members.org_id AND is_active = true)
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
        OR 
        EXISTS (SELECT 1 FROM user_positions WHERE user_id = auth.uid() AND org_id = org_members.org_id AND is_active = true)
    );

-- Record the migration
INSERT INTO _migrations (filename) VALUES ('007_admin_org_members_rls.sql');
