-- ============================================================
-- 001_initial_schema.sql
-- IIT Ropar Community Platform — Full Schema for Supabase
-- Run this ONCE in the Supabase SQL Editor.
-- ============================================================
-- RLS SAFETY RULES APPLIED:
--   1. No policy ever references another RLS-protected table
--   2. All checks use auth.uid() only (from JWT, not a table)
--   3. INSERT policies use WITH CHECK (not USING)
--   4. Signup uses a SECURITY DEFINER function to bypass RLS
--   5. Public content tables have permissive SELECT
--   6. Private tables (messages, notifications) use own-rows-only
-- ============================================================

-- ========================
-- ENUMS
-- ========================
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'staff', 'alumni', 'guest');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'archived');
CREATE TYPE blog_category AS ENUM ('placement', 'internship', 'faculty_insight', 'alumni_experience', 'research', 'general');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE item_category AS ENUM ('books', 'electronics', 'furniture', 'clothing', 'cycle', 'stationery', 'sports', 'other');
CREATE TYPE item_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
CREATE TYPE listing_status AS ENUM ('available', 'reserved', 'sold', 'cancelled');
CREATE TYPE event_type AS ENUM ('ismp', 'workshop', 'seminar', 'competition', 'cultural', 'sports', 'esports', 'literary', 'club_activity', 'fest', 'general');
CREATE TYPE lf_category AS ENUM ('electronics', 'documents', 'accessories', 'clothing', 'keys', 'wallet', 'bottle', 'other');
CREATE TYPE lf_status AS ENUM ('lost', 'found', 'claimed', 'returned');
CREATE TYPE notice_category AS ENUM ('academic', 'administrative', 'placement', 'hostel', 'sports', 'wellness', 'general');
CREATE TYPE notice_priority AS ENUM ('urgent', 'high', 'medium', 'low');
CREATE TYPE location_type AS ENUM ('academic', 'hostel', 'administrative', 'recreational', 'mess', 'medical', 'sports', 'other');
CREATE TYPE org_type AS ENUM ('governance_body', 'board', 'club', 'society', 'fest_committee');
CREATE TYPE membership_status AS ENUM ('pending', 'approved', 'removed');
CREATE TYPE por_type AS ENUM ('secretary', 'representative', 'mentor', 'coordinator', 'custom');
CREATE TYPE notification_type AS ENUM ('comment', 'like', 'event', 'notice', 'marketplace', 'club', 'governance', 'general');
CREATE TYPE link_category AS ENUM ('academic', 'administrative', 'library', 'placement', 'wellness', 'hostel', 'general');

-- ========================
-- TABLES
-- ========================

