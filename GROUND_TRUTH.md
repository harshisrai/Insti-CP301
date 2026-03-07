# IIT Ropar Community Platform (dep-anti) — Master Ground Truth

**Version:** 1.0 (Compiled March 2026)
**Purpose:** This is the single source of truth for all LLMs, AI agents, and developers working on this project. It synthesizes the Software Requirements Specification (SRS), the UI/UX design tokens (`ui.txt`), the project architecture (`PROJECT_GUIDE.md`), and the current real-world state of the codebase (including auth and database implementations).

**Always refer to this document before generating new code, changing architecture, or adding features.**

---

## 1. Project Philosophy & Core Rules
1. **Start simple, stay additive:** The architecture is designed to grow. Build the foundation first.
2. **The next developer is the user:** Code quality *is* user experience. Write explicitly, concisely, and cleanly.
3. **No premature optimization:** Don't cache what isn't slow. Add complexity exactly when needed.

---

## 2. Technology Stack & Architecture
- **Framework:** Next.js 16 (App Router paradigm)
- **Language:** TypeScript 5 (Strict schemas)
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS v4 (Design tokens + Dark/Light modes)
- **Icons:** Lucide React
- **Dates:** `date-fns`
- **3D Engine:** Three.js (served headlessly from `public/3d-campus/` in an iframe)

### 2.1 The 4-Layer Module Architecture
Every feature (Module) strictly follows this structure so that UI, data-fetching, and routing stay decoupled:
1. **Database Query Layer (`src/lib/db/xyz.ts`)**: 
   - Never use `select('*')`. List columns explicitly.
   - Applies mapping from PostgreSQL `snake_case` to TypeScript `camelCase` (e.g., via `mapUser`, `mapBlogPost`).
   - The *only* place `db` (Supabase client) is imported.
2. **Custom Hook Layer (`src/lib/hooks/useXyz.ts`)**: 
   - Handles localized React state (loading, error, data).
   - Calls the DB query function.
3. **Feature Component Layer (`src/components/features/xyz/`)**:
   - Complex UI combining dumb components and the hook data. e.g., `BlogList.tsx`, `BlogCard.tsx`.
4. **Route Page Layer (`src/app/(dashboard)/xyz/page.tsx`)**:
   - Thin shells (target < 25 lines). Mostly just render `PageContainer` and the Feature Component.

---

## 3. UI/UX Design System (The "Medium" Aesthetic)
The app is a Progressive Web App (PWA) built for both mobile and desktop. It is **cohesive, calm, and academic**.

### 3.1 dual Themes (Tailwind `dark` class)
- **Light Mode:** Warm, academic journal. Parchment-like backgrounds (`#f8f6f1`), ink text, gold editorial accents.
- **Dark Mode:** Deep, focused dashboard. Navy canvas (`#0a0a0f`), crisp light text, gold highlights.
- **Toggle:** Managed via an accessible toggle button, persisting to `localStorage` and respecting `prefers-color-scheme`. It uses an Anti-FOUC script in the `<head>`.

### 3.2 Typography & Semantic Tokens
- **Headings/Display:** `DM Serif Display` (authoritative, academic).
- **Body/UI:** `DM Sans` (clean, readable).
- **Monospace:** `JetBrains Mono`.

*Key Tailwind Extensions (`tailwind.config.ts` / CSS properties):*
- `bg-base`: Page backgrounds
- `bg-surface`: Cards and panels (`bg-white/90` light, `bg-white/[0.04]` dark)
- `accent-gold`: CTA, highlights (`#f59e0b`)

### 3.3 Core Reusable: GlassSurface
Cards prominently feature subtle elevation and glassmorphism.
```tsx
className="rounded-xl p-5 bg-white/90 dark:bg-white/[0.04] backdrop-blur-md border border-black/8 dark:border-white/8 shadow-sm hover:shadow-md transition-shadow motion-safe:hover:scale-[1.005]"
```

---

## 4. Authentication & Security Flow (Current Implementation)

Authentication has specific, proven architecture to handle SSR and caching complexities in Next.js 16:
- **Supabase Session Management:** 
  - Standard client sessions live in `localStorage`, which is invisible to the server.
  - **The Fix (Implemented):** `AuthContext.tsx` uses dedicated SSR routes (`/api/auth/set-cookie` and `/api/auth/clear-cookie`) to manually sync the `sb-auth-token` cookie *synchronously* during login/signup. 
- **Route Protection:** `middleware.ts` intercepts requests. If `sb-auth-token` is missing for protected `(dashboard)` routes, it redirects to `/login`.
- **Database Security (RLS):** All tables have Row Level Security. Never bypass RLS via the service role key in the client.

### 4.1 Professional DB Insertions (e.g., Profile Creation)
To avoid RLS insert blockers on signup, `signup/route.ts` uses the `db.rpc('create_user_profile', { ... })` function (Security Definer logic in SQL) instead of attempting direct `.insert()` on the `users` table.

---

## 5. Organizational Structure & Identity

### 5.1 Institutions, Boards, and Clubs
The platform strictly mirrors IIT Ropar's Students' Gymkhana hierarchy:
- **Boards:** BOST (Tech), BOCA (Culture), BOLA (Literary), BOSA (Sports), BOHA (Hostel), BOAA (Academic).
- **Extensibility:** Handled contextually in `organizations` and `user_positions` tables without hardcoded code changes.

### 5.2 Roles & PORs (Positions of Responsibility)
Users have a base `role` (`student`, `faculty`, `staff`, `alumni`, `guest`).
Users can also have multiple **PORs** (e.g., "General Secretary, BOST", "Coordinator, Advitiya"). 

### 5.3 Posting Identity
When generating ANY content (blogs, events, notices), users select a **posting identity** from a dropdown holding their base role and active PORs. This sets the post's authority (personal vs. official club announcement) via `posting_identity_id`.

---

## 6. The 15 Core Modules

1. **Authentication:** SSR synced cookies, RPC profile creation.
2. **Activity Feed (`/`):** Real-time home dashboard blending posts, blogs, events, notices.
3. **Blogs (`/blogs`):** Sub-categories like `placement`, `internship`, `faculty_insight`.
4. **Campus Marketplace (`/marketplace`):** Peer-to-peer commerce. (Cycles, books, furniture).
5. **Events (`/events`):** Includes fests (Advitiya, Zeitgeist) and club activities.
6. **Communities (`/communities`):** Public/Private interest groups.
7. **Lost & Found (`/lost-found`):** Missing item registry.
8. **Direct Messages (`/messages`):** Private chats.
9. **Notices (`/notices`):** Official institutional announcements with priority levels.
10. **Clubs & Bodies (`/clubs`):** Public directory driven by the `organizations` table.
11. **Campus Map (2D/3D):** Interactive 3D via iframe (`/public/3d-campus/`) layered *behind* DB-driven UI search/filter overlays.
12. **Quick Links (`/quick-links`):** ERP, Moodle, T&P, etc.
13. **Notifications (`/notifications`):** Future-proofed for PostgreSQL DB Triggers tracking likes/comments.
14. **User Profile (`/profile`):** Role-adaptive view handling alumni vs. faculty fields.
15. **Admin / Governance Portal:** Manages dynamic hierarchy, PORs, content moderation.

## 7. Database Conventions recap
- Add SQL migrations file for schema changes (`db/migrations/NNN_xxx.sql`). Do not edit Supabase UI directly.
- Ensure all queries return strictly typed interfaces (e.g., `BlogPost`, `Event`).
- Ensure all database snake_case reads are translated into camelCase objects for the frontend via mappers in `src/lib/db/`.
