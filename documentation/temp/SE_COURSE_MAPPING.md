# SE Course → Project Mapping

**Project:** IIT Ropar Community Platform (CP301)  
**Purpose:** Map every topic from your Software Engineering course to what actually exists in this codebase.

> Think of this doc as your study guide with real code to point at. Every theory concept from class has a living example right here.

---

## The Big Picture First

A standard college Software Engineering course teaches you **how to build software the right way** — from figuring out what to build, to designing it, to writing it, to testing it, to maintaining it. Everything you studied has been done (or needs to be done) in this project. Let's walk through each topic.

---

## 1. SDLC — Software Development Life Cycle

### What your course says
The SDLC is the full process from idea to running software. Main models:
- **Waterfall**: Sequential. Do requirements, then design, then code, then test, in strict order.
- **Agile**: Iterative. Build a small working piece, get feedback, improve, repeat.
- **Spiral**: Risk-driven iterations.

### What this project actually used
This project used **Agile** — specifically a lightweight version of it. Here's the evidence:

| Agile Practice | Where It Happened in This Project |
|---|---|
| **Iterative development** | The 3D campus map was built as a standalone HTML file first, then integrated into the Next.js dashboard in a later iteration. |
| **Working software over documentation** | The app was built module-by-module (blogs, then marketplace, then events...) rather than speccing everything upfront. |
| **Requirements that evolved** | The initial map page was just a placeholder list. User feedback prompted the 3D iframe integration. |
| **Short feedback loops** | Code was written, reviewed, and adjusted in the same conversation/session. |

**What Waterfall would have looked like instead:** Write all 670 lines of `SRS.md` first, freeze it, then start coding. That's not what happened — the SRS was written *after* most of the code existed, as a documentation exercise.

---

## 2. Requirements Engineering

### What your course says
Gathering, analysing, and documenting what a system must do. Produces two types:
- **Functional Requirements (FR)**: What the system *does*. ("User can create a blog post.")
- **Non-Functional Requirements (NFR)**: How well it does it. ("Page must load in under 2 seconds.")

Also covers:
- **SRS (Software Requirements Specification)**: The formal document.
- **Use Cases**: Who does what, step by step.

### What this project actually produced

**→ The `SRS.md` file in this project IS your SRS.**

Open it and you'll find:
- **Functional Requirements** documented as Use Cases (UC-B01, UC-E03, UC-MAP02, etc.)
- **Non-Functional Requirements** in Section 20 (performance, security, responsiveness, theming)
- Each module section follows a standard FR structure: Purpose → Use Cases → Features → Data fields

**Example from `SRS.md` — a proper Use Case:**
```
UC-LF01: A student loses their student ID card near the SAB.
They report it: item_name = "Student ID Card",
category = documents, location = "SAB Ground Floor",
date = today, contact_info = "9876543210".
```

This is a **use case** in exactly the format your course teaches: Actor + Goal + Steps.

**The two requirement types in this project:**

| Type | Example from the Project |
|---|---|
| Functional | "Users can filter events by type: ISMP, Workshop, Cultural, Sports" |
| Functional | "Notices marked `is_pinned = true` always appear at the top" |
| Non-Functional | "All list pages use `.limit(50)` to avoid large payloads" |
| Non-Functional | "Protected routes redirect unauthenticated users server-side" |
| Non-Functional | "Dark theme only, background color `#0a0a0f`" |

---

## 3. System Design — Architecture

### What your course says
Before writing code, you design the *structure* of the system. This includes:
- **High-Level Design (HLD)**: The big boxes and arrows — which components exist and how they talk.
- **Low-Level Design (LLD)**: The details inside each box — class structures, functions, data flow.
- **Architecture Patterns**: Layered, Client-Server, MVC, Microservices, etc.

### What this project uses

**Architecture Pattern: Layered Architecture (also called N-Tier)**

