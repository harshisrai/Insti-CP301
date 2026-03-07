# Coding Standards & Repository Structure Guide

**Project:** IIT Ropar Community Platform  
**Date:** March 2026  
**Who this is for:** Every developer (current or future) who touches this codebase.

> **One rule above all:** Any new developer should be able to open this repo, read this file, and start making meaningful contributions without asking anyone anything.

---

## Part 1: What the Current Codebase Gets Right (Keep These)

Before listing what to improve, it's important to acknowledge what's already good.

| What | Why It's Good |
|---|---|
| TypeScript strict types in `src/lib/types.ts` | Self-documenting. New devs instantly understand data shapes. |
| Route group separation `(auth)` / `(dashboard)` | Clean, Next.js-idiomatic. No mixing concerns. |
| CSS custom properties (variables) in `globals.css` | Change one color variable, it updates everywhere. |
| Single `AuthContext` for auth state | No prop-drilling, no repeated auth logic in components. |
| Consistent UI patterns across all pages | Search bar + filter pills + card grid is uniform everywhere. |

---

## Part 2: Current Problems (Be Honest About What to Fix)

Here's an honest audit of what makes the code hard to maintain right now:

### Problem 1: Business Logic Lives Inside UI Components

Every `page.tsx` file currently does three things at once:
- Fetches data from Supabase
- Transforms/filters it
- Renders it to the screen

```tsx
// ❌ Current pattern — everything in one 150-line component
export default function BlogsPage() {
  const supabase = createClient()           // → data access
  const [blogs, setBlogs] = useState([])

  async function loadBlogs() {
    const { data } = await supabase         // → business logic
      .from('blog_posts').select('*')
  }

  return <div>...150 lines of JSX...</div>  // → UI rendering
}
```

When a new developer opens `BlogsPage`, they have to mentally separate these three concerns. When a bug appears, they can't tell if it's a data problem or a UI problem.

---

### Problem 2: No Shared/Reusable UI Components

Every page builds its own card, badge, search bar, and loading skeleton from scratch using raw `<div>` tags and inline styles. If you want to change how a card looks, you have to change it in 14 different page files.

---

### Problem 3: Pages Are Too Long

The dashboard home `page.tsx` is 236 lines. The messages `page.tsx` is 146 lines. These are too long to scan in one pass. A new developer working on a bug has to read the entire file before finding what they need.

---

### Problem 4: Inline Styles Are Everywhere

```tsx
// ❌ Inline style strings scattered throughout
<div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
```

