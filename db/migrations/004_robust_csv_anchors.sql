-- ============================================================
-- 004_robust_csv_anchors.sql
-- Switch from natural keys to immutable IDs for safe CSV operations.
-- Replaces slug-based org constraints with ID constraints.
-- Replaces email-based user lookup with entry_number strict validation.
-- ============================================================

-- Record this migration
INSERT INTO _migrations (filename) VALUES ('004_robust_csv_anchors.sql') ON CONFLICT DO NOTHING;

-- 1. admin_upsert_organization
-- Updated to process explicit UUID anchors for both org ID and parent ID.
CREATE OR REPLACE FUNCTION admin_upsert_organization(
    p_name         TEXT,
    p_slug         TEXT,
    p_type         org_type,
    p_parent_id    UUID    DEFAULT NULL,
    p_description  TEXT    DEFAULT NULL,
    p_logo_url     TEXT    DEFAULT NULL,
    p_email        TEXT    DEFAULT NULL,
    p_social_links JSONB   DEFAULT NULL,
    p_founded_year INT     DEFAULT NULL,
    p_is_active    BOOLEAN DEFAULT true,
    p_id           UUID    DEFAULT NULL
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin  BOOLEAN;
    v_result    organizations;
BEGIN
    -- 1. Check if caller is admin
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can upsert organizations';
    END IF;

    -- 2. Upsert using primary key 'id' anchoring
    IF p_id IS NULL THEN
        -- Insert new row generating a fresh UUID
        INSERT INTO organizations (
            name, slug, type, parent_id, description, logo_url, email, social_links, founded_year, is_active
        ) VALUES (
            p_name, p_slug, p_type, p_parent_id, p_description, p_logo_url, p_email, COALESCE(p_social_links, '{}'::jsonb), p_founded_year, COALESCE(p_is_active, true)
        )
        RETURNING * INTO v_result;
    ELSE
        -- Update existing mapped row, safely avoiding slug re-creation splits. 
        INSERT INTO organizations (
            id, name, slug, type, parent_id, description, logo_url, email, social_links, founded_year, is_active
        ) VALUES (
            p_id, p_name, p_slug, p_type, p_parent_id, p_description, p_logo_url, p_email, COALESCE(p_social_links, '{}'::jsonb), p_founded_year, COALESCE(p_is_active, true)
        )
        ON CONFLICT (id) DO UPDATE
            SET name         = EXCLUDED.name,
                slug         = EXCLUDED.slug,
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
    END IF;

    RETURN v_result;
END;
$$;


-- 2. admin_upsert_member
-- Updated to strictly map via entry_number.
CREATE OR REPLACE FUNCTION admin_upsert_member(
    p_entry_number TEXT,
    p_org_slug     TEXT,
    p_status       membership_status DEFAULT 'approved'
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
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Strict Identity Validation Check
    SELECT id INTO v_user_id
      FROM users 
     WHERE (enrollment_number = p_entry_number OR employee_id = p_entry_number) 
     LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with entry number ''%'' not found in the system. Cannot assign membership.', p_entry_number;
    END IF;

    SELECT id INTO v_org_id FROM organizations WHERE slug = p_org_slug LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Org % not found', p_org_slug;
    END IF;

    INSERT INTO org_members (org_id, user_id, status)
    VALUES (v_org_id, v_user_id, p_status)
    ON CONFLICT (org_id, user_id) DO UPDATE
        SET status     = EXCLUDED.status,
            updated_at = now()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;


-- 3. admin_upsert_por
-- Updated to strictly map via entry_number.
CREATE OR REPLACE FUNCTION admin_upsert_por(
    p_entry_number TEXT,
    p_org_slug     TEXT,
    p_title        TEXT,
    p_por_type     TEXT    DEFAULT 'custom',
    p_valid_from   DATE    DEFAULT CURRENT_DATE,
    p_valid_until  DATE    DEFAULT NULL,
    p_is_active    BOOLEAN DEFAULT true
)
RETURNS user_positions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin  BOOLEAN;
    v_user_id   UUID;
    v_org_id    UUID;
    v_result    user_positions;
    v_enum_val  por_type;
BEGIN
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Strict Identity Validation Check
    SELECT id INTO v_user_id 
      FROM users 
     WHERE (enrollment_number = p_entry_number OR employee_id = p_entry_number) 
     LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with entry number ''%'' not found in the system. Cannot assign POR.', p_entry_number;
    END IF;

    SELECT id INTO v_org_id FROM organizations WHERE slug = p_org_slug LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Org % not found', p_org_slug;
    END IF;

    -- Safely cast por_type string to Enum, fallback to custom
    BEGIN
        v_enum_val := p_por_type::por_type;
    EXCEPTION WHEN invalid_text_representation THEN
        v_enum_val := 'custom'::por_type;
    END;

    INSERT INTO user_positions (
        user_id, org_id, title, por_type, valid_from, valid_until, is_active
    ) VALUES (
        v_user_id, v_org_id, p_title, v_enum_val, p_valid_from, p_valid_until, COALESCE(p_is_active, true)
    )
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
