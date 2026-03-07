# IIT Ropar Community Platform — Master Project Guide

**The single source of truth for every developer on this project.**  
Start here. Come back often. Update it as the project grows.

---

## The Philosophy (Read This First)

> **Build a foundation so solid that every new feature is just an addition — never a rewrite.**

Three rules that govern every decision in this project:

1. **Start simple, stay additive.** The architecture is designed to grow. Phase 1 gets things working. Phase 2 makes them fast. Phase 3 makes them scale. Don't skip ahead.
2. **The next developer is the user.** Code quality *is* user experience — just for the developer maintaining it at 2 AM. Name things clearly. Keep files short. Write for the person who has never seen this code before.
3. **No premature optimisation.** Don't cache what isn't slow. Don't abstract what only exists once. Add complexity exactly when you need it, not before.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | File-based routing, server components, Vercel-native |
| **Language** | TypeScript 5 | Catch bugs at compile time, self-documenting code |
| **Database / Auth / Storage** | Supabase (PostgreSQL) | One service for everything backend, easy to start, scalable |
| **Styling** | **Tailwind CSS v3** | Utility-first, no context-switching, consistent spacing/colour system |
| **Icons** | Lucide React | Tree-shakeable, consistent stroke-width, MIT license |
| **Dates** | date-fns | Lightweight, tree-shakeable, no timezone surprises |
| **Data Fetching** | SWR (added in Phase 2) | Client-side cache, background revalidation, zero config |
| **3D Map** | Three.js (served from `public/`) | Self-contained, no npm dependency issues |