This is not reusable, not searchable (you can't grep for flex layouts), and will drift inconsistently over time. Two developers will write `gap: 24` and `gap: '24px'` in different files and wonder why things look slightly different.

---

### Problem 5: No Error Handling Convention

Some queries silently return empty arrays on failure. Some throw. Some log to console. There's no predictable pattern.

---

## Part 3: The Target Structure

### What the Folder Layout Should Look Like

```
CP301/
├── db/                          ← Everything database (migrations, seeds)
│   ├── migrations/
│   ├── seeds/
│   └── README.md
│
├── src/
│   ├── app/                     ← ONLY routing and page assembly
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx   ← Thin: imports <LoginForm />, returns it. That's it.
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         ← Thin: imports <FeedPage />, returns it.
│   │   │   ├── blogs/
│   │   │   │   ├── page.tsx     ← Thin shell
│   │   │   │   ├── [slug]/page.tsx
│   │   │   │   └── create/page.tsx
│   │   │   └── ... (other routes)
│   │   └── globals.css
│   │
│   ├── components/              ← All reusable UI pieces
│   │   ├── ui/                  ← Generic building blocks (no domain logic)
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterPills.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   └── index.ts         ← re-export all
│   │   │
│   │   ├── layout/              ← App structure components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageContainer.tsx
│   │   │
│   │   └── features/            ← Domain-specific components (each feature owns its UI)
│   │       ├── blogs/
│   │       │   ├── BlogCard.tsx
│   │       │   ├── BlogList.tsx
│   │       │   ├── BlogFilters.tsx
│   │       │   └── BlogForm.tsx
│   │       ├── events/
│   │       │   ├── EventCard.tsx
│   │       │   ├── EventList.tsx
│   │       │   └── EventFilters.tsx
│   │       ├── marketplace/
│   │       │   ├── ItemCard.tsx
│   │       │   ├── ItemList.tsx
│   │       │   └── ItemForm.tsx
│   │       └── ... (one folder per feature)
│   │
│   ├── lib/
│   │   ├── db/                  ← ALL database queries (see DB_GUIDE.md)
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
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/               ← Reusable React hooks (data + behaviour)
│   │   │   ├── useBlogs.ts
│   │   │   ├── useEvents.ts
│   │   │   ├── useMarketplace.ts
│   │   │   └── useNotifications.ts
│   │   │
│   │   ├── types.ts             ← All TypeScript types (already good)
│   │   └── utils.ts             ← Pure helper functions (formatting, validation)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx      ← Already good — keep as-is
│   │
│   └── middleware.ts
│
├── docs/                        ← Project documentation
│   ├── SRS.md
│   ├── SCALABILITY.md
│   ├── DB_GUIDE.md
│   ├── SE_COURSE_MAPPING.md
│   └── CODING_STANDARDS.md     ← This file
│
├── .env.local                   ← Local secrets (never commit)
├── .env.example                 ← Template showing which env vars are needed (commit this)
├── next.config.js
├── package.json
└── README.md
```

---

## Part 4: The Key Patterns to Adopt

### Pattern 1: Thin Pages, Fat Components

Pages should do **one thing**: assemble the right components and pass them data. All logic goes into custom hooks or feature components.

```tsx
// ✅ Target pattern for src/app/(dashboard)/blogs/page.tsx
// This entire file should be ~20 lines.

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

All filtering, data fetching, and state management moves into `<BlogList />`.

---

### Pattern 2: Custom Hooks for All Data Fetching

A **custom hook** separates the "how do I get data" question from the "how do I display data" question. Every future developer knows exactly where to look.

```ts
// src/lib/hooks/useBlogs.ts
import { useState, useEffect } from 'react'
import { getPublishedBlogs } from '@/lib/db'
import type { BlogPost } from '@/lib/types'

interface UseBlogsOptions {
  category?: string
  limit?: number
}

export function useBlogs({ category, limit = 20 }: UseBlogsOptions = {}) {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getPublishedBlogs(category, limit)
        setBlogs(data)
      } catch (err) {
        setError('Failed to load blogs. Please try again.')
        console.error('[useBlogs]', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [category, limit])

  return { blogs, loading, error }
}
```

Now the component using it is clean:

```tsx
// src/components/features/blogs/BlogList.tsx
import { useBlogs } from '@/lib/hooks/useBlogs'
import { BlogCard } from './BlogCard'
import { SkeletonCard, EmptyState, FilterPills } from '@/components/ui'
import { useState } from 'react'

const CATEGORIES = ['all', 'placement', 'internship', 'research', 'alumni_experience', 'general']

export function BlogList() {
  const [category, setCategory] = useState('all')
  const { blogs, loading, error } = useBlogs({ category })

  if (error) return <EmptyState icon="⚠️" message={error} />

  return (
    <div>
      <FilterPills options={CATEGORIES} active={category} onChange={setCategory} />
      {loading
        ? <div className="grid-3">{[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}</div>
        : blogs.length === 0
          ? <EmptyState icon="📝" message="No blogs found." />
          : <div className="grid-3">{blogs.map(b => <BlogCard key={b.id} blog={b} />)}</div>
      }
    </div>
  )
}
```

Now a new developer can find the right file immediately:
- "The card looks wrong" → `BlogCard.tsx`
- "The filter doesn't work" → `BlogList.tsx` or `useBlogs.ts`
- "The wrong data is fetched" → `src/lib/db/blogs.ts`

---

### Pattern 3: Build a Small UI Component Library

Instead of rewriting `<div className="skeleton skeleton-text" />` in every file, build it once in `src/components/ui/`.

```tsx
// src/components/ui/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="glass-card-static">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
    </div>
  )
}

