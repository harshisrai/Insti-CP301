-- ============================================================
-- 002_admin_rpc_functions.sql
-- Add SECURITY DEFINER functions for Organization Management
-- to bypass RLS while maintaining schema purity (Rule #1).
-- ============================================================

-- Function to Create an Organization
CREATE OR REPLACE FUNCTION admin_create_organization(
    p_name TEXT,
    p_slug TEXT,
    p_type org_type,
    p_parent_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_logo_url TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_social_links JSONB DEFAULT NULL,
    p_founded_year INT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT true
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_new_org organizations;
BEGIN
    -- 1. Check if caller is admin
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can create organizations';
    END IF;

    -- 2. Insert and return
    INSERT INTO organizations (
        name, slug, type, parent_id, description, logo_url, 
        email, social_links, founded_year, is_active
    ) VALUES (
        p_name, p_slug, p_type, p_parent_id, p_description, p_logo_url, 
        p_email, p_social_links, p_founded_year, p_is_active
    )
    RETURNING * INTO v_new_org;

    RETURN v_new_org;
END;
$$;

-- Function to Update an Organization
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
        parent_id = p_parent_id, -- Can be null
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

-- Function to Assign a Position of Responsibility
CREATE OR REPLACE FUNCTION admin_assign_por(
    p_user_id UUID,
    p_org_id UUID,
    p_title TEXT,
    p_por_type por_type,
    p_valid_from DATE DEFAULT CURRENT_DATE,
    p_valid_until DATE DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT true
)
RETURNS user_positions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_new_por user_positions;
BEGIN
    -- 1. Check if caller is admin
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can assign positions';
    END IF;

    -- 2. Insert and return
    INSERT INTO user_positions (
        user_id, org_id, title, por_type, valid_from, valid_until, is_active
    ) VALUES (
        p_user_id, p_org_id, p_title, p_por_type, COALESCE(p_valid_from, CURRENT_DATE), p_valid_until, COALESCE(p_is_active, true)
    )
    RETURNING * INTO v_new_por;

    RETURN v_new_por;
END;
$$;

-- Function to Revoke a Position of Responsibility
CREATE OR REPLACE FUNCTION admin_revoke_por(
    p_position_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- 1. Check if caller is admin
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can revoke positions';
    END IF;

    -- 2. Update and return
    UPDATE user_positions
    SET is_active = false, valid_until = CURRENT_DATE
    WHERE id = p_position_id;

    RETURN FOUND;
END;
$$;

-- ============================================================
-- Function to Upsert an Organization (for CSV bulk upload)
-- Uses ON CONFLICT (slug) DO UPDATE — idempotent and safe.
-- Accepts parent_slug instead of parent_id so CSVs are human-readable.
-- ============================================================
CREATE OR REPLACE FUNCTION admin_upsert_organization(
    p_name         TEXT,
    p_slug         TEXT,
    p_type         org_type,
    p_parent_slug  TEXT    DEFAULT NULL,
    p_description  TEXT    DEFAULT NULL,
    p_logo_url     TEXT    DEFAULT NULL,
    p_email        TEXT    DEFAULT NULL,
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

    -- 2. Resolve parent slug → id (NULL is fine for top-level orgs)
    IF p_parent_slug IS NOT NULL AND p_parent_slug <> '' THEN
        SELECT id INTO v_parent_id FROM organizations WHERE slug = p_parent_slug LIMIT 1;
        IF v_parent_id IS NULL THEN
            RAISE EXCEPTION 'Parent organization with slug ''%'' not found', p_parent_slug;
        END IF;
    END IF;

    -- 3. Upsert on slug (idempotent)
    INSERT INTO organizations (
        name, slug, type, parent_id, description, logo_url, email, founded_year, is_active
    ) VALUES (
        p_name, p_slug, p_type, v_parent_id, p_description, p_logo_url, p_email, p_founded_year, COALESCE(p_is_active, true)
    )
    ON CONFLICT (slug) DO UPDATE
        SET name         = EXCLUDED.name,
            type         = EXCLUDED.type,
            parent_id    = COALESCE(EXCLUDED.parent_id, organizations.parent_id),
            description  = COALESCE(EXCLUDED.description, organizations.description),
            logo_url     = COALESCE(EXCLUDED.logo_url,    organizations.logo_url),
            email        = COALESCE(EXCLUDED.email,       organizations.email),
            founded_year = COALESCE(EXCLUDED.founded_year, organizations.founded_year),
            is_active    = EXCLUDED.is_active,
            updated_at   = now()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

-- ============================================================
-- Function to Upsert an Org Member by email + org slug (CSV bulk upload)
-- Resolves user by email and org by slug, then inserts/updates membership.
-- ============================================================
CREATE OR REPLACE FUNCTION admin_upsert_member(
    p_user_email TEXT,
    p_org_slug   TEXT,
    p_status     TEXT DEFAULT 'approved'
)
RETURNS org_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_user_id  UUID;
    v_org_id   UUID;
    v_result   org_members;
BEGIN
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can manage members';
    END IF;

    SELECT id INTO v_user_id FROM users WHERE lower(email) = lower(p_user_email) LIMIT 1;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email ''%'' not found', p_user_email;
    END IF;

    SELECT id INTO v_org_id FROM organizations WHERE slug = p_org_slug LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization with slug ''%'' not found', p_org_slug;
    END IF;

    INSERT INTO org_members (user_id, org_id, status)
    VALUES (v_user_id, v_org_id, COALESCE(p_status, 'approved'))
    ON CONFLICT (user_id, org_id) DO UPDATE
        SET status = EXCLUDED.status,
            joined_at = CASE WHEN EXCLUDED.status = 'approved' AND org_members.status <> 'approved'
                             THEN now() ELSE org_members.joined_at END
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

-- ============================================================
-- Function to Upsert a POR by user email + org slug + title (CSV bulk upload)
-- Resolves user and org by email/slug, then creates or replaces the position.
-- ============================================================
CREATE OR REPLACE FUNCTION admin_upsert_por(
    p_user_email  TEXT,
    p_org_slug    TEXT,
    p_title       TEXT,
    p_por_type    por_type  DEFAULT 'custom',
    p_valid_from  DATE      DEFAULT CURRENT_DATE,
    p_valid_until DATE      DEFAULT NULL,
    p_is_active   BOOLEAN   DEFAULT true
)
RETURNS user_positions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_user_id  UUID;
    v_org_id   UUID;
    v_result   user_positions;
BEGIN
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can manage positions';
    END IF;

    SELECT id INTO v_user_id FROM users WHERE lower(email) = lower(p_user_email) LIMIT 1;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email ''%'' not found', p_user_email;
    END IF;

    SELECT id INTO v_org_id FROM organizations WHERE slug = p_org_slug LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization with slug ''%'' not found', p_org_slug;
    END IF;

    -- Upsert on (user_id, org_id, title) — one person can hold one title per org
    INSERT INTO user_positions (user_id, org_id, title, por_type, valid_from, valid_until, is_active)
    VALUES (v_user_id, v_org_id, p_title, COALESCE(p_por_type, 'custom'),
            COALESCE(p_valid_from, CURRENT_DATE), p_valid_until, COALESCE(p_is_active, true))
    ON CONFLICT (user_id, org_id, title) DO UPDATE
        SET por_type    = EXCLUDED.por_type,
            valid_from  = EXCLUDED.valid_from,
            valid_until = EXCLUDED.valid_until,
            is_active   = EXCLUDED.is_active,
            updated_at  = now()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;