```
Presentation Layer    →  React components (src/app/(dashboard)/)
Business Logic Layer  →  Page-level functions (loadBlogs(), loadEvents())
Data Access Layer     →  Supabase client queries (src/lib/supabase.ts)
Database Layer        →  Supabase PostgreSQL (remote)
```

This is a classic **3-tier web architecture**:
- Tier 1 (Frontend): Next.js running in the browser
- Tier 2 (Backend/API): Supabase PostgREST (auto-generated REST API)
- Tier 3 (Data): PostgreSQL database

**The Architecture Diagram from `SCALABILITY.md`:**
```
User Browser
    │
    ▼
Vercel CDN (Next.js)       ← Presentation + Business Logic Tier
    │
    ▼
Supabase (PostgreSQL)      ← Data Access + Database Tier
```

**The MVC Pattern** is present inside the Next.js layer:
- **Model**: `src/lib/types.ts` (data definitions like `BlogPost`, `Event`, `User`)
- **View**: The TSX components inside `src/app/(dashboard)/*/page.tsx`
- **Controller**: The state + event handler functions inside each page component

---

## 4. UML Diagrams

### What your course says
Unified Modelling Language — standard visual notation for software design. Key diagrams:
- **Use Case Diagram**: Actors and what they can do.
- **Class Diagram**: How data is structured and related.
- **Sequence Diagram**: How components interact over time for one operation.
- **ER Diagram**: Database tables and their relationships.
- **Component Diagram**: How code modules depend on each other.

### Mapped to this project

**Use Case Diagram (conceptual from SRS.md)**
```
         ┌─────────────────────────────────────────────────┐
         │             IIT Ropar Platform                  │
         │                                                  │
Student──┼──► Write Blog, Browse Marketplace,              │
         │    Report Lost Item, Join Community              │
         │                                                  │
Faculty──┼──► Post Notice, Create Event (ISMP/Seminar)     │
         │                                                  │
Alumni───┼──► Write Alumni Blog, Browse Marketplace        │
         │                                                  │
All──────┼──► View Feed, Search Campus Map, View Clubs     │
         └─────────────────────────────────────────────────┘
```

**ER Diagram (from the schema in `SRS.md`, Section 19)**

The major relationships:
```
users ────────< blog_posts          (one user writes many blogs)
users ────────< marketplace_items   (one user sells many items)
users ────────< lost_found_items    (one user reports many items)
users >───────< communities         (many-to-many via community_members)
users ────────< notifications       (one user has many notifications)
conversations < messages            (one conversation has many messages)
events ───────> locations           (event references a location)
```

**Sequence Diagram — Login Flow:**
```
User      Browser        Next.js Middleware    Supabase Auth    Database
 │           │                  │                   │              │
 │──POST /login──────────────►  │                   │              │
 │           │                  │──signInWithPassword►             │
 │           │                  │                   │──check user──►
 │           │                  │                   │◄─user exists─│
 │           │                  │◄──JWT token────────│              │
 │           │─◄──Set cookie──  │                   │              │
 │◄──redirect to /─────────────│                   │              │
```

**Component Diagram — Frontend:**
```
AuthContext (global state)
      │
      ├── Sidebar (navigation)
      ├── Header (search, notifications)
      └── Page Components
              ├── BlogsPage → [getPublishedBlogs()]
              ├── EventsPage → [getEvents()]
              ├── MapPage → [getLocations() + 3D iframe]
              └── ... (11 more pages)
```

---

## 5. Software Design Patterns

### What your course says
Reusable solutions to common design problems. Key ones taught:
- **Singleton**: One instance of something shared everywhere.
- **Observer**: Notify many subscribers when something changes.
- **Factory**: Create objects without specifying their exact class.
- **Repository**: Abstract data access behind an interface.
- **Facade**: Provide a simple interface to a complex subsystem.

### What this project actually uses