### Adding Tailwind to This Project

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**`tailwind.config.js`** — configured for this project's dark theme:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // IIT Ropar brand colours — use these, not raw hex
        gold: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark:  '#d97706',
        },
        surface: {
          primary:   '#0a0a0f',
          secondary: '#0f1117',
          card:      'rgba(255,255,255,0.03)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          subtle:  'rgba(255,255,255,0.04)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: { card: '12px' },
      borderRadius: {
        card: '12px',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
```

**`globals.css`** — keep existing CSS variables for the design system, add Tailwind directives at top:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Existing CSS variables remain below — Tailwind extends them */
:root {
  --gold: #f59e0b;
  /* ... rest of existing variables */
}
```

> **Tailwind and existing CSS coexist.** Don't rewrite working CSS. Use Tailwind for new components and layouts. Gradually replace repetitive inline styles with Tailwind classes as you touch files.

---

## Repository Structure (Set This Up on Day 1, Never Move Things Later)

```
CP301/
├── db/                          ← All database SQL — never touch Supabase UI for schema
│   ├── migrations/              ← Schema changes, numbered, one file per change
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_indexes.sql
│   │   └── 003_add_rls_policies.sql
│   ├── seeds/                   ← Initial data for locations, clubs, quick links
│   │   ├── 01_locations.sql
│   │   ├── 02_clubs.sql
│   │   └── dev_test_users.sql   ← LOCAL ONLY, never run in production
│   └── README.md                ← How to run migrations and seeds
│
├── src/
│   ├── app/                     ← Routing ONLY — pages are thin shells
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/signup/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── blogs/page.tsx
│   │       ├── events/page.tsx
│   │       └── ...
│   │
│   ├── components/
│   │   ├── ui/                  ← Generic, reusable, no domain knowledge
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FilterPills.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   └── index.ts
│   │   ├── layout/              ← App chrome
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageContainer.tsx
│   │   └── features/            ← Domain UI — each feature owns its components
│   │       ├── blogs/
│   │       │   ├── BlogCard.tsx
│   │       │   ├── BlogList.tsx
│   │       │   └── BlogForm.tsx
│   │       ├── events/
│   │       │   ├── EventCard.tsx
│   │       │   └── EventList.tsx
│   │       └── ... (one folder per feature)
│   │
│   ├── lib/
│   │   ├── db/                  ← ALL database queries — the only place Supabase is used
│   │   │   ├── client.ts        ← ONLY file that imports Supabase
│   │   │   ├── blogs.ts
│   │   │   ├── events.ts
│   │   │   ├── marketplace.ts
│   │   │   ├── users.ts
│   │   │   ├── notices.ts
│   │   │   ├── communities.ts
│   │   │   ├── lost-found.ts
│   │   │   ├── messages.ts
│   │   │   ├── clubs.ts
│   │   │   ├── locations.ts
│   │   │   ├── notifications.ts
│   │   │   ├── quick-links.ts
│   │   │   └── index.ts         ← Re-exports everything
│   │   ├── hooks/               ← Data + behaviour hooks, one per domain
│   │   │   ├── useBlogs.ts
│   │   │   ├── useEvents.ts
│   │   │   └── ...
│   │   ├── types.ts             ← All TypeScript interfaces (already good)
│   │   └── utils.ts             ← Pure helpers: formatPrice, getInitials, truncate
│   │
│   ├── contexts/AuthContext.tsx
│   └── middleware.ts
│
├── .env.local                   ← Real secrets — never commit
├── .env.example                 ← Template — always commit this
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## Non-Negotiable Foundations (Get These Right Once, Never Touch Again)

These are the things set up correctly from the start. Every new feature just plugs into them.

### 1. The Only Supabase Import

```ts
// src/lib/db/client.ts
import { createClient } from '@supabase/supabase-js'

export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Rule:** `db` is the only Supabase client. Import it from `./client`. Never call `createClient()` in a component.

---

### 2. DB Query Functions — Explicit Columns, Always

```ts
// src/lib/db/blogs.ts
import { db } from './client'
import type { BlogPost } from '@/lib/types'

export async function getPublishedBlogs(category?: string, limit = 20): Promise<BlogPost[]> {
  let query = db
    .from('blog_posts')
    .select(`
      id, title, slug, excerpt, featured_image_url,
      category, company_name, role_applied,
      view_count, like_count, published_at,
      author:users(id, full_name, role, profile_picture_url)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (category && category !== 'all') query = query.eq('category', category)

  const { data, error } = await query
  if (error) throw new Error(`[getPublishedBlogs] ${error.message}`)
  return (data ?? []) as BlogPost[]
}
```

**Rules:**
- Never `select('*')` — always list columns explicitly
- Function name = verb + noun: `getPublishedBlogs`, `createMarketplaceItem`
- Always throw a named error on failure

---

### 3. Custom Hooks — Separating Data from UI

```ts
// src/lib/hooks/useBlogs.ts
import { useState, useEffect } from 'react'
import { getPublishedBlogs } from '@/lib/db'
import type { BlogPost } from '@/lib/types'

export function useBlogs(category?: string) {
  const [blogs, setBlogs]   = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true); setError(null)
        const data = await getPublishedBlogs(category)
        if (!cancelled) setBlogs(data)
      } catch (err) {
        if (!cancelled) setError('Could not load blogs. Try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }   // cleanup on unmount/re-run
  }, [category])

  return { blogs, loading, error }
}
```

---

### 4. Thin Pages

```tsx
// src/app/(dashboard)/blogs/page.tsx  — target: always under 20 lines
import { BlogList } from '@/components/features/blogs/BlogList'
import { PageContainer } from '@/components/layout/PageContainer'

export default function BlogsPage() {
  return (
    <PageContainer title="📝 Blogs" subtitle="IIT Ropar knowledge base">
      <BlogList />
    </PageContainer>
  )
}
```

---

### 5. Reusable UI Primitives with Tailwind

```tsx
// src/components/ui/SkeletonCard.tsx
export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="rounded-card border border-border bg-surface-card p-5 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-white/5 rounded mb-2 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  )
}

// src/components/ui/EmptyState.tsx
export function EmptyState({ icon, title, description }: {
  icon: string; title: string; description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-base font-semibold text-white/70">{title}</h3>
      {description && <p className="text-sm text-white/40 max-w-xs">{description}</p>}
    </div>
  )
}