// src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: string
  message: string
  description?: string
}
export function EmptyState({ icon, message, description }: EmptyStateProps) {
  return (
    <div className="glass-card-static empty-state">
      <span style={{ fontSize: '2.5rem' }}>{icon}</span>
      <h3>{message}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}

// src/components/ui/FilterPills.tsx
interface FilterPillsProps {
  options: string[]
  active: string
  onChange: (value: string) => void
  labels?: Record<string, string>  // optional display label override
}
export function FilterPills({ options, active, onChange, labels }: FilterPillsProps) {
  return (
    <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt}
          className={`btn btn-sm ${active === opt ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onChange(opt)}
        >
          {labels?.[opt] ?? opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  )
}

// src/components/ui/SearchBar.tsx
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}
export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="search-bar">
      {/* Search icon */}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

// src/components/ui/index.ts — single export for all UI components
export { SkeletonCard } from './SkeletonCard'
export { EmptyState } from './EmptyState'
export { FilterPills } from './FilterPills'
export { SearchBar } from './SearchBar'
export { Badge } from './Badge'
export { Card } from './Card'
```

Benefits:
- Change `SkeletonCard` once → all 14 pages update.
- New developer building a new page types `import { } from '@/components/ui'` and has all tools available.

---

### Pattern 4: Consistent Error Handling

Every function that calls the database should follow the same contract: return data or throw a descriptive error. Never silently return empty.

```ts
// src/lib/db/blogs.ts

// ✅ Consistent error pattern
export async function getPublishedBlogs(category?: string, limit = 20): Promise<BlogPost[]> {
  const { data, error } = await db
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, published_at, author:users(full_name, role)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    // ✅ Descriptive error — includes function name and the DB error
    throw new Error(`[getPublishedBlogs] ${error.message}`)
  }

  return (data ?? []) as BlogPost[]
}
```

```ts
// ✅ In the hook — error is caught in one place, shown to user cleanly
try {
  const data = await getPublishedBlogs(category)
  setBlogs(data)
} catch (err) {
  setError('Failed to load blogs. Please try again.')
  console.error(err)  // Full technical error goes to console for debugging
}
```

New developer rule: **always `try/catch` hook calls, never trust silent empty returns.**

---

### Pattern 5: Named CSS Classes Over Inline Styles

Replace every repeating inline style with a class in `globals.css`.

```tsx
// ❌ Inline styles — not reusable, not searchable
<div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>

// ✅ Named class — one change in CSS updates everywhere
<div className="filter-row">
```

```css
/* globals.css */
.filter-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}
```

Spacing values should come from CSS variables. Add this to `globals.css`:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
}
```

---

### Pattern 6: Utility Functions in One Place

Small pure functions that are used across pages (formatting dates, truncating strings, generating initials) should all live in `src/lib/utils.ts`. Never write the same formatting logic twice.

```ts
// src/lib/utils.ts

/** Returns initials from a full name. "Arjun Sharma" → "AS" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Truncates a string to maxLength, adds ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/** Returns a price formatted in Indian Rupees. 1500 → "₹1,500" */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

/** Maps a role string to a display label. */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    student: 'Student',
    faculty: 'Faculty',
    staff: 'Staff',
    alumni: 'Alumni',
    guest: 'Guest',
  }
  return labels[role] ?? role
}
```

---

### Pattern 7: Naming Conventions (The Golden Rules)

A new developer should be able to guess a file's name before opening it.

| Thing Being Named | Convention | Example |
|---|---|---|
| **React components** | PascalCase | `BlogCard.tsx`, `EventForm.tsx` |
| **Hooks** | camelCase, starts with `use` | `useBlogs.ts`, `useAuth.ts` |
| **DB query files** | camelCase, matches domain | `blogs.ts`, `events.ts` |
| **Utility functions** | camelCase, verb + noun | `getInitials()`, `formatPrice()` |
| **CSS classes** | kebab-case | `.blog-card`, `.filter-row` |
| **Constants** | UPPER_SNAKE_CASE | `const MAX_ITEMS = 20` |
| **TypeScript types/interfaces** | PascalCase | `BlogPost`, `EventType` |
| **Database tables** | snake_case (already correct) | `blog_posts`, `lost_found_items` |
| **Page files** | Always `page.tsx` | As required by Next.js App Router |
| **Migration files** | Number + snake_case | `003_add_rls_policies.sql` |

---

### Pattern 8: Every Component Needs a Single Clear Job

Before writing a component, ask: **What is this one component responsible for?**

| Component | Its ONE job |
|---|---|
| `BlogCard.tsx` | Display one blog's preview info |
| `BlogList.tsx` | Fetch + filter + display a list of blogs |
| `BlogPage` (page.tsx) | Lay out the page structure |
| `SearchBar.tsx` | Accept text input, notify parent of changes |
| `FilterPills.tsx` | Show a list of filter options, notify parent of selection |
| `useBlogs.ts` | Fetch blog data from the DB, manage loading/error state |
| `blogs.ts` (in db/) | Execute the raw DB query with correct columns |

If you can't write your component's "one job" in one sentence, it's doing too much. Split it.

---

## Part 5: Commenting Standards

Code comments should explain **why**, not **what**. The code itself shows what. Comments are for things that code cannot express.

```tsx
// ❌ Useless comment — just restates the code
// Set loading to true
setLoading(true)