| Design Pattern | Where It Appears |
|---|---|
| **Singleton** | The Supabase client `createClient()` — one client instance reused everywhere in the app. |
| **Observer** | `AuthContext` uses `supabase.auth.onAuthStateChange()` — subscribers are notified when login state changes. Every component using `useAuth()` is an observer. |
| **Repository** | `src/lib/db/*.ts` (from `DB_GUIDE.md`) — all queries behind named functions like `getPublishedBlogs()`. Components don't interact with the database directly. |
| **Facade** | `src/lib/db/index.ts` — exposes a clean interface (`import { getPublishedBlogs } from '@/lib/db'`) hiding all Supabase complexity. |
| **Provider/Context** | `AuthProvider` wrapping the app — the React Context API is a variant of the Observer pattern. |

---

## 6. Database Design & Normalisation

### What your course says
- **ER Modelling**: Entities, attributes, relationships.
- **Normalisation**: 1NF, 2NF, 3NF — remove redundancy, ensure consistency.
- **Indexes**: Speed up queries.
- **Transactions**: ACID properties.

### What this project actually does

**Normalisation:**
The database schema in `SRS.md` Section 19 is in **3rd Normal Form (3NF)**:
- Each table has a single primary key (`id` UUID).
- No repeating groups (each column stores one value).
- Non-key columns depend only on the primary key.
- Related data is linked by foreign keys, not duplicated.

**Example of 3NF in this schema:**
```
❌ De-normalised (what NOT to do):
blog_posts: id, title, author_name, author_department, author_role, content...
           (author info is repeated for every blog → violates 3NF)

✅ Normalised (what this project does):
blog_posts: id, title, author_id, content...   ← no author data here
users:      id, full_name, department, role...  ← author data lives here once
-- Join at query time: .select('*, author:users(full_name, role)')
```

**Indexes** (from `SCALABILITY.md` and `DB_GUIDE.md`):
- Index on `blog_posts.category` → speeds up the `WHERE category = 'placement'` filter.
- Index on `events.start_time` → speeds up the upcoming events sort.
- Composite index on `notifications(user_id, is_read)` → fast per-user notification queries.

**ACID Transactions** happen automatically in Supabase for most operations. PostgreSQL guarantees Atomicity (all-or-nothing), Consistency, Isolation, and Durability by default.

---

## 7. Software Testing

### What your course says
Types of testing:
- **Unit Testing**: Test one function in isolation.
- **Integration Testing**: Test how modules work together.
- **System Testing**: Test the entire system end-to-end.
- **User Acceptance Testing (UAT)**: Real users validate the system.
- **Regression Testing**: Ensure new changes don't break old behaviour.

### Current state in this project

| Testing Type | Current Status | What to Do |
|---|---|---|
| Unit Testing | ❌ Not implemented | Add `jest` + `@testing-library/react`. Test query functions from `src/lib/db/*.ts`. |
| Integration Testing | ❌ Not implemented | Test full page flows (e.g., login → view feed → create blog) using Playwright. |
| System Testing | ⚠️ Manual only | Currently done by running `npm run dev` and clicking through manually. |
| UAT | ⚠️ Future | Show the running app to real IIT Ropar students and faculty for feedback. |
| Regression Testing | ❌ Not implemented | Would require automated tests first. |

**What a Unit Test would look like (using Jest):**
```ts
// src/lib/db/blogs.test.ts
import { getPublishedBlogs } from './blogs'

test('returns only published blogs', async () => {
  const blogs = await getPublishedBlogs()
  expect(blogs.every(b => b.status === 'published')).toBe(true)
})

test('filters correctly by category', async () => {
  const blogs = await getPublishedBlogs('placement')
  expect(blogs.every(b => b.category === 'placement')).toBe(true)
})
```

---

## 8. Software Configuration Management (SCM)

### What your course says
Managing changes to code over time:
- **Version Control**: Git, branches, commits.
- **Baselines**: Stable snapshots of the code.
- **Change Control**: Reviewing and approving changes before they go in.
- **Build Management**: Consistently building and deploying the product.

### What this project does