// src/components/ui/Badge.tsx
type BadgeVariant = 'gold' | 'blue' | 'green' | 'red' | 'neutral'
const variants: Record<BadgeVariant, string> = {
  gold:    'bg-gold/15 text-gold border border-gold/25',
  blue:    'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  green:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  red:     'bg-red-500/15 text-red-400 border border-red-500/25',
  neutral: 'bg-white/5 text-white/50 border border-white/10',
}
export function Badge({ label, variant = 'neutral' }: { label: string; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}

// src/components/ui/FilterPills.tsx
export function FilterPills({ options, active, onChange, labels }: {
  options: string[]
  active: string
  onChange: (v: string) => void
  labels?: Record<string, string>
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all duration-150 border
            ${active === opt
              ? 'bg-gold text-black border-gold'
              : 'bg-white/5 text-white/60 border-border hover:bg-white/10 hover:text-white'
            }`}
        >
          {labels?.[opt] ?? opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  )
}
```

---

### 6. `PageContainer` Layout Wrapper

```tsx
// src/components/layout/PageContainer.tsx
export function PageContainer({ title, subtitle, action, children }: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-white/50 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}
```

---

### 7. Utility Functions — Write Once, Use Everywhere

```ts
// src/lib/utils.ts

export const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

export const truncate = (text: string, max: number) =>
  text.length <= max ? text : text.slice(0, max) + '...'

export const formatPrice = (n: number) =>
  `₹${n.toLocaleString('en-IN')}`

export const getRoleLabel = (role: string): string => ({
  student: 'Student', faculty: 'Faculty', staff: 'Staff',
  alumni: 'Alumni', guest: 'Guest',
}[role] ?? role)

export const formatRelativeDate = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60)   return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}
```

---

## Module Guide — What to Build & Exactly How to Build It

Each module follows the same **4-layer pattern**:
`Route (page.tsx)` → `Feature Component` → `Custom Hook` → `DB Query Function`

---

### M1 — Activity Feed `/`

**What:** Landing page post-login. Shows 20 most recent community posts with author info, source type badges, and like counts. Quick action cards for common tasks.

**IIT Ropar context:** Posts can be plain updates, or sourced from other modules (blog published, event created, notice posted). The feed is the community heartbeat.

**How to build:**

```
src/lib/db/feed.ts        → getFeedPosts(limit)
src/lib/hooks/useFeed.ts  → useFeed()
src/components/features/feed/
  FeedPost.tsx            → Single post card
  FeedList.tsx            → List + loading state
  QuickActions.tsx        → "Write Blog", "Sell Item", "Events", "Communities" cards
src/app/(dashboard)/page.tsx → thin shell
```

**Key DB query:**
```ts
// Grab only what the card shows
.select('id, content, source_type, media_urls, like_count, comment_count, created_at, author:users(full_name, role, profile_picture_url)')
.eq('is_public', true)
.order('created_at', { ascending: false })
.limit(20)
```

---

### M2 — Blogs `/blogs`

**What:** Knowledge base for Placements, Internships, Faculty Insights, Alumni stories, Research.

**IIT Ropar context:**
- `placement` blogs: student documents their interview with a company (Google, Microsoft, etc.). Includes company name, role, and round breakdown. Most-read content during Oct–Nov placement season.
- `internship` blogs: SIP (Summer Internship Programme) reports.
- `faculty_insight`: professor sharing course design or research area.
- `alumni_experience`: IIT Ropar graduate writing about life after college.

**Categories:** `all` | `placement` | `internship` | `faculty_insight` | `alumni_experience` | `research` | `general`

**How to build:**
```
src/lib/db/blogs.ts
  getPublishedBlogs(category?, limit)
  getBlogBySlug(slug)
  createBlog(data)

src/lib/hooks/useBlogs.ts

src/components/features/blogs/
  BlogCard.tsx       → image, category badge, title, company (if placement), author, views
  BlogList.tsx       → filter pills + search + cards grid + load state
  BlogForm.tsx       → create/edit form, shows company fields only when category=placement

src/app/(dashboard)/blogs/
  page.tsx           → thin
  create/page.tsx    → thin
  [slug]/page.tsx    → thin
```

**BlogCard Tailwind template:**
```tsx
<div className="bg-surface-card border border-border rounded-card overflow-hidden hover:border-white/20 transition-all duration-200 cursor-pointer group">
  {blog.featured_image_url && (
    <div className="h-40 overflow-hidden">
      <Image src={blog.featured_image_url} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
  )}
  <div className="p-5">
    <div className="flex items-center gap-2 mb-3">
      <Badge label={blog.category} variant="blue" />
      {blog.company_name && <Badge label={blog.company_name} variant="gold" />}
    </div>
    <h3 className="font-semibold text-white text-sm leading-snug mb-2 line-clamp-2">{blog.title}</h3>
    <p className="text-xs text-white/50 line-clamp-2 mb-4">{blog.excerpt}</p>
    <div className="flex items-center justify-between text-xs text-white/40">
      <span>{blog.author?.full_name}</span>
      <span>{blog.view_count} views</span>
    </div>
  </div>
</div>
```

---

### M3 — Marketplace `/marketplace`

**What:** Campus buy/sell board. Students sell textbooks, cycles, electronics, furniture.

**IIT Ropar context:** Bicycles are top-traded item (campus requires cycling). Semester-end is peak listing time (graduating students clearing rooms). Textbooks trade heavily between batches. Prices in Indian Rupees (₹).

**Categories:** `Books` | `Electronics` | `Furniture` | `Clothing` | `Cycle` | `Stationery` | `Sports` | `Other`

**Conditions:** `New` | `Like New` | `Good` | `Fair` | `Poor`

**Key fields:** `price` (₹), `is_negotiable`, `condition`, `pickup_location`, `images[]`, `status` (`available` shown; `reserved`/`sold`/`cancelled` hidden)

**How to build:**
```
src/lib/db/marketplace.ts
  getAvailableItems(category?, limit)
  getItemById(id)
  createItem(data)

src/components/features/marketplace/
  ItemCard.tsx   → image, price (formatPrice), condition badge, negotiable tag, seller
  ItemList.tsx   → filter + search + grid
  ItemForm.tsx   → create listing

src/app/(dashboard)/marketplace/
  page.tsx, create/page.tsx, [id]/page.tsx
```

---

### M4 — Events `/events`

**What:** All campus events — academic, cultural, sports, club activities.

**IIT Ropar event types:**

| Type | Description |
|---|---|
| `ismp` | ISMP (Institute Student Mentorship Programme) events — batch orientation, mentor-mentee meets. Organised by the ISMP body. Target batch = incoming freshers. |
| `workshop` | Skill sessions — AI/ML, CAD, PCB design, hackathons |
| `seminar` | Guest lectures, Alumni Talk Series, Research seminars |
| `competition` | Coding contests, Robocon, Design Fiesta, business plan competitions |
| `cultural` | Advitiya (annual fest), cultural nights, open mics |
| `sports` | IHL (Inter-Hostel League) — football, cricket, badminton across hostel teams |
| `club_activity` | Events by registered clubs |

**Key fields:** `type`, `start_time`, `registration_link`, `registration_fee` (₹0 = free), `organizing_body`, `target_batches[]`, `max_participants`, `meeting_link` (for online)

**How to build:**
```
src/lib/db/events.ts
  getUpcomingEvents(type?, limit)
  getEventBySlug(slug)

src/components/features/events/
  EventCard.tsx   → poster, type badge, date/time, venue, fee badge, organiser
  EventList.tsx   → filter by type + all above

src/app/(dashboard)/events/
  page.tsx, [slug]/page.tsx
```

---

### M5 — Communities `/communities`

**What:** Self-organised interest groups. Public or private with approval.

**Key fields:** `is_public`, `requires_approval`, `member_count`, `post_count`

**How to build:**
```
src/lib/db/communities.ts
  getPublicCommunities(limit)
  joinCommunity(communityId, userId)
  createCommunity(data)

src/components/features/communities/
  CommunityCard.tsx   → icon/initial, name, visibility badge, member count, join button
  CommunityList.tsx   → list + create inline form
  CommunityFeed.tsx   → posts within a community (Phase 2)
```

---

### M6 — Lost & Found `/lost-found`

**What:** Report missing items or log found items. Tabs: Lost | Found.

**IIT Ropar context:** Most common: water bottles, ID cards, laptop chargers, hostel room keys, earphones. Common locations: Chandrabhaga Library, SAB, Sports Complex.

**Status flow:** `lost` → (finder reports it) → `found` → (owner contacts) → `claimed` → `returned`

**Category list:** `Electronics` | `Documents` | `Accessories` | `Clothing` | `Keys` | `Wallet` | `Bottle` | `Other`

**How to build:**
```
src/lib/db/lost-found.ts
  getLostItems(category?)
  getFoundItems(category?)
  createReport(data)

src/components/features/lost-found/
  ItemReport.tsx   → card showing item, location, date, contact
  ReportForm.tsx   → tabs: Lost / Found, form fields
```

---

### M7 — Direct Messages `/messages`

**What:** One-on-one private conversations. Used for buyer↔seller, mentor↔mentee (ISMP), general contact.

**Key tables:** `conversations` (pairs) + `messages` (individual messages)

**Real-time** (Phase 2): Supabase Realtime subscription fires on new message insert.

**How to build:**
```
src/lib/db/messages.ts
  getConversations(userId)
  getMessages(conversationId)
  sendMessage(conversationId, content)

src/components/features/messages/
  ConversationList.tsx   → list of chats, last message preview, unread count
  ChatWindow.tsx         → bubbles, sent right-aligned (gold), received left-aligned

Phase 1: load on open, manual refresh
Phase 2: add Realtime subscription in ChatWindow.tsx for live updates
```

---

### M8 — Notices `/notices`

**What:** Official institute announcements with priority levels and pinning.

**IIT Ropar notice categories:**
- `Academic` — exam schedules, drop deadlines, academic calendar
- `Administrative` — water supply, transport, facilities
- `Placement` — T&P Cell announcements, PPT schedules, dress code
- `Hostel` — HMC notices, hostel nights, room swapping
- `Sports` — IHL results, gym timings, sports events
- `General` — campus-wide

**Priority:** `urgent` (red) → `high` (gold) → `medium` (blue) → `low` (green)

**Rules:** `is_pinned = true` always appears first. `valid_until` date hides expired notices. `attachments[]` links to PDFs.

**How to build:**
```
src/lib/db/notices.ts
  getActiveNotices(category?, limit)

src/components/features/notices/
  NoticeCard.tsx   → pinned badge, priority badge, category, title, content, poster name, valid date
  NoticeList.tsx   → category pills + search + list
```

---

### M9 — Clubs & Bodies `/clubs`

**What:** Directory of all registered IIT Ropar clubs.

**Categories:** `Technical` | `Cultural` | `Sports` | `Social` | `Media` | `Other`

**Notable clubs to seed:** Technical Club, Coding Club, Music Club, Dance Club, Photography Club, NSS, ISMP Body

**How to build:**
```
src/lib/db/clubs.ts
  getClubs(category?)

src/components/features/clubs/
  ClubCard.tsx   → logo/initial, name, category, founded year, member count, email, Instagram link
  ClubList.tsx   → category filter + search + auto grid
```

---

### M10 — Campus Map `/map`

**What:** Two layers working together:
1. **3D background** — Three.js campus model in a full-screen iframe (`/public/3d-campus/`). Loaded in headless mode (own header/sidebar hidden via `.headless` class injected on load).
2. **DB overlay** — Left sidebar listing campus buildings with search + category filter. Right panel with details on selection.

**Notable locations to seed:** LTC, Chandrabhaga Library, SAB, Beas/Satluj/Ravi/Chenab/Jhelum hostels, Main Mess, Health Centre, Sports Complex, Admin Block, Faculty Residences.

**Location fields:** `name`, `code`, `type`, `facilities[]`, `is_accessible`, `opening_time`, `closing_time`, `floor_count`

**Architecture note:** The iframe is `position: fixed; z-index: 0`. The overlay panel is `position: relative; z-index: 1; pointer-events: none` with `pointer-events: auto` on interactive elements only — this lets users interact with the 3D model through transparent gaps.

---

### M11 — Quick Links `/quick-links`

**What:** Curated directory of IIT Ropar portals. Featured links (gold border, top section) + regular links.

**Key portals to seed:** ERP Portal, Moodle, T&P Cell, Official Website, Library OPAC, IEEE Xplore, Shodhganga

**Ordering:** `display_order` (manual) then `click_count` (popularity) descending.

---

### M12 — Notifications `/notifications`

**What:** Personal notification centre. Shows activity related to the user.

**Types:** `comment` | `like` | `event` | `notice` | `marketplace` | `general`

**Phase 1:** Read/mark as read UI (already implemented).
**Phase 2:** Add PostgreSQL triggers that write to `notifications` table automatically when events happen (urgent notice posted, someone likes a blog, etc.).

```sql
-- Phase 2: trigger example for urgent notices
CREATE TRIGGER trg_notify_urgent
AFTER INSERT ON notices
FOR EACH ROW
WHEN (NEW.priority IN ('urgent','high') AND NEW.is_active = true)
EXECUTE FUNCTION fn_notify_urgent_notice();
```

---

### M13 — User Profile `/profile`

**What:** View + edit own profile. Role-adaptive fields.

**Student fields:** Name, Email, Phone, Department, Batch, Enrollment No., Bio, LinkedIn  
**Faculty fields:** Name, Email, Dept, Designation, Employee ID, Bio, LinkedIn  
**Alumni fields:** Name, Dept, Batch, Current Org, Current Position, LinkedIn

**Phase 2:** Profile picture upload via Supabase Storage. Store URL in `profile_picture_url`. Fallback = `getInitials(full_name)` avatar.

---

## Database: The Essential Rules

*(Full guide in `DB_GUIDE.md`)*

**The short version:**

1. **Every schema change = a new `db/migrations/NNN_description.sql` file.** No more "I edited the table in Supabase UI". Only SQL files, committed to Git.

2. **Seeds are idempotent.** Use `ON CONFLICT ... DO NOTHING`. Safe to re-run at any time.

3. **Indexes are a one-time SQL migration.** Run once, never think about them again:
```sql
-- db/migrations/002_add_indexes.sql
CREATE INDEX idx_blog_posts_cat    ON blog_posts(category) WHERE status='published';
CREATE INDEX idx_events_type       ON events(type) WHERE is_published=true;
CREATE INDEX idx_notifs_user       ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_mktplace_status   ON marketplace_items(status, category);
CREATE INDEX idx_messages_conv     ON messages(conversation_id, created_at DESC);
```

4. **RLS on every table.** Non-negotiable security:
```sql
-- db/migrations/003_add_rls_policies.sql
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_published" ON blog_posts FOR SELECT USING (status='published');
CREATE POLICY "own_modify"     ON blog_posts FOR ALL   USING (auth.uid() = author_id);
-- Repeat for every table
```

---

## Phased Roadmap (Start Here, Scale Naturally)

### ✅ Phase 1 — Working (Current State)

All 14 module pages exist. Auth works. 3D map integrated. Basic data fetch.  
**Next step:** Apply the 4-layer pattern. Set up DB layer. Seed the database.

| Task | Effort |
|---|---|
| Run migration + index SQL | 1 hour |
| Write RLS policies | 2 days |
| Set up `src/lib/db/` query files | 1 day |
| Seed locations, clubs, quick links | 2 hours |
| Add `.env.example` and update README | 30 min |
| Build `src/components/ui/` (SkeletonCard, EmptyState, FilterPills, Badge) | 3 hours |
| Replace `<img>` with `<Image>` | 1 hour |

**Goal:** Stable, secure, correct. Handles 100 users without issues.

---

### ⚡ Phase 2 — Fast & Complete (~4 weeks after Phase 1)

Add the missing pieces and real-time behaviour.

| Task | Effort |
|---|---|
| Wire Supabase Realtime into Messages | Half day |
| Add notification DB triggers | 2 days |
| Feed post creation UI | 1 day |
| Community detail page + inner posts | 2 days |
| Event registration flow | 2 days |
| Add SWR for high-traffic pages (Feed, Events, Blogs) | 1 day |
| Profile picture upload (Supabase Storage) | 1 day |
| Admin moderation panel | 1 week |

**Goal:** Feature-complete. Handles 1,000 users comfortably.

---

### 🚀 Phase 3 — Scale (When You Actually Need It)

Only do this when you observe real performance problems in production metrics.

| Task | Trigger |
|---|---|
| Cursor-based pagination (replace `.limit()`) | Table > 1,000 rows, scroll lags |
| CDN caching for static lists (clubs, locations) | Same data fetched 500+ times/hour |
| Supabase Pro upgrade | Approaching free tier limits |
| Image compression pipeline | Bandwidth costs noticeable |
| `next/font` + bundle analysis | Lighthouse score drops below 80 |

**Goal:** 10,000 users, sub-200ms pages, under $50/month infrastructure cost.

---

## Dev Conventions: The Quick Reference

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `BlogCard.tsx` |
| Hooks | `use` + PascalCase | `useBlogs.ts` |
| DB functions | verb + noun | `getPublishedBlogs()` |
| Utilities | verb + noun | `formatPrice()`, `truncate()` |
| CSS (Tailwind) | class name reference | `rounded-card`, `bg-surface-card` |
| DB tables | snake_case | `blog_posts`, `lost_found_items` |
| Migration files | `NNN_snake_case.sql` | `003_add_rls_policies.sql` |
| Constants | UPPER_SNAKE_CASE | `const MAX_ITEMS = 20` |

### Pre-Commit Checklist

```
[ ] No select('*') in any query
[ ] New env vars added to .env.example
[ ] Schema change? → new migration file created and applied
[ ] Page file is under ~25 lines
[ ] New UI pattern? → added to src/components/ui/, not in the page
[ ] npm run build passes with no errors
```
