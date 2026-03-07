# Scalability Analysis: Can This Project Handle 10,000 Users?

**Project:** IIT Ropar Community Platform  
**Date:** March 2026  
**Verdict up front:** ✅ **Keep the stack. Do NOT rewrite from scratch.** The architecture is sound. What needs fixing is how it's *used*.

---

## Part 1: The Short Answer

| Question | Answer |
|---|---|
| Can Next.js + Supabase handle 10K users? | **Yes, comfortably.** |
| Will the *current* code break at 10K users? | **Yes, in specific places.** |
| Do we need to throw everything away and restart? | **No.** |
| What's the estimated effort to make it scale-ready? | **4–6 weeks of targeted improvements.** |

---

## Part 2: Why the Current Stack is Fine

### What Supabase Actually Supports

| Plan | DB Storage | API Requests | Monthly Active Users | Realtime Connections |
|---|---|---|---|---|
| Free | 500 MB | 500K/month | Unlimited | 200 simultaneous |
| Pro (~$25/mo) | 8 GB | Unlimited | Unlimited | 500 simultaneous |
| Team (~$599/mo) | Custom | Unlimited | Unlimited | Custom |

IIT Ropar has ~7,500 students + faculty + staff. Not all will be active simultaneously. At peak (e.g., Day-1 placements or Advitiya registrations), you might see 500–1,000 concurrent users. **Supabase Pro handles this without breaking a sweat.**

PostgreSQL (the database Supabase uses) routinely handles millions of rows and thousands of concurrent queries at companies worldwide. It is not the bottleneck.

### What Next.js Actually Supports

Next.js is used by companies like Vercel, TikTok, Twitch, and hundreds of enterprise apps at 10M+ user scale. The App Router architecture this project uses is designed for performance. **Next.js is not the bottleneck.**

---

## Part 3: What Will Actually Break at 10K Users

These are the real problems, ordered from most critical to least.

---

### 🔴 Critical: No Database Query Optimization

#### Problem
Every page hits the database fresh on every load. There is no caching, no smart pagination, and some queries fetch unnecessary columns.

**Example from the current code (Blogs page):**
```js
// This runs every time any user visits /blogs
let query = supabase.from('blog_posts').select('*')  // ← grabs ALL columns
    .order('published_at', { ascending: false })
    .limit(20)
```
`select('*')` fetches every column including the full blog `content` (which could be 10KB per post). For a listing page, you only need the title, excerpt, author, and image.

**At scale:** 200 users visiting /blogs simultaneously = 200 parallel DB queries hitting the same table, fetching 200x your actual data need.

#### Fix
```js
// Only fetch what the card actually displays
supabase.from('blog_posts')
  .select('id, title, slug, excerpt, featured_image_url, category, company_name, author_id, view_count, like_count, published_at, author:users(full_name, role)')
  .order('published_at', { ascending: false })
  .limit(20)
```
This is a 5-minute fix per page that can reduce query payload by 60–80%.

---

### 🔴 Critical: No Database Indexes

#### Problem
Without indexes, every search and filter requires PostgreSQL to scan the **entire table** row by row. At 10K users generating blogs, events, marketplace listings, and notices, tables will have thousands of rows.

**Columns that MUST have indexes (they are currently queried frequently but likely unindexed):**

| Table | Column | Used For |
|---|---|---|
| `blog_posts` | `category`, `status`, `published_at` | Filter + sort on every page load |
| `events` | `type`, `start_time`, `is_published` | Filter + upcoming sort |
| `marketplace_items` | `category`, `status`, `created_at` | Filter + time sort |
| `notices` | `category`, `is_active`, `is_pinned` | Filter + pinned sort |
| `notifications` | `user_id`, `is_read` | Per-user notification reads |
| `messages` | `conversation_id`, `created_at` | Chat history |
| `feed_posts` | `created_at`, `is_public` | Feed timeline |

#### Fix
Add these to your Supabase SQL editor or migration file:
```sql
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_start_time ON events(start_time) WHERE is_published = true;
CREATE INDEX idx_marketplace_status ON marketplace_items(status, category);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_notices_active ON notices(is_active, category, is_pinned);
```
This is a one-time SQL migration. Immediate, dramatic performance improvement.

---

### 🔴 Critical: No Row Level Security (RLS) Policy Audit

#### Problem
Supabase uses PostgreSQL's Row Level Security to control who can see and edit which rows. Without proper RLS policies, **any authenticated user could potentially read or modify any row in any table** through the Supabase client-side API.

For example, without an RLS policy, a student could theoretically read another student's private messages, or edit someone else's marketplace listing.

#### Fix
Every table needs RLS policies. Examples:
```sql
-- Users can only update their own profile
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- Anyone can read published blogs
CREATE POLICY "blogs_read_published" ON blog_posts FOR SELECT USING (status = 'published');

-- Only the author can update/delete their blog
CREATE POLICY "blogs_update_own" ON blog_posts FOR UPDATE USING (auth.uid() = author_id);

-- Users can only read their own messages
CREATE POLICY "messages_own" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can only read their own notifications
CREATE POLICY "notifs_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
```
This is a security requirement, not just a scalability one. **Must be done before launch.**

