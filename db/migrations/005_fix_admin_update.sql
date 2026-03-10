-- ============================================================
-- 005_fix_admin_update.sql
-- Fixes admin_update_organization to preserve parent_id when NULL is passed
-- (matching the COALESCE behavior of all other fields).
-- ============================================================

INSERT INTO _migrations (filename) VALUES ('005_fix_admin_update.sql') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION admin_update_organization(
    p_id UUID,
    p_name TEXT DEFAULT NULL,
    p_slug TEXT DEFAULT NULL,
    p_type org_type DEFAULT NULL,
    p_parent_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_logo_url TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_social_links JSONB DEFAULT NULL,
    p_founded_year INT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_updated_org organizations;
BEGIN
    -- 1. Check if caller is admin
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can update organizations';
    END IF;

    -- 2. Update and return
    UPDATE organizations
    SET
        name = COALESCE(p_name, name),
        slug = COALESCE(p_slug, slug),
        type = COALESCE(p_type, type),
        parent_id = COALESCE(p_parent_id, parent_id), -- Preserves existing if null is passed
        description = COALESCE(p_description, description),
        logo_url = COALESCE(p_logo_url, logo_url),
        email = COALESCE(p_email, email),
        social_links = COALESCE(p_social_links, social_links),
        founded_year = COALESCE(p_founded_year, founded_year),
        is_active = COALESCE(p_is_active, is_active),
        updated_at = now()
    WHERE id = p_id
    RETURNING * INTO v_updated_org;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Organization not found';
    END IF;

    RETURN v_updated_org;
END;
$$;