| SCM Concept | How It's Done in This Project |
|---|---|
| **Version Control** | Git repository at `c:\Users\hrai1\WORK-DRIVE\DEP\CP301` |
| **Database versioning** | `db/migrations/` numbered files — every schema change is tracked |
| **Environment separation** | `.env` file for secrets, separate dev/prod Supabase projects |
| **Build Management** | `npm run build` → Next.js compiles TypeScript, optimises bundles |
| **Deployment** | Vercel connects to the Git repo, auto-deploys on every push to `main` |

The `DB_GUIDE.md` migration system is *database SCM* — applying the same version-control thinking to schema changes that Git applies to code changes.

---

## 9. Software Project Management

### What your course says
- **Effort estimation**: COCOMO model, function points.
- **Project scheduling**: Gantt charts, critical path.
- **Risk management**: Identify, analyse, and mitigate risks.

### What this project maps to

**Risk Management (from the project):**

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase goes down or prices change | Medium | High | DB abstraction layer (`src/lib/db/client.ts`) allows provider swap |
| Database query performance degrades | High | Medium | Indexes + explicit column selection (`SCALABILITY.md`) |
| Security breach via missing RLS | High | Critical | RLS policies migration (`db/migrations/003_rls.sql`) |
| Data loss with no schema history | High | Critical | Migration files in `db/migrations/` checked into Git |

**Effort Estimation for the Remaining Work:**

| Task | Estimate |
|---|---|
| Add database indexes | 30 minutes |
| Write RLS policies | 2–3 days |
| Fix all `select('*')` queries | 1 day |
| Wire up Realtime messaging | Half a day |
| Add notification triggers | 1–2 days |
| Build feed post creation UI | 1 day |
| **Total to production-ready** | **~2 weeks** |

---

## 10. Software Maintenance & Evolution

### What your course says
Most software effort (60–80%) is spent in maintenance, not initial development:
- **Corrective maintenance**: Fixing bugs.
- **Adaptive maintenance**: Updating for new environments.
- **Perfective maintenance**: Improving performance or adding features.
- **Preventive maintenance**: Restructuring to avoid future problems.

### How this project is structured for maintainability

| Maintenance Type | How This Project Handles It |
|---|---|
| **Corrective** | Descriptive function names + TypeScript types catch bugs at compile time. `select()` failures throw typed errors. |
| **Adaptive** | Moving to a new DB provider = change one file (`client.ts`). Documented in `DB_GUIDE.md`. |
| **Perfective** | `SCALABILITY.md` provides a clear roadmap of what to optimise and how. |
| **Preventive** | Migration files, RLS policies, DB abstraction layer are all preventive measures. |

---

## Summary: Course Topics Covered by This Project

| SE Course Topic | Coverage in This Project |
|---|---|
| SDLC / Agile | ✅ Agile approach — iterative, module-by-module |
| Requirements Engineering / SRS | ✅ `SRS.md` — full SRS with FRs, NFRs, and Use Cases |
| Use Case Modelling | ✅ 40+ named use cases across all 14 modules |
| High-Level Architecture Design | ✅ Layered architecture, 3-tier web model |
| Design Patterns (MVC, Singleton, Observer, Repository) | ✅ All present in the codebase |
| ER Modelling & Database Design | ✅ 16 normalised tables, foreign keys, documented |
| Normalisation (3NF) | ✅ All tables are in 3NF |
| Indexing & Query Optimisation | ✅ Documented + partially implemented |
| Security (Auth, RLS, Access Control) | ✅ Designed; RLS needs to be applied |
| Configuration Management / Version Control | ✅ Git + migration-based DB tracking |
| Risk Management | ✅ Identified and mitigated in `SCALABILITY.md` and `DB_GUIDE.md` |
| Software Testing | ❌ Not yet implemented — a clear gap |
| Project Management / Effort Estimation | ⚠️ Informal estimates in docs, no formal Gantt/COCOMO |
| Software Maintenance | ✅ Designed for maintainability via abstraction + docs |
