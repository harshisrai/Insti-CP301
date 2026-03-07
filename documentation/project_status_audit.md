# IIT Ropar Community Platform — Full Status Audit

## Summary
24 route pages exist. 10 modules are functionally complete (DB → Hooks → Components → Routes). 2 sidebar links will **404**. Several UI elements are **visual shells** with no backend wiring. Below is the exact status of every feature and where a real user would hit a wall.

---

## ✅ Fully Implemented (End-to-End)

| Module | Routes | What Works |
|--------|--------|------------|
| **Auth** | `/login`, `/signup` | Email/password signup & login via Supabase. Session cookies. Redirect to `/` on success. |
| **Feed / Dashboard** (`/`) | `/` | Activity feed with post cards. RHS widgets for upcoming events, recent notices, featured blogs. |
| **Blogs** | `/blogs`, `/blogs/create`, `/blogs/[slug]` | Full CRUD. Category filtering (Placement, Internship, etc.). Posting identity support. |
| **Profile** | `/profile` | View & edit profile. Role-adaptive fields. POR/Position display. |
| **Notices** | `/notices`, `/notices/create` | List + create notices. Priority badges. Posting identity selector. |
| **Events** | `/events`, `/events/create`, `/events/[slug]` | List + create events. Detail page with organizer info. |
| **Marketplace** | `/marketplace`, `/marketplace/create`, `/marketplace/[id]` | List with sidebar category/price filters. Create listing. Detail page with mark sold/reserved/cancel. |
| **Lost & Found** | `/lost-found`, `/lost-found/report`, `/lost-found/[id]` | Report lost/found items. Filter by status/category. Detail page with claim/return actions. |
| **Clubs & Organizations** | `/clubs`, `/clubs/[slug]` | Directory with type filtering (Club, Board, Society, etc.). Detail page with office bearers + members. |
| **Communities** | `/communities`, `/communities/create`, `/communities/[slug]` | Searchable list. Create community. Detail page with posts feed + members sidebar. |
| **Campus Map** | `/map` | 2D/3D toggle via iframe from `public/maps/`. Fullscreen support. |

---

## 🔴 Will 404 (Links exist in Sidebar, no route page)

| Link | In Sidebar? | Route Exists? | Impact |
|------|------------|---------------|--------|
| `/messages` | ✅ Yes | ❌ **No** | User clicks "Messages" → **404 page** |
| `/quick-links` | ✅ Yes | ❌ **No** | User clicks "Quick Links" → **404 page** |

---

## 🟡 Visual Shells (Buttons/UI exists but does nothing)

| Element | Location | What Happens |
|---------|----------|--------------|
| **🔔 Notifications bell** | Header (top-right) | Shows a badge "3" but does nothing on click. No notification system exists. |
| **💬 Messages icon** | Header (top-right) | Button exists but goes nowhere. No DM system. |
| **🔍 Search bar** | Header (desktop) | Input exists but has no search logic wired. Typing does nothing. |
| **Image upload** | All create forms (Marketplace, Lost & Found) | Accepts **URL strings only** — no actual file upload to a storage bucket. |
| **Like / Comment counts** | Feed cards, Blog cards, Community posts | Displayed as numbers from DB, but **no like/comment actions** are wired (no button to click). |
| **View count** | Marketplace detail, Blog detail | Displayed but not incremented (the RPC function was removed). |

---

## 🟡 Partially Working (Works but with caveats)

| Feature | What Works | What Breaks |
|---------|------------|-------------|
| **Posting Identity** | Selector appears in create forms. User can pick "Post as Club X". | If user has no PORs, the selector shows nothing — works correctly but may confuse users. |
| **Auth guard** | Login/signup flow works. AuthContext provides `user`. | **No route-level auth guard** — unauthenticated users can access `/blogs/create`, `/marketplace/create` etc. The forms will fail silently (no user ID). |
| **Feed activity** | Feed displays posts from `feed_items` view/table. | Feed relies on a DB view/function `get_feed_items` — if this doesn't exist in Supabase schema, the feed shows empty (no error, just no data). |
| **Community posts** | Posts are displayed in community detail. | **No "create post" form** inside a community — posts are read-only from existing DB data. |
| **Event registration** | Registration link is displayed if provided. | No actual registration tracking in the app. Just an external link. |

---

## 🔴 Not Implemented At All

| Feature (from SRS/Task) | Phase | Status |
|--------------------------|-------|--------|
| **Notifications system** | Phase 9 | Not started. No `notifications` table queries, no real-time subscriptions. |
| **Direct Messages** | Phase 9 | Not started. No chat UI, no message DB queries. |
| **Admin Portal** | Phase 10 | Not started. No admin dashboard for managing PORs, moderation, or org management. |
| **Quick Links page** | Phase 10 | Not started. Not even a static page. |
| **Real-time updates** | Phase 9 | No Supabase realtime subscriptions. All data is fetched on mount only. |
| **Comments system** | — | Comment counts are shown but no comment UI, no comment CRUD anywhere. |
| **Like/React system** | — | Like counts displayed but no like toggle button on any content. |
| **File/Image upload** | — | No storage bucket integration. All images are URL strings. |
| **Email verification** | — | Supabase may handle this, but no UI for "verify your email" flow. |
| **Password reset** | — | No forgot password page or flow. |

---

## 🔍 Where It Breaks by User Journey

### Journey 1: New User Signs Up
1. `/signup` → ✅ Works (creates account)
2. Redirected to `/` → ✅ Feed loads
3. Clicks "Messages" → 🔴 **404**
4. Clicks "Quick Links" → 🔴 **404**
5. Clicks notification bell → 🟡 Nothing happens

### Journey 2: Student Creates Blog Post
1. `/blogs/create` → ✅ Form works
2. Submits → ✅ Blog created, redirected to `/blogs`
3. Views own blog → ✅ Detail page works
4. Wants to like/comment → 🔴 **No buttons exist**

### Journey 3: Student Sells Item
1. `/marketplace/create` → ✅ Form works
2. Submits → ✅ Listing appears
3. Buyer views detail → ✅ Info displayed
4. Buyer wants to message seller → 🔴 **No messaging system**
5. Seller marks as sold → ✅ Status updates

### Journey 4: Club Secretary Posts Notice
1. `/notices/create` → ✅ Form with posting identity
2. Posts as "Secretary of Coding Club" → ✅ Works if POR exists in DB
3. Notice appears in `/notices` → ✅ Correct

### Journey 5: Unauthenticated User
1. All `/create` and `/report` routes → 🟡 **Accessible but forms fail** (no user context)
2. Should be redirected to `/login` → 🔴 **Not enforced**

---

## Recommendations (Priority Order)
1. **Remove or stub `/messages` and `/quick-links`** from Sidebar to prevent 404s
2. **Add auth guards** to all create/report/profile routes (redirect to `/login`)
3. **Implement Phase 9** (Notifications + Messages) to make the shell buttons functional
4. **Add comments & likes** to complete the social interaction loop
5. **Implement file upload** via Supabase Storage for images
