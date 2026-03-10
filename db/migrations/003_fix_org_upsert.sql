-- ============================================================
-- 003_fix_org_upsert.sql
-- Fix collision handling and empty field overrides for CSV uploads
-- ============================================================

-- Add unique constraint to user_positions for upsert collision handling
ALTER TABLE user_positions DROP CONSTRAINT IF EXISTS user_positions_user_id_org_id_title_key;
ALTER TABLE user_positions ADD CONSTRAINT user_positions_user_id_org_id_title_key UNIQUE (user_id, org_id, title);

-- Record this migration
INSERT INTO _migrations (filename) VALUES ('003_fix_org_upsert.sql') ON CONFLICT DO NOTHING;

-- Update the admin_upsert_organization function to properly override fields via EXCLUDED
CREATE OR REPLACE FUNCTION admin_upsert_organization(
    p_name         TEXT,
    p_slug         TEXT,
    p_type         org_type,
    p_parent_slug  TEXT    DEFAULT NULL,
    p_description  TEXT    DEFAULT NULL,
    p_logo_url     TEXT    DEFAULT NULL,
    p_email        TEXT    DEFAULT NULL,
    p_social_links JSONB   DEFAULT NULL,
    p_founded_year INT     DEFAULT NULL,
    p_is_active    BOOLEAN DEFAULT true
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin  BOOLEAN;
    v_parent_id UUID;
    v_result    organizations;
BEGIN
    -- 1. Check if caller is admin
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can upsert organizations';
    END IF;

    -- 2. Resolve parent slug → id. Empty string is explicitly treated as no parent.
    IF p_parent_slug IS NOT NULL AND p_parent_slug <> '' THEN
        SELECT id INTO v_parent_id FROM organizations WHERE slug = p_parent_slug LIMIT 1;
        IF v_parent_id IS NULL THEN
            RAISE EXCEPTION 'Parent organization with slug ''%'' not found', p_parent_slug;
        END IF;
    ELSE
        v_parent_id := NULL;
    END IF;

    -- 3. Upsert on slug (idempotent), allowing EXCLUDED to overwrite with NULLs if clearing data
    INSERT INTO organizations (
        name, slug, type, parent_id, description, logo_url, email, social_links, founded_year, is_active
    ) VALUES (
        p_name, p_slug, p_type, v_parent_id, p_description, p_logo_url, p_email, COALESCE(p_social_links, '{}'::jsonb), p_founded_year, COALESCE(p_is_active, true)
    )
    ON CONFLICT (slug) DO UPDATE
        SET name         = EXCLUDED.name,
            type         = EXCLUDED.type,
            parent_id    = EXCLUDED.parent_id,
            description  = EXCLUDED.description,
            logo_url     = EXCLUDED.logo_url,
            email        = EXCLUDED.email,
            social_links = COALESCE(EXCLUDED.social_links, organizations.social_links),
            founded_year = EXCLUDED.founded_year,
            is_active    = EXCLUDED.is_active,
            updated_at   = now()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;