---

### 🟡 Important: No Caching — Every Load Hits the DB

#### Problem
When the home feed, events list, or notices page is loaded by 100 different users, the exact same query is executed 100 times. The data almost certainly hasn't changed between those 100 requests.

#### Fix: Two-tiered approach

**Option A — Add SWR or React Query (recommended for this project)**

SWR is a React hook from Vercel that caches API results in the browser. It re-fetches in the background but immediately shows cached data:

```bash
npm install swr
```

```tsx
// pages like /events that rarely change — cache for 60 seconds in the browser
import useSWR from 'swr'

const { data: events } = useSWR('events-list', () =>
  supabase.from('events').select('...').limit(20),
  { refreshInterval: 60_000 }  // re-check every 60s
)
```

This alone prevents the same DB query from running 100 times for 100 simultaneous users on static-ish content.

**Option B — Supabase Edge Functions + Caching (for later)**

For heavily-trafficked endpoints, move logic to Supabase Edge Functions and cache responses at the CDN level. This is complex and not needed until you're seeing actual performance problems.

---

### 🟡 Important: Image Loading is Unoptimized

#### Problem
All images use plain `<img>` tags. This means:
- Full-size images are downloaded even on mobile.
- No lazy loading of off-screen images.
- No WebP conversion.
- Marketplace item images, blog featured images, and profile pictures all load at full resolution.

At 10K users, this causes high bandwidth costs and slow page loads.

#### Fix
Replace `<img>` with Next.js `<Image>`:

```tsx
// Before
<img src={blog.featured_image_url} alt={blog.title} />

// After — automatic WebP, lazy load, resize based on screen
import Image from 'next/image'
<Image src={blog.featured_image_url} alt={blog.title} width={400} height={220} className="rounded" />
```

Also configure `next.config.js` to allow your image domains:
```js
module.exports = {
  images: {
    remotePatterns: [{ hostname: '*.supabase.co' }]
  }
}
```

---

### 🟡 Important: Real-time Messaging is Not Actually Real-time

#### Problem
The current messaging system requires a **page refresh to see new messages**. This is a fundamental broken feature, not a scaling issue per se — but at scale, users refreshing to check messages creates unnecessary load.

#### Fix
Supabase provides Realtime subscriptions. Add this to the messages page:

```tsx
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      setMessages(prev => [...prev, payload.new as Message])
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [conversationId])
```

This is ~15 lines of code. A significant feature improvement for minimal effort.

---

### 🟡 Important: Notification System Has No Backend Triggers

#### Problem
The `notifications` table exists and the UI to read notifications is implemented. But **nothing ever writes to this table.** When someone likes a blog, follows up on a marketplace item, or a high-priority notice is posted — no notification is generated.

#### Fix
Use Supabase Database Functions (PL/pgSQL triggers):

```sql
-- Example: Auto-notify when a high-priority notice is posted
CREATE OR REPLACE FUNCTION notify_on_urgent_notice()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all users (could be filtered by role)
  INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
  SELECT id, 'New Urgent Notice', NEW.title, 'notice', 'notice', NEW.id
  FROM users
  WHERE status = 'active';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_urgent_notice
AFTER INSERT ON notices
FOR EACH ROW
WHEN (NEW.priority IN ('urgent', 'high') AND NEW.is_active = true)
EXECUTE FUNCTION notify_on_urgent_notice();
```

These triggers run **inside the database**, not in your application code. They're fast, reliable, and don't add load to your Next.js server.

---

### 🟢 Minor: No Rate Limiting on API Routes

#### Problem
Any user (or bot) can spam the API endpoints (e.g., create 1000 marketplace listings). The middleware only checks authentication, not rate limiting.

#### Fix
Supabase Pro includes built-in API rate limiting per IP. For application-level rate limiting, add it to the Next.js middleware:

```ts
// Simple in-memory rate limiter (for single-node deployments)
// For multi-node: use Upstash Redis rate limiting
import { Ratelimit } from '@upstash/ratelimit'
```

For the current scale, Supabase's built-in rate limiting is sufficient.

---

### 🟢 Minor: Bundle Size & CSS

#### Problem
`globals.css` is a single massive file (~2000+ lines). While CSS doesn't add server load, it does affect initial page load time for users.

#### Fix (Low Priority)
- Split into module-level CSS files.
- Use `next/font` instead of Google Fonts CDN import.
- Run `next build && next analyze` to see bundle composition.

---

## Part 4: What to Build vs. Scrap

### ✅ Keep As-Is (Solid Foundation)

