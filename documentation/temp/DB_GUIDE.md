# Database Practices Guide

**Project:** IIT Ropar Community Platform  
**Date:** March 2026  
**Goal:** A portable, maintainable database that can be updated safely, seeded consistently, and migrated away from Supabase if needed — without sacrificing performance.

---

## The Core Principle

> **The application should never know it's talking to Supabase specifically. It should only know it's talking to a PostgreSQL database.**

If every database operation goes through a thin abstraction layer (`src/lib/db/`), switching from Supabase to any other Postgres host (Neon, Railway, AWS RDS, self-hosted) becomes a config change, not a code rewrite.

---

## Part 1: Project Folder Structure

Adopt this database-related folder layout inside your project:

```
CP301/
├── db/                          ← Everything database-related lives here
│   ├── migrations/              ← Schema changes, one file per change
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_blog_indexes.sql
│   │   ├── 003_add_rls_policies.sql
│   │   └── 004_add_notification_triggers.sql
│   ├── seeds/                   ← Sample/initial data
│   │   ├── 01_locations.sql
│   │   ├── 02_clubs.sql
│   │   ├── 03_quick_links.sql
│   │   └── 04_test_users.sql
│   ├── schema.sql               ← Full current schema (auto-generated, source of truth)
│   └── README.md                ← How to run migrations and seeds
│
└── src/
    └── lib/
        └── db/                  ← Application database access layer
            ├── index.ts         ← Exports all query functions
            ├── client.ts        ← The ONLY place Supabase is imported
            ├── blogs.ts         ← All blog-related DB queries
            ├── events.ts        ← All event-related DB queries
            ├── marketplace.ts   ← All marketplace queries
            ├── users.ts         ← All user profile queries
            └── ...
```

---

## Part 2: The Database Abstraction Layer

### Why This Matters

Right now, Supabase is imported directly in every page component:

```ts
// ❌ Current pattern — Supabase spread throughout every page
// src/app/(dashboard)/blogs/page.tsx
import { createClient } from '@/lib/supabase'
const supabase = createClient()
const { data } = await supabase.from('blog_posts').select('*')
```

If you ever want to switch databases — or even just update a query — you have to find and change code in 14+ different page files.

### The Fix: One File Per Domain

Create dedicated query files. Each query function has a **clear name, specific column selection, and no Supabase leak outside the `db/` folder**.

---

### `src/lib/db/client.ts` — The Only Supabase Import

```ts
// This is the ONLY file in the entire app that imports Supabase.
// If you switch databases later, you only change this file.

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const db = createSupabaseClient(supabaseUrl, supabaseKey)
```

---

### `src/lib/db/blogs.ts` — Example Domain Query File

```ts
import { db } from './client'
import type { BlogPost } from '@/lib/types'

// ✅ Explicit columns — never select('*')
// ✅ Named function — easy to find, easy to update
// ✅ No component-level knowledge of Supabase

export async function getPublishedBlogs(category?: string, limit = 20) {
  let query = db
    .from('blog_posts')
    .select(`
      id, title, slug, excerpt,
      featured_image_url, category,
      company_name, role_applied,
      view_count, like_count, comment_count,
      published_at,
      author:users (id, full_name, role, profile_picture_url)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw new Error(`getPublishedBlogs: ${error.message}`)
  return data as BlogPost[]
}