// ✅ Useful comment — explains a non-obvious decision
// We fetch 20 extra items here because ~30% are filtered out client-side
// by the search query. This avoids a second network request on typing.
const FETCH_LIMIT = 30

// ✅ Useful comment — explains an IIT Ropar specific rule
// ISMP events target the incoming batch (e.g., 2028 for freshers in 2024).
// The batch year is the graduation year, so incoming 2024 batch = 2028.
if (event.type === 'ismp') {
  filter.batch = graduationYear(currentYear + 4)
}
```

Add a **file-level JSDoc comment** to every file in `src/lib/db/`:

```ts
/**
 * @file blogs.ts
 * @description Database query functions for the blog_posts table.
 * Import from '@/lib/db', not from this file directly.
 *
 * Tables used: blog_posts, users (for author join)
 */
```

---

## Part 6: The `.env.example` File

The `.env` file contains secrets (API keys) and is in `.gitignore`. New developers who clone the repo have no idea what environment variables are needed. Fix this by adding `.env.example`:

```bash
# .env.example — Copy this to .env.local and fill in real values.
# Never commit .env.local to git.

# Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase service role key (server-side only — never expose to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Commit this file. Anyone cloning the repo sees exactly what they need.

---

## Part 7: The `README.md` Standard

The project `README.md` should answer these questions in order:

```markdown
# IIT Ropar Community Platform

## What is this?
One paragraph explaining the project.

## Tech Stack
Table of languages, frameworks, services.

## Prerequisites
- Node.js 20+
- A Supabase project (free tier is fine for dev)

## Setup (should work in under 10 minutes)
1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase keys
4. Run DB migrations: `psql $DATABASE_URL -f db/migrations/001_initial_schema.sql`
5. Run seeds: `psql $DATABASE_URL -f db/seeds/01_locations.sql`
6. `npm run dev`

## Project Structure
Brief explanation of what lives where (link to this CODING_STANDARDS.md).

## Adding a New Feature
Step-by-step guide: create the DB query → create the hook → create the component → add the route.

## Docs
- SRS.md — Full requirements specification
- SCALABILITY.md — Performance guide
- DB_GUIDE.md — Database practices
```

---

## Part 8: Quick Reference Checklist

When writing any new feature, check every box before considering it done:

```
Before writing a single line of code:
[ ] Does a DB query file exist for this domain? (src/lib/db/domain.ts)
[ ] Is there a hook for this data? (src/lib/hooks/useDomain.ts)

When writing query functions:
[ ] Am I using explicit column selection, not select('*')?
[ ] Does the function throw a descriptive error on failure?
[ ] Is the function name a verb + noun? (getEvents, createBlog)

When writing components:
[ ] Does this component have ONE clear job?
[ ] If it's more than ~80 lines, should I split it?
[ ] Am I using components from src/components/ui/ for common UI?
[ ] Am I using CSS classes instead of inline styles where possible?
[ ] Have I used utils.ts functions instead of writing formatting inline?

When writing a page:
[ ] Is the page file thin? (~20 lines, just assembles components)
[ ] Does it import from @/lib/db (never directly from Supabase)?

Before committing:
[ ] Does npm run build pass without errors?
[ ] Are new environment variables added to .env.example?
[ ] If the DB schema changed, has a new migration file been created?
[ ] Is the new feature listed in SRS.md if it's significant?
```

---

## Part 9: Migration Priority (What to Do First)

If you were to start fixing the codebase today, here's the order that gives you the most improvement for the least effort:

| Priority | Task | Effort | Impact |
|---|---|---|---|
| 1 | Create `src/components/ui/` with SkeletonCard, EmptyState, FilterPills, SearchBar | 2 hours | Every page gets cleaner immediately |
| 2 | Create `src/lib/db/` query files (replace `select('*')`) | 1 day | Performance + portability |
| 3 | Create `src/lib/hooks/` for each domain | 1–2 days | Components become thin and readable |
| 4 | Add `.env.example` and update `README.md` | 30 minutes | Any new developer can start immediately |
| 5 | Replace inline styles with named CSS classes for repeated patterns | 2–3 hours | Visual consistency, easy global changes |
| 6 | Add `src/lib/utils.ts` and move repeated formatting logic there | 1 hour | No more duplicated `truncate()` and `getInitials()` logic |
| 7 | Slim down each `page.tsx` to use feature components | 1–2 days | Pages become 20-line files |