-- 1. USERS
CREATE TABLE users (
    id                    UUID PRIMARY KEY,  -- matches Supabase Auth uid
    email                 TEXT NOT NULL UNIQUE,
    full_name             TEXT NOT NULL,
    role                  user_role NOT NULL DEFAULT 'student',
    status                user_status NOT NULL DEFAULT 'active',
    department            TEXT,
    branch                TEXT,
    batch                 TEXT,
    enrollment_number     TEXT,
    employee_id           TEXT,
    designation           TEXT,
    current_organization  TEXT,
    current_position      TEXT,
    phone_number          TEXT,
    bio                   TEXT,
    linkedin_url          TEXT,
    profile_picture_url   TEXT,
    is_verified           BOOLEAN NOT NULL DEFAULT false,
    is_admin              BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ORGANIZATIONS (Gymkhana → Board → Club hierarchy)
CREATE TABLE organizations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL UNIQUE,
    type          org_type NOT NULL,
    parent_id     UUID REFERENCES organizations(id) ON DELETE SET NULL,
    description   TEXT,
    logo_url      TEXT,
    email         TEXT,
    social_links  JSONB DEFAULT '{}',
    is_active     BOOLEAN NOT NULL DEFAULT true,
    founded_year  INT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ORG MEMBERS (club membership)
CREATE TABLE org_members (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status     membership_status NOT NULL DEFAULT 'pending',
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(org_id, user_id)
);

-- 4. USER POSITIONS (POR tracking)
CREATE TABLE user_positions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    por_type    por_type NOT NULL DEFAULT 'custom',
    valid_from  DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. BLOG POSTS
CREATE TABLE blog_posts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posting_identity_id UUID REFERENCES user_positions(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    slug                TEXT NOT NULL UNIQUE,
    content             TEXT NOT NULL DEFAULT '',
    excerpt             TEXT,
    featured_image_url  TEXT,
    category            blog_category NOT NULL DEFAULT 'general',
    tags                TEXT[] DEFAULT '{}',
    company_name        TEXT,
    role_applied        TEXT,
    interview_round     TEXT,
    status              content_status NOT NULL DEFAULT 'draft',
    is_featured         BOOLEAN NOT NULL DEFAULT false,
    allow_comments      BOOLEAN NOT NULL DEFAULT true,
    view_count          INT NOT NULL DEFAULT 0,
    like_count          INT NOT NULL DEFAULT 0,
    comment_count       INT NOT NULL DEFAULT 0,
    published_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. MARKETPLACE ITEMS
CREATE TABLE marketplace_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    description      TEXT,
    category         item_category NOT NULL DEFAULT 'other',
    price            NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_negotiable    BOOLEAN NOT NULL DEFAULT false,
    condition        item_condition NOT NULL DEFAULT 'good',
    status           listing_status NOT NULL DEFAULT 'available',
    images           TEXT[] DEFAULT '{}',
    pickup_location  TEXT,
    delivery_available BOOLEAN NOT NULL DEFAULT false,
    view_count       INT NOT NULL DEFAULT 0,
    expires_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. LOCATIONS (campus buildings)
CREATE TABLE locations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL,
    code           TEXT UNIQUE,
    type           location_type NOT NULL DEFAULT 'other',
    latitude       DOUBLE PRECISION,
    longitude      DOUBLE PRECISION,
    floor_count    INT,
    has_indoor_map BOOLEAN NOT NULL DEFAULT false,
    facilities     TEXT[] DEFAULT '{}',
    is_accessible  BOOLEAN NOT NULL DEFAULT false,
    opening_time   TIME,
    closing_time   TIME,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. EVENTS
CREATE TABLE events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posting_identity_id UUID REFERENCES user_positions(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    slug                TEXT NOT NULL UNIQUE,
    description         TEXT,
    type                event_type NOT NULL DEFAULT 'general',
    start_time          TIMESTAMPTZ,
    end_time            TIMESTAMPTZ,
    registration_start  TIMESTAMPTZ,
    registration_end    TIMESTAMPTZ,
    location_id         UUID REFERENCES locations(id) ON DELETE SET NULL,
    venue_name          TEXT,
    poster_url          TEXT,
    requires_registration BOOLEAN NOT NULL DEFAULT false,
    max_participants    INT,
    registration_fee    NUMERIC(10,2) NOT NULL DEFAULT 0,
    registration_link   TEXT,
    meeting_link        TEXT,
    target_roles        TEXT[] DEFAULT '{}',
    target_departments  TEXT[] DEFAULT '{}',
    target_batches      TEXT[] DEFAULT '{}',
    interested_count    INT NOT NULL DEFAULT 0,
    is_published        BOOLEAN NOT NULL DEFAULT false,
    is_cancelled        BOOLEAN NOT NULL DEFAULT false,
    organizing_body     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. COMMUNITIES
CREATE TABLE communities (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    slug              TEXT NOT NULL UNIQUE,
    description       TEXT,
    is_public         BOOLEAN NOT NULL DEFAULT true,
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    allow_posts       BOOLEAN NOT NULL DEFAULT true,
    member_count      INT NOT NULL DEFAULT 0,
    post_count        INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. COMMUNITY MEMBERS
CREATE TABLE community_members (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role         TEXT NOT NULL DEFAULT 'member',  -- member, admin, moderator
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(community_id, user_id)
);

-- 11. COMMUNITY POSTS
CREATE TABLE community_posts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id  UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    author_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT,
    content       TEXT NOT NULL,
    media_urls    TEXT[] DEFAULT '{}',
    like_count    INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    is_pinned     BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. NOTICES
CREATE TABLE notices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posting_identity_id UUID REFERENCES user_positions(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    content             TEXT NOT NULL,
    category            notice_category NOT NULL DEFAULT 'general',
    priority            notice_priority NOT NULL DEFAULT 'medium',
    tags                TEXT[] DEFAULT '{}',
    target_roles        TEXT[] DEFAULT '{}',
    target_departments  TEXT[] DEFAULT '{}',
    target_batches      TEXT[] DEFAULT '{}',
    attachments         TEXT[] DEFAULT '{}',
    is_active           BOOLEAN NOT NULL DEFAULT true,
    is_pinned           BOOLEAN NOT NULL DEFAULT false,
    valid_from          TIMESTAMPTZ DEFAULT now(),
    valid_until         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. LOST & FOUND ITEMS
CREATE TABLE lost_found_items (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claimer_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    item_name          TEXT NOT NULL,
    category           lf_category NOT NULL DEFAULT 'other',
    status             lf_status NOT NULL DEFAULT 'lost',
    description        TEXT,
    location_lost_found TEXT,
    date_lost_found    DATE,
    contact_info       TEXT,
    images             TEXT[] DEFAULT '{}',
    claimed_at         TIMESTAMPTZ,
    returned_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. CONVERSATIONS
CREATE TABLE conversations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message     TEXT,
    last_message_at  TIMESTAMPTZ,
    unread_count     INT NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(participant1_id, participant2_id)
);

-- 15. MESSAGES
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. FEED POSTS
CREATE TABLE feed_posts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posting_identity_id UUID REFERENCES user_positions(id) ON DELETE SET NULL,
    content             TEXT NOT NULL,
    media_urls          TEXT[] DEFAULT '{}',
    source_type         TEXT NOT NULL DEFAULT 'post',  -- post, blog, event, notice
    source_id           UUID,
    like_count          INT NOT NULL DEFAULT 0,
    comment_count       INT NOT NULL DEFAULT 0,
    is_public           BOOLEAN NOT NULL DEFAULT true,
    target_roles        TEXT[] DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. QUICK LINKS
CREATE TABLE quick_links (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    url           TEXT NOT NULL UNIQUE,
    category      link_category NOT NULL DEFAULT 'general',
    target_roles  TEXT[] DEFAULT '{}',
    display_order INT NOT NULL DEFAULT 100,
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    click_count   INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. NOTIFICATIONS
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    message     TEXT,
    type        notification_type NOT NULL DEFAULT 'general',
    entity_type TEXT,
    entity_id   UUID,
    action_url  TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT false,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. MIGRATION TRACKING
CREATE TABLE IF NOT EXISTS _migrations (
    id         SERIAL PRIMARY KEY,
    filename   TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ========================
-- INDEXES (Performance)
-- ========================

-- Users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_status ON users(status) WHERE status = 'active';

-- Blog posts
CREATE INDEX idx_blogs_category ON blog_posts(category) WHERE status = 'published';
CREATE INDEX idx_blogs_published_at ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blogs_author ON blog_posts(author_id);
CREATE INDEX idx_blogs_slug ON blog_posts(slug);

-- Marketplace
CREATE INDEX idx_marketplace_category ON marketplace_items(category) WHERE status = 'available';
CREATE INDEX idx_marketplace_status ON marketplace_items(status, created_at DESC);
CREATE INDEX idx_marketplace_seller ON marketplace_items(seller_id);

-- Events
CREATE INDEX idx_events_type ON events(type) WHERE is_published = true;
CREATE INDEX idx_events_start ON events(start_time) WHERE is_published = true;
CREATE INDEX idx_events_organizer ON events(organizer_id);

-- Notices
CREATE INDEX idx_notices_category ON notices(category) WHERE is_active = true;
CREATE INDEX idx_notices_priority ON notices(priority, created_at DESC) WHERE is_active = true;
CREATE INDEX idx_notices_pinned ON notices(is_pinned, created_at DESC) WHERE is_active = true;

-- Messages & conversations
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_conversations_p1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_p2 ON conversations(participant2_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- Feed
CREATE INDEX idx_feed_created ON feed_posts(created_at DESC) WHERE is_public = true;
CREATE INDEX idx_feed_author ON feed_posts(author_id);

-- Lost & found
CREATE INDEX idx_lf_status ON lost_found_items(status, created_at DESC);
CREATE INDEX idx_lf_reporter ON lost_found_items(reporter_id);

-- Communities
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_posts_community ON community_posts(community_id, created_at DESC);

-- Organizations
CREATE INDEX idx_org_type ON organizations(type) WHERE is_active = true;
CREATE INDEX idx_org_parent ON organizations(parent_id);
CREATE INDEX idx_org_members_org ON org_members(org_id) WHERE status = 'approved';
CREATE INDEX idx_org_members_user ON org_members(user_id);

-- User positions
CREATE INDEX idx_positions_user ON user_positions(user_id) WHERE is_active = true;
CREATE INDEX idx_positions_org ON user_positions(org_id) WHERE is_active = true;

-- Quick links
CREATE INDEX idx_quick_links_category ON quick_links(category) WHERE is_active = true;
CREATE INDEX idx_quick_links_order ON quick_links(display_order, click_count DESC) WHERE is_active = true;


-- ========================
-- SECURITY DEFINER FUNCTION (Signup — bypasses RLS)
-- ========================
-- This function is called from your signup code with the service_role key.
-- It inserts the user profile row WITHOUT being blocked by RLS.
-- SECURITY DEFINER means it runs with the function CREATOR's permissions (superuser),
-- not the caller's — so RLS does not interfere.

CREATE OR REPLACE FUNCTION create_user_profile(
    p_id UUID,
    p_email TEXT,
    p_full_name TEXT,
    p_role user_role DEFAULT 'student',
    p_department TEXT DEFAULT NULL,
    p_branch TEXT DEFAULT NULL,
    p_batch TEXT DEFAULT NULL,
    p_enrollment_number TEXT DEFAULT NULL,
    p_employee_id TEXT DEFAULT NULL,
    p_designation TEXT DEFAULT NULL,
    p_current_organization TEXT DEFAULT NULL,
    p_current_position TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER       -- ← THIS is what makes it bypass RLS
SET search_path = public
AS $$
BEGIN
    INSERT INTO users (
        id, email, full_name, role,
        department, branch, batch, enrollment_number,
        employee_id, designation,
        current_organization, current_position
    ) VALUES (
        p_id, p_email, p_full_name, p_role,
        p_department, p_branch, p_batch, p_enrollment_number,
        p_employee_id, p_designation,
        p_current_organization, p_current_position
    );
END;
$$;


-- ========================
-- UPDATED_AT TRIGGER (auto-update timestamp)
-- ========================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at        BEFORE UPDATE ON users             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_blogs_updated_at        BEFORE UPDATE ON blog_posts        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_marketplace_updated_at  BEFORE UPDATE ON marketplace_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_events_updated_at       BEFORE UPDATE ON events            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_communities_updated_at  BEFORE UPDATE ON communities       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_notices_updated_at      BEFORE UPDATE ON notices           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_lf_updated_at           BEFORE UPDATE ON lost_found_items  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_feed_updated_at         BEFORE UPDATE ON feed_posts        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orgs_updated_at         BEFORE UPDATE ON organizations     FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- RULES:
--   ✅ Every policy uses ONLY auth.uid() — no cross-table queries
--   ✅ INSERT policies use WITH CHECK
--   ✅ SELECT on public content = USING (true) for authenticated
--   ✅ SELECT on private content = USING (auth.uid() = owner)
--   ✅ UPDATE/DELETE = USING (auth.uid() = owner)
--   ✅ No policy references another table → no infinite recursion
-- ============================================================

-- ---------- USERS ----------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read any profile (needed for JOINs on author, seller, etc.)
CREATE POLICY "users_select" ON users
    FOR SELECT TO authenticated
    USING (true);

-- Users can only update their own row
CREATE POLICY "users_update_own" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT handled by create_user_profile() SECURITY DEFINER function
-- No direct INSERT policy needed — the function bypasses RLS.

-- ---------- ORGANIZATIONS ----------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read organizations (it's a public directory)
CREATE POLICY "orgs_select" ON organizations
    FOR SELECT TO authenticated
    USING (true);

-- Only admins insert/update/delete orgs (use service_role key in admin portal)
-- No anon-key policy for write operations = writes blocked via anon key.

-- ---------- ORG MEMBERS ----------
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read membership (public info — who's in which club)
CREATE POLICY "org_members_select" ON org_members
    FOR SELECT TO authenticated
    USING (true);

-- Users can request to join (insert their own row)
CREATE POLICY "org_members_insert_own" ON org_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can leave (delete their own row)
CREATE POLICY "org_members_delete_own" ON org_members
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ---------- USER POSITIONS ----------
ALTER TABLE user_positions ENABLE ROW LEVEL SECURITY;

-- Anyone can read positions (needed for posting identity display)
CREATE POLICY "positions_select" ON user_positions
    FOR SELECT TO authenticated
    USING (true);

-- Only admins assign PORs (use service_role key in admin portal)

-- ---------- BLOG POSTS ----------
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published blogs
CREATE POLICY "blogs_select_published" ON blog_posts
    FOR SELECT TO authenticated
    USING (status = 'published' OR auth.uid() = author_id);
    -- Authors can also see their own drafts

-- Authors can insert their own blogs
CREATE POLICY "blogs_insert" ON blog_posts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Authors can update their own blogs
CREATE POLICY "blogs_update_own" ON blog_posts
    FOR UPDATE TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own blogs
CREATE POLICY "blogs_delete_own" ON blog_posts
    FOR DELETE TO authenticated
    USING (auth.uid() = author_id);

-- ---------- MARKETPLACE ITEMS ----------
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read available items (+ sellers see all their own items)
CREATE POLICY "marketplace_select" ON marketplace_items
    FOR SELECT TO authenticated
    USING (status = 'available' OR auth.uid() = seller_id);

CREATE POLICY "marketplace_insert" ON marketplace_items
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "marketplace_update_own" ON marketplace_items
    FOR UPDATE TO authenticated
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "marketplace_delete_own" ON marketplace_items
    FOR DELETE TO authenticated
    USING (auth.uid() = seller_id);

-- ---------- LOCATIONS ----------
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "locations_select" ON locations
    FOR SELECT TO authenticated
    USING (true);

-- Write via service_role only (admin seeds)

-- ---------- EVENTS ----------
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can read published events (+ organizers see their own)
CREATE POLICY "events_select" ON events
    FOR SELECT TO authenticated
    USING (is_published = true OR auth.uid() = organizer_id);

CREATE POLICY "events_insert" ON events
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_update_own" ON events
    FOR UPDATE TO authenticated
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_delete_own" ON events
    FOR DELETE TO authenticated
    USING (auth.uid() = organizer_id);

-- ---------- COMMUNITIES ----------
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "communities_select" ON communities
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "communities_insert" ON communities
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "communities_update_own" ON communities
    FOR UPDATE TO authenticated
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- ---------- COMMUNITY MEMBERS ----------
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cm_select" ON community_members
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "cm_insert_own" ON community_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cm_delete_own" ON community_members
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ---------- COMMUNITY POSTS ----------
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cp_select" ON community_posts
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "cp_insert" ON community_posts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "cp_update_own" ON community_posts
    FOR UPDATE TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "cp_delete_own" ON community_posts
    FOR DELETE TO authenticated
    USING (auth.uid() = author_id);

-- ---------- NOTICES ----------
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Anyone can read active notices
CREATE POLICY "notices_select" ON notices
    FOR SELECT TO authenticated
    USING (is_active = true OR auth.uid() = posted_by);

CREATE POLICY "notices_insert" ON notices
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "notices_update_own" ON notices
    FOR UPDATE TO authenticated
    USING (auth.uid() = posted_by)
    WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "notices_delete_own" ON notices
    FOR DELETE TO authenticated
    USING (auth.uid() = posted_by);

-- ---------- LOST & FOUND ----------
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lf_select" ON lost_found_items
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "lf_insert" ON lost_found_items
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "lf_update_own" ON lost_found_items
    FOR UPDATE TO authenticated
    USING (auth.uid() = reporter_id)
    WITH CHECK (auth.uid() = reporter_id);

-- ---------- CONVERSATIONS ----------
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "conv_select_own" ON conversations
    FOR SELECT TO authenticated
    USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "conv_insert" ON conversations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "conv_update_own" ON conversations
    FOR UPDATE TO authenticated
    USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- ---------- MESSAGES ----------
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only see messages in their conversations
CREATE POLICY "messages_select_own" ON messages
    FOR SELECT TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_read" ON messages
    FOR UPDATE TO authenticated
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- ---------- FEED POSTS ----------
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed_select" ON feed_posts
    FOR SELECT TO authenticated
    USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "feed_insert" ON feed_posts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "feed_update_own" ON feed_posts
    FOR UPDATE TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "feed_delete_own" ON feed_posts
    FOR DELETE TO authenticated
    USING (auth.uid() = author_id);

-- ---------- QUICK LINKS ----------
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "links_select" ON quick_links
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Write via service_role only (admin curates links)

-- ---------- NOTIFICATIONS ----------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifs_select_own" ON notifications
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Users can update their own (mark as read)
CREATE POLICY "notifs_update_own" ON notifications
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- INSERT via service_role or DB triggers only (system-generated)

-- Record this migration
INSERT INTO _migrations (filename) VALUES ('001_initial_schema.sql');