export async function getBlogBySlug(slug: string) {
  const { data, error } = await db
    .from('blog_posts')
    .select(`
      *, author:users (id, full_name, role, profile_picture_url, department)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) throw new Error(`getBlogBySlug: ${error.message}`)
  return data as BlogPost
}

export async function incrementBlogViewCount(id: string) {
  await db.rpc('increment_view_count', { row_id: id, table_name: 'blog_posts' })
}
```

---

### `src/lib/db/index.ts` — Single Import Point for Components

```ts
// Components import from here, never from individual files
export * from './blogs'
export * from './events'
export * from './marketplace'
export * from './users'
export * from './notices'
export * from './communities'
export * from './lost-found'
// ...
```

---

### Using the Abstraction in a Page Component

```tsx
// src/app/(dashboard)/blogs/page.tsx — after refactor
import { getPublishedBlogs } from '@/lib/db'

export default function BlogsPage() {
  // ...
  async function loadBlogs() {
    const blogs = await getPublishedBlogs(activeCategory)
    setBlogs(blogs)
  }
  // No Supabase import. No .select('*'). Clean.
}
```

---

## Part 3: Schema Management with Migrations

### The Problem with "Just Edit the DB in the Dashboard"

When you edit a table directly in the Supabase UI:
- Other developers don't know what changed.
- You can't roll back.
- Staging and production get out of sync.
- You cannot reproduce the database on a new machine.

### The Solution: SQL Migration Files

Every change to the database schema gets its own numbered SQL file in `db/migrations/`.

**Naming convention:** `NNN_short_description.sql`

#### Example Migration Files

**`db/migrations/001_initial_schema.sql`**
```sql
-- Run once to create the initial database structure.
-- Created: 2026-03-01

CREATE TYPE user_role AS ENUM ('student', 'faculty', 'staff', 'alumni', 'guest');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'archived');

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    full_name   TEXT NOT NULL,
    role        user_role NOT NULL DEFAULT 'student',
    status      user_status NOT NULL DEFAULT 'active',
    bio         TEXT,
    department  TEXT,
    batch       TEXT,
    -- ... other columns
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (Other tables follow in the same file)
```

**`db/migrations/002_add_blog_indexes.sql`**
```sql
-- Performance indexes for blog_posts table.
-- Created: 2026-03-07

CREATE INDEX idx_blog_posts_category
    ON blog_posts (category)
    WHERE status = 'published';

CREATE INDEX idx_blog_posts_published_at
    ON blog_posts (published_at DESC)
    WHERE status = 'published';

CREATE INDEX idx_blog_posts_author
    ON blog_posts (author_id);
```

**`db/migrations/003_add_rls_policies.sql`**
```sql
-- Row Level Security policies for all tables.
-- Created: 2026-03-07

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone can read active user profiles
CREATE POLICY "users_read_active"
    ON users FOR SELECT USING (status = 'active');

-- Users can only update their own profile
CREATE POLICY "users_update_own"
    ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone (authenticated) can read published blogs
CREATE POLICY "blogs_read_published"
    ON blog_posts FOR SELECT USING (status = 'published');

-- Only the author can edit their own blog
CREATE POLICY "blogs_modify_own"
    ON blog_posts FOR ALL USING (auth.uid() = author_id);

-- Similar patterns for all other tables...
```

**`db/migrations/004_add_notification_triggers.sql`**
```sql
-- PostgreSQL trigger to auto-generate notifications for urgent notices.
-- Created: 2026-03-07

CREATE OR REPLACE FUNCTION fn_notify_urgent_notice()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, created_at)
    SELECT
        u.id,
        'Urgent Notice: ' || NEW.title,
        NEW.content,
        'notice',
        'notice',
        NEW.id,
        NOW()
    FROM users u
    WHERE u.status = 'active';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_urgent_notice
    AFTER INSERT ON notices
    FOR EACH ROW
    WHEN (NEW.priority IN ('urgent', 'high') AND NEW.is_active = true)
    EXECUTE FUNCTION fn_notify_urgent_notice();
```

### How to Apply Migrations

**Adding a new migration:**
1. Create the next numbered file: `db/migrations/005_what_changed.sql`
2. Write the SQL.
3. Run it in the Supabase SQL editor (or via CLI).
4. Commit the file to Git.

**Every developer and every future AI agent now has a complete, ordered history of every database change ever made.**

### Tracking Which Migrations Have Been Applied

Add a simple tracking table to your schema:

```sql
CREATE TABLE _migrations (
    id          SERIAL PRIMARY KEY,
    filename    TEXT NOT NULL UNIQUE,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

After running each migration file, insert a record:
```sql
INSERT INTO _migrations (filename) VALUES ('002_add_blog_indexes.sql');
```

To check what's been applied:
```sql
SELECT filename, applied_at FROM _migrations ORDER BY id;
```

---

## Part 4: Data Seeding

Seed files provide the initial/test data that makes the application usable. They live in `db/seeds/`.

### Rules for Seed Files

1. **Seed files must be idempotent** — running them twice should not cause errors or duplicate data.
2. **Use `INSERT ... ON CONFLICT DO NOTHING`** to make seeds safe to re-run.
3. **Label seeds clearly**: production seeds (`01_*.sql`) vs. development seeds (`dev_*.sql`).

---

### `db/seeds/01_locations.sql` — IIT Ropar Campus Buildings

```sql
-- Official IIT Ropar campus locations.
-- Safe to re-run (ON CONFLICT DO NOTHING).

INSERT INTO locations (id, name, code, type, floor_count, facilities, is_accessible, opening_time, closing_time)
VALUES
    (gen_random_uuid(), 'Lecture Theatre Complex', 'LTC', 'academic', 3,
        ARRAY['AC', 'Projector', 'WiFi', 'Wheelchair Ramp'], true, '07:00', '22:00'),

    (gen_random_uuid(), 'Chandrabhaga Library', 'LIB', 'academic', 2,
        ARRAY['AC', 'WiFi', 'Reading Halls', 'Digital Lab'], true, '08:00', '23:00'),

    (gen_random_uuid(), 'Student Activity Block', 'SAB', 'recreational', 2,
        ARRAY['Club Rooms', 'Open Stage', 'WiFi'], true, '08:00', '22:00'),

    (gen_random_uuid(), 'Beas Hostel', 'H-BEAS', 'hostel', 4,
        ARRAY['WiFi', 'Common Room', 'Laundry'], false, NULL, NULL),

    (gen_random_uuid(), 'Satluj Hostel', 'H-SAT', 'hostel', 4,
        ARRAY['WiFi', 'Common Room', 'Laundry'], false, NULL, NULL),

    (gen_random_uuid(), 'Ravi Hostel', 'H-RAVI', 'hostel', 4,
        ARRAY['WiFi', 'Common Room', 'Laundry'], false, NULL, NULL),

    (gen_random_uuid(), 'Chenab Hostel', 'H-CHE', 'hostel', 4,
        ARRAY['WiFi', 'Common Room', 'Laundry'], false, NULL, NULL),

    (gen_random_uuid(), 'Jhelum Hostel', 'H-JHE', 'hostel', 4,
        ARRAY['WiFi', 'Common Room', 'Laundry'], false, NULL, NULL),

    (gen_random_uuid(), 'Main Mess', 'MESS-1', 'mess', 1,
        ARRAY['300-seat Capacity', 'Veg + Non-veg'], true, '07:00', '21:00'),

    (gen_random_uuid(), 'Health Centre', 'HC', 'medical', 1,
        ARRAY['OPD', 'Emergency', 'Pharmacy'], true, '09:00', '17:00'),

    (gen_random_uuid(), 'Sports Complex', 'SPX', 'sports', 1,
        ARRAY['Gym', 'Basketball', 'Badminton', 'Cricket Ground'], true, '05:30', '22:00'),

    (gen_random_uuid(), 'Administrative Block', 'ADMIN', 'administrative', 2,
        ARRAY['Dean Offices', 'T&P Cell', 'Main Office', 'WiFi'], true, '09:00', '17:30')

ON CONFLICT (code) DO NOTHING;
```

---

### `db/seeds/02_clubs.sql` — IIT Ropar Clubs Directory

```sql
INSERT INTO clubs (name, slug, category, description, founded_year, is_active, member_count, event_count)
VALUES
    ('IIT Ropar Technical Club', 'technical-club', 'technical',
        'The apex technical body at IIT Ropar, fostering innovation in robotics, AI/ML, electronics, and software.',
        2011, true, 400, 30),

    ('Coding Club', 'coding-club', 'technical',
        'Competitive programming, hackathons, and open source contributions.',
        2013, true, 250, 20),

    ('Music Club', 'music-club', 'cultural',
        'Classical and western music, band performances, and annual music nights.',
        2011, true, 120, 15),

    ('Dance Club', 'dance-club', 'cultural',
        'Classical, folk, and western dance forms. Performs at Advitiya every year.',
        2012, true, 80, 12),

    ('Photography Club', 'photography-club', 'media',
        'Campus photography, events coverage, and photowalks.',
        2013, true, 90, 10),

    ('NSS IIT Ropar', 'nss', 'social',
        'National Service Scheme unit. Community outreach, blood donation drives, and rural development.',
        2011, true, 200, 20),

    ('ISMP Body', 'ismp-body', 'other',
        'Manages the Institute Student Mentorship Programme — assigning mentors to all incoming freshers.',
        2014, true, 60, 8)

ON CONFLICT (slug) DO NOTHING;
```

---

### `db/seeds/03_quick_links.sql` — Institute Portals

```sql
INSERT INTO quick_links (title, description, url, category, is_featured, display_order, is_active)
VALUES
    ('ERP Portal', 'Academic records, course registration, grades', 'https://erp.iitrpr.ac.in', 'academic', true, 1, true),
    ('Moodle LMS', 'Course materials, assignments, and submissions', 'https://moodle.iitrpr.ac.in', 'academic', true, 2, true),
    ('T&P Cell Portal', 'Placement announcements and company schedules', 'https://placements.iitrpr.ac.in', 'placement', true, 3, true),
    ('Official Website', 'IIT Ropar main website', 'https://www.iitrpr.ac.in', 'general', true, 4, true),
    ('Library OPAC', 'Search the Chandrabhaga Library catalogue', 'https://library.iitrpr.ac.in', 'library', false, 5, true),
    ('IEEE Xplore', 'Institute-subscribed research papers', 'https://ieeexplore.ieee.org', 'library', false, 6, true),
    ('Shodhganga', 'Indian PhD thesis repository', 'https://shodhganga.inflibnet.ac.in', 'library', false, 7, true)

ON CONFLICT (url) DO NOTHING;
```

---

### `db/seeds/dev_test_users.sql` — Development Only (Never Run in Production)

```sql
-- ⚠️ DEVELOPMENT ONLY — DO NOT RUN IN PRODUCTION
-- Creates sample user accounts for local testing.

INSERT INTO users (id, email, full_name, role, department, batch, enrollment_number, status)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'student@test.iitrpr.ac.in',
        'Arjun Sharma', 'student', 'Computer Science and Engineering', '2022-2026', '2022CSB001', 'active'),

    ('00000000-0000-0000-0000-000000000002', 'faculty@test.iitrpr.ac.in',
        'Dr. Priya Verma', 'faculty', 'Electrical Engineering', NULL, NULL, 'active'),

    ('00000000-0000-0000-0000-000000000003', 'alumni@test.iitrpr.ac.in',
        'Rahul Gupta', 'alumni', 'Computer Science and Engineering', '2018-2022', NULL, 'active')

ON CONFLICT (id) DO NOTHING;
```

---

## Part 5: How to Switch Away from Supabase

If at any point you want to move to a different database provider (Neon, Railway, PlanetScale, AWS RDS, self-hosted Postgres), here is exactly what changes and what doesn't.

### What Changes (Small)

| File | What to Update |
|---|---|
| `src/lib/db/client.ts` | Replace Supabase client with a standard PostgreSQL client (e.g., `pg`, `postgres.js`, or `drizzle-orm`) |
| `.env` | Replace `SUPABASE_URL` + `SUPABASE_ANON_KEY` with `DATABASE_URL` |
| Auth system | If leaving Supabase Auth: integrate NextAuth.js or Lucia. This is the biggest change. |

### What Does NOT Change

- All SQL in `db/migrations/` — it's plain PostgreSQL, runs anywhere.
- All SQL in `db/seeds/` — same.
- All query functions in `src/lib/db/*.ts` — if you write them using plain SQL or a thin ORM, they stay the same.
- All React components and pages — they import from `@/lib/db`, not from Supabase directly.
- The database schema itself — PostgreSQL is PostgreSQL.

---

### Migration Path from Supabase to Any Postgres Host

**Step 1:** Export your data from Supabase
```bash
# From the Supabase dashboard: Settings → Database → Backups → Download
# Or via pg_dump:
pg_dump "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" \
  --data-only --no-owner -f data_export.sql
```

**Step 2:** Set up your new Postgres host and run your schema
```bash
# Apply migrations in order on the new host
psql $NEW_DATABASE_URL -f db/migrations/001_initial_schema.sql
psql $NEW_DATABASE_URL -f db/migrations/002_add_blog_indexes.sql
# ... all migrations in order
```

**Step 3:** Import the exported data
```bash
psql $NEW_DATABASE_URL -f data_export.sql
```

**Step 4:** Update `src/lib/db/client.ts` to use the new connection

**Step 5:** Change environment variables. Deploy. Done.

---

## Part 6: Golden Rules Summary

| Rule | Why |
|---|---|
| Never call `select('*')` | Always fetch only the columns your UI actually displays |
| Every schema change = a new migration file | Full history, reversible, team-shareable |
| Every migration file has a number prefix | Ordered execution is deterministic |
| Seed files must use `ON CONFLICT DO NOTHING` | Safe to re-run at any time |
| Supabase is only imported in `src/lib/db/client.ts` | One-file swap to change providers |
| All DB queries live in `src/lib/db/*.ts` | Not scattered across components |
| Every table must have RLS enabled | Security and data isolation |
| Indexes go in their own migration file | Reviewable, auditable, separate from schema |
| Never hardcode UUIDs in application code | Use DB-generated UUIDs (`gen_random_uuid()`) |
| Seed files for dev users must be clearly labelled | Prevent accidental production contamination |

---

## Part 7: Setting Up `db/README.md`

Save this as `db/README.md` so any developer (or AI agent) knows exactly what to do.

```markdown
# Database Operations

## Run All Migrations (First Time Setup)
Apply all files in `migrations/` in numbered order:
    psql $DATABASE_URL -f migrations/001_initial_schema.sql
    psql $DATABASE_URL -f migrations/002_add_blog_indexes.sql
    psql $DATABASE_URL -f migrations/003_add_rls_policies.sql
    # etc.

## Add a New Migration
1. Create: migrations/NNN_description.sql  (next available number)
2. Write your SQL.
3. Apply: psql $DATABASE_URL -f migrations/NNN_description.sql
4. Record it: INSERT INTO _migrations (filename) VALUES ('NNN_description.sql');
5. Commit the file to Git.

## Run Production Seeds (Locations, Clubs, Quick Links)
    psql $DATABASE_URL -f seeds/01_locations.sql
    psql $DATABASE_URL -f seeds/02_clubs.sql
    psql $DATABASE_URL -f seeds/03_quick_links.sql

## Run Dev Seeds (Test Users — LOCAL ONLY)
    psql $DATABASE_URL -f seeds/dev_test_users.sql

## Check Applied Migrations
    SELECT filename, applied_at FROM _migrations ORDER BY id;

## Export Current Schema
    pg_dump $DATABASE_URL --schema-only --no-owner > schema.sql
```