| What | Why |
|---|---|
| Next.js App Router architecture | Correct, modern, scalable |
| Supabase for auth + database | Right choice for this scale |
| TypeScript types in `src/lib/types.ts` | Clean, comprehensive data model |
| Route group structure `(auth)` / `(dashboard)` | Correct separation of concerns |
| CSS variables + glassmorphism design system | Well-structured, consistent |
| Sidebar + Header layout pattern | Solid, responsive |
| All 14 module page implementations | Solid base, just needs query optimization |
| 3D Campus Map integration | Working architecture |

### ⚠️ Keep But Fix (Technical Debt)

| What | Fix Required |
|---|---|
| All Supabase queries | Change `select('*')` → explicit column selection |
| Database | Add indexes |
| All tables | Write and enforce RLS policies |
| All list pages | Add cursor-based pagination (for tables > 100 rows) |
| Images | Replace `<img>` with Next.js `<Image>` |
| Messaging | Add Supabase Realtime subscription |
| Notifications | Add DB triggers to generate notifications |
| Activity Feed stats | Replace hardcoded numbers with live DB counts |

### ❌ Missing — Build These

| What | Effort | Priority |
|---|---|---|
| Notification trigger system | 1–2 days | High |
| Feed post creation UI | 1 day | High |
| Event registration + confirmation | 2–3 days | Medium |
| Community detail + inner post feed | 2–3 days | Medium |
| Admin moderation dashboard | 1 week | Medium |
| DB seed scripts | 1 day | High (needed for demo/testing) |
| Club detail page | 1 day | Low |
| Profile picture upload (Supabase Storage) | 1 day | Medium |

---

## Part 5: The Migration Roadmap (4–6 Weeks)

### Week 1–2: Foundation (Do This First, No Excuses)

**Goal: Make the current code safe and efficient.**

- [ ] Run the index creation SQL (30 minutes, immediate impact)
- [ ] Write and apply RLS policies for all tables (2–3 days)
- [ ] Change all `select('*')` to explicit columns (1 day, one file at a time)
- [ ] Upgrade to Supabase Pro plan (needed before any real users)
- [ ] Enable Supabase Connection Pooling (PgBouncer) — toggle in Supabase dashboard settings

### Week 3: Real-time & Notifications

**Goal: Make the product actually feel alive.**

- [ ] Wire Supabase Realtime into Direct Messages
- [ ] Write DB trigger functions for notifications (urgent notices, likes, comments)
- [ ] Add Feed Post creation UI (students should be able to post)
- [ ] Fix Community detail page stub

### Week 4: UX Quality & Performance

**Goal: Fast for all users on any device.**

- [ ] Replace all `<img>` with `<Image>` from Next.js
- [ ] Add SWR for data fetching on high-traffic pages (Feed, Events, Blogs)
- [ ] Implement cursor-based pagination on all list pages
- [ ] Add `next/font` to load Inter font from Next.js (faster than CDN)

### Week 5–6: Missing Features

**Goal: Complete the core product.**

- [ ] Event registration flow (register button → confirmation email via Supabase)
- [ ] Admin dashboard (view/delete reports, manage users, pin notices)
- [ ] DB seed scripts for locations, clubs, quick links
- [ ] Profile picture upload using Supabase Storage

---

## Part 6: Architecture at 10K Users (Target State)

```
User Browser
    │
    ▼
Vercel CDN (Next.js deployment)
    │ Static assets cached at CDN edge
    │ Server components run at Vercel serverless functions
    ▼
Next.js App Router
    │ SWR caches API responses in browser (60–300s)
    │ Server actions send mutations
    ▼
Supabase Pro (PgBouncer connection pooler)
    │ PostgreSQL with proper indexes + RLS
    │ Realtime channels for messages + feed
    │ Storage for profile pictures, event posters
    │ Auth for sessions
    │ DB Triggers for notifications
    ▼
PostgreSQL (Supabase managed)
    Indexed tables, RLS enforced, triggers active
```

**Cost estimate at 10K users (fully active):**

| Service | Plan | Cost/month |
|---|---|---|
| Supabase | Pro | ~$25 |
| Vercel | Hobby (free) or Pro | $0–$20 |
| **Total** | | **$25–$45/month** |

This is completely affordable for an IIT Ropar institute project.

---

## Part 7: When Would You Need to Reconsider the Stack?

You'd only need to reconsider the stack if:

1. **You hit 100K+ concurrent users** — unlikely for an institute platform.
2. **You need ML-driven recommendations** — would require a separate Python backend.
3. **You need video streaming** — would need a dedicated video CDN (Mux, Cloudflare Stream).
4. **You need sub-100ms realtime for a multiplayer feature** — Supabase Realtime adds ~50–200ms latency which is fine for chat but not for gaming.

For IIT Ropar's use case, none of these apply. **This stack will comfortably last for the entire lifetime of this product.**

---

## Summary: What to Tell Your Team

> "The codebase architecture is correct and the stack was a good choice. We do not need to rewrite anything. The critical work is: add database indexes, write Row Level Security policies, and fix queries to not over-fetch data. After that, add Realtime messaging, wire up notification triggers, and implement the missing features. 4–6 weeks of focused work on the right things and this product is ready for all 10,000 users of IIT Ropar."
